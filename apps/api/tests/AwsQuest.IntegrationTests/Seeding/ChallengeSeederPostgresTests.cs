using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using Xunit;

namespace AwsQuest.IntegrationTests.Seeding;

[Collection("DatabaseCollection")]
public class ChallengeSeederPostgresTests
{
    private readonly string _connectionString;

    public ChallengeSeederPostgresTests()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        _connectionString = config.GetConnectionString("DefaultConnection") 
            ?? "Host=127.0.0.1;Port=5437;Database=awsquest_db;Username=postgres;Password=postgres;Include Error Detail=true";
    }

    private AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_connectionString)
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task SeedAsync_Should_Synchronize_All_Declarative_Data_To_PostgreSql_And_Be_Idempotent()
    {
        // Arrange
        using var context = CreateDbContext();
        await context.Database.MigrateAsync();

        var reader = new JsonChallengeContentReader();
        var config = new ConfigurationBuilder().Build();
        var logger = Microsoft.Extensions.Logging.Abstractions.NullLogger<ChallengeSeeder>.Instance;
        var seeder = new ChallengeSeeder(context, reader, config, logger);

        // Act - First Execution (Seed)
        await seeder.SeedAsync();

        // Assert - Verify PostgreSQL has all expected data
        var systemConfig = await context.SystemConfigs.FirstOrDefaultAsync();
        systemConfig.Should().NotBeNull();
        systemConfig!.AccessMode.Should().Be(AccessMode.OpenAccess);

        var services = await context.AwsServices.ToListAsync();
        services.Should().NotBeEmpty();
        services.Count.Should().BeGreaterThanOrEqualTo(4);
        services.Should().Contain(s => s.Code == "AWS_S3");
        services.Should().Contain(s => s.Code == "AWS_EC2");
        services.Should().Contain(s => s.Code == "AWS_RDS");
        services.Should().Contain(s => s.Code == "AWS_ALB");

        var units = await context.Units.Include(u => u.Challenges).ToListAsync();
        units.Should().NotBeEmpty();
        units.Count.Should().BeGreaterThanOrEqualTo(2);
        units.Should().Contain(u => u.OrderIndex == 1);
        units.Should().Contain(u => u.OrderIndex == 2);

        var challenges = await context.Challenges.Include(c => c.AllowedServices).ToListAsync();
        challenges.Should().NotBeEmpty();
        challenges.Count.Should().BeGreaterThanOrEqualTo(2);
        challenges.Should().Contain(c => c.Difficulty == DifficultyLevel.Easy);
        challenges.Should().Contain(c => c.Difficulty == DifficultyLevel.Intermediate);

        var challengeServices = await context.ChallengeServices.ToListAsync();
        challengeServices.Should().NotBeEmpty();

        // Act - Second Execution (Verify Idempotency)
        var actSecondRun = async () => await seeder.SeedAsync();
        await actSecondRun.Should().NotThrowAsync();

        // Assert - Data counts remain exact without duplicate key errors
        var servicesAfter = await context.AwsServices.CountAsync();
        var unitsAfter = await context.Units.CountAsync();
        var challengesAfter = await context.Challenges.CountAsync();

        servicesAfter.Should().Be(services.Count);
        unitsAfter.Should().Be(units.Count);
        challengesAfter.Should().Be(challenges.Count);
    }
}
