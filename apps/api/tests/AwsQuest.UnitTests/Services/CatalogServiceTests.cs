namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Application.Mappings;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;

public class CatalogServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetUnitsCatalogAsync_InOpenAccessMode_AllChallengesAreUnlocked()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.OpenAccess,
            UpdatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = userId,
            Name = "Test Learner",
            TotalXP = 0,
            Level = 1
        });

        var unit = new Unit
        {
            Id = Guid.NewGuid(),
            Title = "Unidad 1: Fundamentos",
            Description = "Intro",
            OrderIndex = 1
        };

        var challenge1 = new Challenge
        {
            Id = Guid.NewGuid(),
            UnitId = unit.Id,
            Title = "Desafío 1",
            OrderIndex = 1,
            RequiredXP = 0
        };

        var challenge2 = new Challenge
        {
            Id = Guid.NewGuid(),
            UnitId = unit.Id,
            PrerequisiteChallengeId = challenge1.Id,
            Title = "Desafío 2",
            OrderIndex = 2,
            RequiredXP = 500
        };

        dbContext.Units.Add(unit);
        dbContext.Challenges.AddRange(challenge1, challenge2);
        await dbContext.SaveChangesAsync();

        var sut = new CatalogService(dbContext);

        // Act
        var result = await sut.GetUnitsCatalogAsync(userId);

        // Assert
        result.Should().HaveCount(1);
        result[0].Challenges.Should().HaveCount(2);
        result[0].Challenges[0].IsLocked.Should().BeFalse();
        result[0].Challenges[0].LockReason.Should().BeNull();
        result[0].Challenges[1].IsLocked.Should().BeFalse();
        result[0].Challenges[1].LockReason.Should().BeNull();
    }

    [Fact]
    public async Task GetUnitsCatalogAsync_InProgressiveMode_LocksChallengeWhenPrerequisiteNotCompleted()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.Progressive,
            UpdatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = userId,
            Name = "Test Learner",
            TotalXP = 100,
            Level = 1
        });

        var unit = new Unit { Id = Guid.NewGuid(), Title = "Unidad 1", OrderIndex = 1 };
        var c1 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, Title = "Servidor Web", OrderIndex = 1 };
        var c2 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, PrerequisiteChallengeId = c1.Id, Title = "Alta Disponibilidad", OrderIndex = 2 };

        dbContext.Units.Add(unit);
        dbContext.Challenges.AddRange(c1, c2);
        await dbContext.SaveChangesAsync();

        var sut = new CatalogService(dbContext);

        // Act
        var result = await sut.GetUnitsCatalogAsync(userId);

        // Assert
        result.Should().HaveCount(1);
        var challenges = result[0].Challenges;
        challenges[0].IsLocked.Should().BeFalse();
        challenges[1].IsLocked.Should().BeTrue();
        challenges[1].LockReason.Should().Be("Requiere completar el desafío 'Servidor Web'");
    }

    [Fact]
    public async Task GetUnitsCatalogAsync_InProgressiveMode_UnlocksChallengeWhenPrerequisiteIsCompleted()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.Progressive,
            UpdatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = userId,
            Name = "Test Learner",
            TotalXP = 200,
            Level = 2
        });

        var unit = new Unit { Id = Guid.NewGuid(), Title = "Unidad 1", OrderIndex = 1 };
        var c1 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, Title = "Servidor Web", OrderIndex = 1 };
        var c2 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, PrerequisiteChallengeId = c1.Id, Title = "Alta Disponibilidad", OrderIndex = 2 };

        // El usuario completó c1
        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = c1.Id,
            Status = ProgressStatus.Completed,
            HighScore = 85
        });

        dbContext.Units.Add(unit);
        dbContext.Challenges.AddRange(c1, c2);
        await dbContext.SaveChangesAsync();

        var sut = new CatalogService(dbContext);

        // Act
        var result = await sut.GetUnitsCatalogAsync(userId);

        // Assert
        result[0].Challenges[0].IsLocked.Should().BeFalse();
        result[0].Challenges[1].IsLocked.Should().BeFalse();
        result[0].Challenges[1].LockReason.Should().BeNull();
    }

    [Fact]
    public async Task GetUnitsCatalogAsync_InProgressiveMode_LocksChallengeWhenRequiredXPIsNotMet()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.Progressive,
            UpdatedAt = DateTime.UtcNow
        });

        dbContext.Users.Add(new User
        {
            Id = userId,
            Name = "Test Learner",
            TotalXP = 150,
            Level = 2
        });

        var unit = new Unit { Id = Guid.NewGuid(), Title = "Unidad 1", OrderIndex = 1 };
        var c1 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, Title = "Desafío Avanzado", OrderIndex = 1, RequiredXP = 300 };

        dbContext.Units.Add(unit);
        dbContext.Challenges.Add(c1);
        await dbContext.SaveChangesAsync();

        var sut = new CatalogService(dbContext);

        // Act
        var result = await sut.GetUnitsCatalogAsync(userId);

        // Assert
        result[0].Challenges[0].IsLocked.Should().BeTrue();
        result[0].Challenges[0].LockReason.Should().Be("Requiere 300 XP (Actual: 150 XP)");
    }

    [Fact]
    public async Task GetUnitsCatalogAsync_PopulatesUserProgressSummaryAccurately()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();
        var completedDate = DateTime.UtcNow.AddDays(-1);

        var unit = new Unit { Id = Guid.NewGuid(), Title = "Unidad 1", OrderIndex = 1 };
        var c1 = new Challenge { Id = Guid.NewGuid(), UnitId = unit.Id, Title = "Desafío 1", OrderIndex = 1 };

        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = c1.Id,
            Status = ProgressStatus.Completed,
            HighScore = 95,
            HintsUsed = 2,
            FirstCompletedAt = completedDate
        });

        dbContext.Units.Add(unit);
        dbContext.Challenges.Add(c1);
        await dbContext.SaveChangesAsync();

        var sut = new CatalogService(dbContext);

        // Act
        var result = await sut.GetUnitsCatalogAsync(userId);

        // Assert
        var progress = result[0].Challenges[0].UserProgress;
        progress.Should().NotBeNull();
        progress!.Status.Should().Be(ProgressStatus.Completed);
        progress.HighScore.Should().Be(95);
        progress.HintsUsed.Should().Be(2);
        progress.CompletedAt.Should().Be(completedDate);
    }

    [Fact]
    public void ToDetailDto_WithInitialGraph_DeserializesGraphCorrectly()
    {
        // Arrange
        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Reparación de Monolito",
            Mode = "FIX_ARCHITECTURE",
            InitialGraphJson = """
            {
                "components": [
                    { "id": "ec2-1", "serviceCode": "AWS_EC2", "config": { "instanceCount": 1 } },
                    { "id": "rds-1", "serviceCode": "AWS_RDS", "config": { "isMultiAz": false } }
                ],
                "connections": [
                    { "fromComponentId": "ec2-1", "toComponentId": "rds-1", "connectionType": "DATABASE" }
                ]
            }
            """
        };

        // Act
        var detailDto = challenge.ToDetailDto(progress: null);

        // Assert
        detailDto.Mode.Should().Be(ChallengeMode.FixArchitecture);
        detailDto.InitialGraph.Should().NotBeNull();
        detailDto.InitialGraph!.Components.Should().HaveCount(2);
        detailDto.InitialGraph.Connections.Should().HaveCount(1);
        detailDto.InitialGraph.Connections[0].ConnectionType.Should().Be("DATABASE");
    }
}
