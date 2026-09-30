namespace AwsQuest.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class ChallengeAccessValidator : IChallengeAccessValidator
{
    private readonly IAppDbContext _dbContext;

    public ChallengeAccessValidator(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task ValidateAccessAsync(Challenge challenge, Guid userId, CancellationToken cancellationToken = default)
    {
        var config = await _dbContext.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);

        var accessMode = config?.AccessMode ?? AccessMode.OpenAccess;
        if (accessMode != AccessMode.Progressive)
        {
            return;
        }

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
