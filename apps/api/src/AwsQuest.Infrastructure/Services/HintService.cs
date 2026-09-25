namespace AwsQuest.Infrastructure.Services;

using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class HintService : IHintService
{
    private readonly IAppDbContext _dbContext;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public HintService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UnlockHintResponseDto> UnlockNextHintAsync(Guid challengeId, Guid userId, CancellationToken cancellationToken = default)
    {
        // 1. Cargar desafío
        var challenge = await _dbContext.Challenges
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == challengeId, cancellationToken);

        if (challenge == null)
        {
            throw new ChallengeNotFoundException(challengeId);
        }

        // 2. Validar modo progresivo
        await EnsureChallengeUnlockedAsync(challenge, userId, cancellationToken);

        // 3. Deserializar definiciones de pistas
        var hintsDefinitions = !string.IsNullOrWhiteSpace(challenge.HintsJson)
            ? JsonSerializer.Deserialize<List<HintDefinition>>(challenge.HintsJson, JsonOptions) ?? []
            : [];

        // 3. Obtener o inicializar registro de progreso
        var progress = await _dbContext.UserProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

        if (progress == null)
        {
            progress = new UserProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ChallengeId = challengeId,
                Status = ProgressStatus.InProgress,
                HighScore = 0,
                HintsUsed = 0,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.UserProgresses.Add(progress);
        }

        var nextIndex = progress.HintsUsed + 1;

        if (nextIndex > hintsDefinitions.Count)
        {
            throw new AllHintsUnlockedException();
        }

        var nextHint = hintsDefinitions.FirstOrDefault(h => h.OrderIndex == nextIndex)
            ?? throw new AllHintsUnlockedException();

        // 4. Actualizar estado y persistir
        progress.HintsUsed = nextIndex;
        progress.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var totalPenalty = hintsDefinitions
            .Where(h => h.OrderIndex <= nextIndex)
            .Sum(h => h.PenaltyPoints);

        return new UnlockHintResponseDto
        {
            UnlockedHint = new UnlockedHintDto
            {
                OrderIndex = nextHint.OrderIndex,
                Text = nextHint.Text,
                PenaltyApplied = nextHint.PenaltyPoints
            },
            TotalHintsUnlocked = nextIndex,
            TotalPenaltyAccumulated = totalPenalty
        };
    }

    private async Task EnsureChallengeUnlockedAsync(Challenge challenge, Guid userId, CancellationToken cancellationToken)
    {
        var config = await _dbContext.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);

        var accessMode = config?.AccessMode ?? AccessMode.OpenAccess;
        if (accessMode == AccessMode.Progressive)
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            var userTotalXp = user?.TotalXP ?? 0;

            if (challenge.PrerequisiteChallengeId.HasValue)
            {
                var prereqCompleted = await _dbContext.UserProgresses
                    .AsNoTracking()
                    .AnyAsync(p => p.UserId == userId 
                                && p.ChallengeId == challenge.PrerequisiteChallengeId.Value 
                                && p.Status == ProgressStatus.Completed, cancellationToken);

                if (!prereqCompleted)
                {
                    var prereqChallenge = await _dbContext.Challenges
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == challenge.PrerequisiteChallengeId.Value, cancellationToken);

                    var prereqTitle = prereqChallenge?.Title ?? "anterior";
                    throw new ChallengeLockedException($"El desafío está bloqueado. Requiere completar el desafío '{prereqTitle}'.");
                }
            }

            if (challenge.RequiredXP > 0 && userTotalXp < challenge.RequiredXP)
            {
                throw new ChallengeLockedException($"El desafío está bloqueado. Requiere {challenge.RequiredXP} XP (Actual: {userTotalXp} XP).");
            }
        }
    }
}
