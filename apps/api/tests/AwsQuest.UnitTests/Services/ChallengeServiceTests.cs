namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using ChallengeServiceImpl = AwsQuest.Infrastructure.Services.ChallengeService;
using ChallengeServiceEntity = AwsQuest.Domain.Entities.ChallengeService;

public class ChallengeServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetChallengeDetailAsync_WithValidChallenge_ReturnsDetailWithAllowedServicesAndDistractors()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();
        var unitId = Guid.NewGuid();

        var s3Service = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_S3",
            Name = "Amazon S3",
            Category = "Storage",
            IconUrl = "/icons/s3.svg"
        };

        var ec2Service = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_EC2",
            Name = "Amazon EC2",
            Category = "Compute",
            IconUrl = "/icons/ec2.svg"
        };

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            UnitId = unitId,
            Title = "Servidor Web con S3",
            Description = "Diseña una arquitectura...",
            Difficulty = DifficultyLevel.Easy,
            Mode = "BUILDER",
            BaseXP = 100,
            HintsJson = "[{\"orderIndex\": 1, \"text\": \"Usa S3 para estáticos\", \"penaltyPoints\": 5}]"
        };

        var cs1 = new ChallengeServiceEntity
        {
            Id = Guid.NewGuid(),
            ChallengeId = challenge.Id,
            ServiceId = s3Service.Id,
            Service = s3Service,
            MaxInstances = 1,
            IsDistractor = false
        };

        var cs2 = new ChallengeServiceEntity
        {
            Id = Guid.NewGuid(),
            ChallengeId = challenge.Id,
            ServiceId = ec2Service.Id,
            Service = ec2Service,
            MaxInstances = 2,
            IsDistractor = true
        };

        dbContext.AwsServices.AddRange(s3Service, ec2Service);
        dbContext.Challenges.Add(challenge);
        dbContext.ChallengeServices.AddRange(cs1, cs2);
        await dbContext.SaveChangesAsync();

        var sut = new ChallengeServiceImpl(dbContext);

        // Act
        var result = await sut.GetChallengeDetailAsync(challenge.Id, userId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(challenge.Id);
        result.Title.Should().Be("Servidor Web con S3");
        result.AllowedServices.Should().HaveCount(2);

        var s3Dto = result.AllowedServices.FirstOrDefault(s => s.Code == "AWS_S3");
        s3Dto.Should().NotBeNull();
        s3Dto!.MaxInstances.Should().Be(1);
        s3Dto.IsDistractor.Should().BeFalse();

        var ec2Dto = result.AllowedServices.FirstOrDefault(s => s.Code == "AWS_EC2");
        ec2Dto.Should().NotBeNull();
        ec2Dto!.MaxInstances.Should().Be(2);
        ec2Dto.IsDistractor.Should().BeTrue();
    }

    [Fact]
    public async Task GetChallengeDetailAsync_SanitizesHints_OnlyReturnsUnlockedHintsText()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío con Pistas",
            HintsJson = @"[
                {""orderIndex"": 1, ""text"": ""Pista 1 Revelada"", ""penaltyPoints"": 5},
                {""orderIndex"": 2, ""text"": ""Pista 2 Secreta"", ""penaltyPoints"": 10},
                {""orderIndex"": 3, ""text"": ""Pista 3 Secreta"", ""penaltyPoints"": 15}
            ]"
        };

        // El usuario sólo ha desbloqueado 1 pista
        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = challenge.Id,
            HintsUsed = 1
        });

        dbContext.Challenges.Add(challenge);
        await dbContext.SaveChangesAsync();

        var sut = new ChallengeServiceImpl(dbContext);

        // Act
        var result = await sut.GetChallengeDetailAsync(challenge.Id, userId);

        // Assert
        result.HintsSummary.TotalHints.Should().Be(3);
        result.HintsSummary.UnlockedCount.Should().Be(1);
        result.HintsSummary.UnlockedHints.Should().HaveCount(1);
        result.HintsSummary.UnlockedHints[0].OrderIndex.Should().Be(1);
        result.HintsSummary.UnlockedHints[0].Text.Should().Be("Pista 1 Revelada");
        result.HintsSummary.UnlockedHints[0].PenaltyApplied.Should().Be(5);
    }

    [Fact]
    public async Task GetChallengeDetailAsync_WithLastAttempt_DeserializesLastAttemptGraph()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío con Grafo Previo"
        };

        var graphJson = @"
        {
            ""components"": [
                {""id"": ""c-1"", ""serviceCode"": ""AWS_S3"", ""serviceName"": ""Amazon S3""}
            ],
            ""connections"": []
        }";

        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = challenge.Id,
            LastAttemptGraphJson = graphJson
        });

        dbContext.Challenges.Add(challenge);
        await dbContext.SaveChangesAsync();

        var sut = new ChallengeServiceImpl(dbContext);

        // Act
        var result = await sut.GetChallengeDetailAsync(challenge.Id, userId);

        // Assert
        result.LastAttemptGraph.Should().NotBeNull();
        result.LastAttemptGraph!.Components.Should().HaveCount(1);
        result.LastAttemptGraph.Components[0].ServiceCode.Should().Be("AWS_S3");
    }

    [Fact]
    public async Task GetChallengeDetailAsync_WhenChallengeDoesNotExist_ThrowsChallengeNotFoundException()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var sut = new ChallengeServiceImpl(dbContext);
        var nonExistentId = Guid.NewGuid();

        // Act
        Func<Task> act = () => sut.GetChallengeDetailAsync(nonExistentId, Guid.NewGuid());

        // Assert
        await act.Should().ThrowAsync<ChallengeNotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }

    [Fact]
    public async Task GetChallengeDetailAsync_InProgressiveMode_WhenChallengeIsLocked_ThrowsChallengeLockedException()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.Progressive
        });

        dbContext.Users.Add(new User
        {
            Id = userId,
            Name = "Learner",
            TotalXP = 50
        });

        var prereq = new Challenge { Id = Guid.NewGuid(), Title = "Prerrequisito" };
        var target = new Challenge
        {
            Id = Guid.NewGuid(),
            PrerequisiteChallengeId = prereq.Id,
            Title = "Desafío Bloqueado"
        };

        dbContext.Challenges.AddRange(prereq, target);
        await dbContext.SaveChangesAsync();

        var sut = new ChallengeServiceImpl(dbContext);

        // Act
        Func<Task> act = () => sut.GetChallengeDetailAsync(target.Id, userId);

        // Assert
        await act.Should().ThrowAsync<ChallengeLockedException>()
            .WithMessage("*Prerrequisito*");
    }
}
