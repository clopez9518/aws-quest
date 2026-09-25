namespace AwsQuest.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class CatalogService : ICatalogService
{
    private readonly IAppDbContext _dbContext;

    public CatalogService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UnitResponseDto>> GetUnitsCatalogAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // 1. Obtener política global de acceso
        var config = await _dbContext.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);

        var accessMode = config?.AccessMode ?? AccessMode.OpenAccess;

        // 2. Obtener datos y progreso del usuario
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        var userTotalXp = user?.TotalXP ?? 0;

        var userProgressList = await _dbContext.UserProgresses
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        var progressMap = userProgressList.ToDictionary(p => p.ChallengeId);

        // 3. Obtener todas las unidades y desafíos
        var units = await _dbContext.Units
            .AsNoTracking()
            .Include(u => u.Challenges)
            .OrderBy(u => u.OrderIndex)
            .ToListAsync(cancellationToken);

        // Mapa de títulos para mensajes pedagógicos de bloqueo
        var challengeTitleMap = units
            .SelectMany(u => u.Challenges)
            .ToDictionary(c => c.Id, c => c.Title);

        // 4. Transformar jerarquía aplicando reglas de accesibilidad
        var result = new List<UnitResponseDto>();

        foreach (var unit in units)
        {
            var challengeDtos = new List<CatalogChallengeDto>();
            var orderedChallenges = unit.Challenges.OrderBy(c => c.OrderIndex).ToList();

            foreach (var challenge in orderedChallenges)
            {
                progressMap.TryGetValue(challenge.Id, out var progress);

                var (isLocked, lockReason) = EvaluateLockStatus(
                    challenge, 
                    accessMode, 
                    userTotalXp, 
                    progressMap, 
                    challengeTitleMap);

                challengeDtos.Add(challenge.ToCatalogDto(isLocked, lockReason, progress));
            }

            result.Add(new UnitResponseDto
            {
                Id = unit.Id,
                Title = unit.Title,
                Description = unit.Description,
                OrderIndex = unit.OrderIndex,
                Challenges = challengeDtos
            });
        }

        return result;
    }

    private static (bool IsLocked, string? LockReason) EvaluateLockStatus(
        Challenge challenge,
        AccessMode accessMode,
        int userTotalXp,
        Dictionary<Guid, UserProgress> progressMap,
        Dictionary<Guid, string> challengeTitleMap)
    {
        if (accessMode == AccessMode.OpenAccess)
        {
            return (false, null);
        }

        // Validación de Prerrequisito
        if (challenge.PrerequisiteChallengeId.HasValue)
        {
            var prereqId = challenge.PrerequisiteChallengeId.Value;
            var hasCompletedPrereq = progressMap.TryGetValue(prereqId, out var prereqProgress) 
                && prereqProgress.Status == ProgressStatus.Completed;

            if (!hasCompletedPrereq)
            {
                var prereqTitle = challengeTitleMap.TryGetValue(prereqId, out var title) 
                    ? title 
                    : "anterior";

                return (true, $"Requiere completar el desafío '{prereqTitle}'");
            }
        }

        // Validación de XP Requerido
        if (challenge.RequiredXP > 0 && userTotalXp < challenge.RequiredXP)
        {
            return (true, $"Requiere {challenge.RequiredXP} XP (Actual: {userTotalXp} XP)");
        }

        return (false, null);
    }
}
