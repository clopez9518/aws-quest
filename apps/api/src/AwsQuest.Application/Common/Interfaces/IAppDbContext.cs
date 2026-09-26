namespace AwsQuest.Application.Common.Interfaces;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using AwsQuest.Domain.Entities;

public interface IAppDbContext
{
    DbSet<SystemConfig> SystemConfigs { get; }
    DbSet<User> Users { get; }
    DbSet<Unit> Units { get; }
    DbSet<AwsService> AwsServices { get; }
    DbSet<Challenge> Challenges { get; }
    DbSet<ChallengeService> ChallengeServices { get; }
    DbSet<UserProgress> UserProgresses { get; }
    DbSet<ChallengeAttempt> ChallengeAttempts { get; }
    DbSet<DictionaryTerm> DictionaryTerms { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
