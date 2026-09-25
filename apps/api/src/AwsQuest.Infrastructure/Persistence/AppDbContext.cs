
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Domain.Entities;

namespace AwsQuest.Infrastructure.Persistence;
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<AwsService> AwsServices => Set<AwsService>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeService> ChallengeServices => Set<ChallengeService>();
    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();
    public DbSet<ChallengeAttempt> ChallengeAttempts => Set<ChallengeAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
