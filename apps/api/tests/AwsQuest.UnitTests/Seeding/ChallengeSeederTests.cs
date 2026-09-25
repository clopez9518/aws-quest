namespace AwsQuest.UnitTests.Seeding;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class ChallengeSeederTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static string FindContentDirectory()
    {
        var current = AppContext.BaseDirectory;
        while (!string.IsNullOrEmpty(current))
        {
            var candidate = Path.Combine(current, "content");
            if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "system-config.json")))
            {
                return candidate;
            }
            var parent = Directory.GetParent(current);
            if (parent == null) break;
            current = parent.FullName;
        }
        return Path.Combine(AppContext.BaseDirectory, "content");
    }

    [Fact]
    public async Task SeedAsync_WhenCalledFirstTime_ShouldPopulateDatabaseCorrectly()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var contentReader = new JsonChallengeContentReader();
        var contentPath = FindContentDirectory();

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["Content:Path"] = contentPath
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var seeder = new ChallengeSeeder(context, contentReader, configuration, NullLogger<ChallengeSeeder>.Instance);

        // Act
        await seeder.SeedAsync();

        // Assert
        var config = await context.SystemConfigs.FirstOrDefaultAsync();
        config.Should().NotBeNull();
        config!.AccessMode.Should().Be(AccessMode.OpenAccess);

        var servicesCount = await context.AwsServices.CountAsync();
        servicesCount.Should().Be(32);

        var vpcService = await context.AwsServices.FirstOrDefaultAsync(s => s.Code == "NET_VPC");
        vpcService.Should().NotBeNull();
        vpcService!.Kind.Should().Be(ResourceKind.NetworkInfrastructure);
        vpcService.PlacementScope.Should().Be(PlacementScope.VpcRoot);

        var subnetService = await context.AwsServices.FirstOrDefaultAsync(s => s.Code == "NET_SUBNET");
        subnetService.Should().NotBeNull();
        subnetService!.Kind.Should().Be(ResourceKind.NetworkInfrastructure);
        subnetService.PlacementScope.Should().Be(PlacementScope.VpcAttached);

        var rdsService = await context.AwsServices.FirstOrDefaultAsync(s => s.Code == "AWS_RDS");
        rdsService.Should().NotBeNull();
        rdsService!.Kind.Should().Be(ResourceKind.ManagedService);
        rdsService.PlacementScope.Should().Be(PlacementScope.SubnetRequired);

        var unitsCount = await context.Units.CountAsync();
        unitsCount.Should().Be(12);

        var challengesCount = await context.Challenges.CountAsync();
        challengesCount.Should().Be(49);

        var challengeServicesCount = await context.ChallengeServices.CountAsync();
        challengeServicesCount.Should().BeGreaterThanOrEqualTo(49);

        var challenge502 = await context.Challenges
            .Include(c => c.AllowedServices)
            .ThenInclude(cs => cs.Service)
            .FirstOrDefaultAsync(c => c.Title.Contains("ALB"));

        challenge502.Should().NotBeNull();
        challenge502!.EvaluationRulesJson.Should().Contain("AWS_ALB");
        challenge502.HintsJson.Should().Contain("penaltyPoints");
        challenge502.AllowedServices.Should().HaveCountGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task SeedAsync_WhenCalledMultipleTimes_ShouldBeIdempotent()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var contentReader = new JsonChallengeContentReader();
        var contentPath = FindContentDirectory();

        var inMemorySettings = new Dictionary<string, string?>
        {
            ["Content:Path"] = contentPath
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var seeder = new ChallengeSeeder(context, contentReader, configuration, NullLogger<ChallengeSeeder>.Instance);

        // Act - Primera ejecución
        await seeder.SeedAsync();
        var servicesCount1 = await context.AwsServices.CountAsync();
        var unitsCount1 = await context.Units.CountAsync();
        var challengesCount1 = await context.Challenges.CountAsync();

        // Act - Segunda ejecución (Idempotencia)
        await seeder.SeedAsync();
        var servicesCount2 = await context.AwsServices.CountAsync();
        var unitsCount2 = await context.Units.CountAsync();
        var challengesCount2 = await context.Challenges.CountAsync();

        // Assert
        servicesCount2.Should().Be(servicesCount1);
        unitsCount2.Should().Be(unitsCount1);
        challengesCount2.Should().Be(challengesCount1);
    }
}
