namespace AwsQuest.Infrastructure.Services;

using FluentValidation;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class ChallengeService : IChallengeService
{
    private readonly IAppDbContext _dbContext;
    private readonly IChallengeAccessValidator _accessValidator;
    private readonly IValidator<SubmitReflectionAnswerRequestDto>? _reflectionValidator;

    public ChallengeService(
        IAppDbContext dbContext,
        IChallengeAccessValidator? accessValidator = null,
        IValidator<SubmitReflectionAnswerRequestDto>? reflectionValidator = null)
    {
        _dbContext = dbContext;
        _accessValidator = accessValidator ?? new ChallengeAccessValidator(dbContext);
        _reflectionValidator = reflectionValidator;
    }

    public async Task<ChallengeDetailResponseDto> GetChallengeDetailAsync(
        Guid challengeId, 
        Guid userId, 
        CancellationToken cancellationToken = default)
    {
        // 1. Cargar desafío con servicios asociados
        var challenge = await _dbContext.Challenges
            .AsNoTracking()
            .Include(c => c.AllowedServices)
                .ThenInclude(cs => cs.Service)
            .FirstOrDefaultAsync(c => c.Id == challengeId, cancellationToken);

        if (challenge == null)
        {
            throw new ChallengeNotFoundException(challengeId);
        }

        // 2. Verificar política de bloqueo en modo progresivo
        await _accessValidator.ValidateAccessAsync(challenge, userId, cancellationToken);

        // 3. Obtener progreso previo del usuario
        var progress = await _dbContext.UserProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

        // 4. Mapear y sanitizar pistas
        return challenge.ToDetailDto(progress);
    }

    private static readonly System.Text.Json.JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase) }
    };

    public async Task<SubmitReflectionAnswerResponseDto> SubmitReflectionAnswerAsync(
        Guid challengeId, 
        Guid userId, 
        SubmitReflectionAnswerRequestDto request, 
        CancellationToken cancellationToken = default)
    {
        if (_reflectionValidator != null)
        {
            await _reflectionValidator.ValidateAndThrowAsync(request, cancellationToken);
        }

        var challenge = await _dbContext.Challenges
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == challengeId, cancellationToken);

        if (challenge == null)
        {
            throw new ChallengeNotFoundException(challengeId);
        }

        if (string.IsNullOrWhiteSpace(challenge.ReflectionPromptJson))
        {
            throw new InvalidOperationException($"El desafío '{challenge.Title}' no posee un checkpoint de reflexión activa configurado.");
        }

        var prompt = System.Text.Json.JsonSerializer.Deserialize<AwsQuest.Domain.Engine.Models.ChallengeReflectionPrompt>(
            challenge.ReflectionPromptJson, 
            JsonOptions);

        if (prompt == null || prompt.Options.Count == 0)
        {
            throw new InvalidOperationException("No se pudieron cargar las opciones del checkpoint de reflexión.");
        }

        var selectedOption = prompt.Options.FirstOrDefault(o => o.Id == request.SelectedOptionId);
        if (selectedOption == null)
        {
            throw new InvalidOperationException($"La opción seleccionada '{request.SelectedOptionId}' no es válida para este desafío.");
        }

        var correctOption = prompt.Options.FirstOrDefault(o => o.IsCorrect) ?? prompt.Options.First();

        var strategy = _dbContext.Database.CreateExecutionStrategy();
        SubmitReflectionAnswerResponseDto response = null!;

        await strategy.ExecuteAsync(async () =>
        {
            var isRelational = _dbContext.Database.IsRelational();
            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
            if (isRelational)
            {
                transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            }

            try
            {
                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

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

                int bonusXpEarned = 0;
                var wasAlreadyCompleted = progress.ReflectionCompleted;

                if (selectedOption.IsCorrect && !wasAlreadyCompleted)
                {
                    bonusXpEarned = prompt.BonusXP > 0 ? prompt.BonusXP : 25;
                    progress.ReflectionCompleted = true;
                    user.TotalXP += bonusXpEarned;
                    user.Level = AwsQuest.Domain.Engine.Models.GameScoringRules.CalculateLevel(user.TotalXP);
                    user.UpdatedAt = DateTime.UtcNow;
                }

                progress.ReflectionSelectedOptionId = request.SelectedOptionId;
                progress.ReflectionAnsweredAt = DateTime.UtcNow;
                progress.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync(cancellationToken);

                if (transaction != null)
                {
                    await transaction.CommitAsync(cancellationToken);
                }

                response = new SubmitReflectionAnswerResponseDto
                {
                    IsCorrect = selectedOption.IsCorrect,
                    BonusXpEarned = bonusXpEarned,
                    Explanation = selectedOption.Explanation,
                    CorrectOptionId = correctOption.Id,
                    CurrentUserXP = user.TotalXP,
                    CurrentUserLevel = user.Level,
                    AllExplanations = prompt.Options.Select(o => new ReflectionOptionExplanationDto
                    {
                        Id = o.Id,
                        IsCorrect = o.IsCorrect,
                        Explanation = o.Explanation
                    }).ToList()
                };
            }
            catch
            {
                if (transaction != null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                }
                throw;
            }
        });

        return response;
    }
}
