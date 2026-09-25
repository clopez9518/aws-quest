namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using ChallengeServiceEntity = AwsQuest.Domain.Entities.ChallengeService;

public class EvaluationServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static (Challenge Challenge, AwsService S3Service, AwsService Ec2Service) SetupChallengeWithServices(AppDbContext dbContext)
    {
        var s3 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_S3",
            Name = "Amazon S3",
            Category = "Storage",
            IconUrl = "/icons/s3.svg"
        };
        var ec2 = new AwsService
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
            Title = "Servidor Web con S3",
            Description = "Desafío de prueba",
            Difficulty = DifficultyLevel.Intermediate,
            Mode = "BUILDER",
            BaseXP = 100,
            EvaluationRulesJson = @"{
                ""requiredServices"": [""AWS_S3"", ""AWS_EC2""],
                ""requiredConnections"": [
                    {""fromServiceCode"": ""AWS_EC2"", ""toServiceCode"": ""AWS_S3"", ""connectionType"": ""DATA""}
                ],
                ""antiPatterns"": [],
                ""weights"": {
                    ""servicePresenceWeight"": 50,
                    ""connectionWeight"": 50,
                    ""antiPatternWeight"": 0
                }
            }",
            HintsJson = @"[
                {""orderIndex"": 1, ""text"": ""Pista 1"", ""penaltyPoints"": 10}
            ]"
        };

        var cs1 = new ChallengeServiceEntity { Id = Guid.NewGuid(), ChallengeId = challenge.Id, ServiceId = s3.Id, Service = s3, MaxInstances = 2, IsDistractor = false };
        var cs2 = new ChallengeServiceEntity { Id = Guid.NewGuid(), ChallengeId = challenge.Id, ServiceId = ec2.Id, Service = ec2, MaxInstances = 2, IsDistractor = false };

        dbContext.AwsServices.AddRange(s3, ec2);
        dbContext.Challenges.Add(challenge);
        dbContext.ChallengeServices.AddRange(cs1, cs2);

        return (challenge, s3, ec2);
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_PassingEvaluation_FirstTime_GrantsFullXP_UpdatesProgressAndUserLevel()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Player One",
            Email = "player1@test.com",
            PasswordHash = "hash",
            Level = 1,
            TotalXP = 0
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "c2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "c2", ToComponentId = "c1", ConnectionType = "DATA" }
                ]
            }
        };

        // Act
        var result = await sut.EvaluateArchitectureAsync(challenge.Id, user.Id, request);

        // Assert
        result.Should().NotBeNull();
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.IsNewHighScore.Should().BeTrue();
        result.EarnedXP.Should().Be(100);
        result.CurrentUserXP.Should().Be(100);

        // Verify DB updates
        var updatedUser = await dbContext.Users.FindAsync(user.Id);
        updatedUser!.TotalXP.Should().Be(100);

        var progress = await dbContext.UserProgresses.FirstOrDefaultAsync(p => p.UserId == user.Id && p.ChallengeId == challenge.Id);
        progress.Should().NotBeNull();
        progress!.Status.Should().Be(ProgressStatus.Completed);
        progress.HighScore.Should().Be(100);

        var attempts = await dbContext.ChallengeAttempts.Where(a => a.ProgressId == progress.Id).ToListAsync();
        attempts.Should().HaveCount(1);
        attempts[0].Score.Should().Be(100);
        attempts[0].Passed.Should().BeTrue();
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_PassingEvaluation_WithHintsUsed_AppliesPenalty()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Player Two",
            Email = "player2@test.com",
            PasswordHash = "hash",
            Level = 1,
            TotalXP = 0
        };
        dbContext.Users.Add(user);

        // User already used 1 hint (10 points penalty)
        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            ChallengeId = challenge.Id,
            HintsUsed = 1
        });
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "c2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "c2", ToComponentId = "c1", ConnectionType = "DATA" }
                ]
            }
        };

        // Act
        var result = await sut.EvaluateArchitectureAsync(challenge.Id, user.Id, request);

        // Assert
        // Raw score is 100, penalty is 10, final score is 90
        result.Score.Should().Be(90);
        result.Passed.Should().BeTrue();
        result.EarnedXP.Should().Be(90); // 90/100 * 100 = 90
        result.CurrentUserXP.Should().Be(90);
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_PassingEvaluation_HigherScore_GrantsIncrementalXP_AntiRefarming()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Player Three",
            Email = "player3@test.com",
            PasswordHash = "hash",
            Level = 1,
            TotalXP = 75
        };
        dbContext.Users.Add(user);

        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            ChallengeId = challenge.Id,
            Status = ProgressStatus.Completed,
            HighScore = 75
        });
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "c2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "c2", ToComponentId = "c1", ConnectionType = "DATA" }
                ]
            }
        };

        // Act
        var result = await sut.EvaluateArchitectureAsync(challenge.Id, user.Id, request);

        // Assert
        // Previous high score = 75, new score = 100
        // Incremental XP = (100 - 75) * (100 / 100) = 25
        result.Score.Should().Be(100);
        result.IsNewHighScore.Should().BeTrue();
        result.EarnedXP.Should().Be(25);
        result.CurrentUserXP.Should().Be(100);

        var updatedUser = await dbContext.Users.FindAsync(user.Id);
        updatedUser!.TotalXP.Should().Be(100);

        var progress = await dbContext.UserProgresses.FirstOrDefaultAsync(p => p.UserId == user.Id && p.ChallengeId == challenge.Id);
        progress!.HighScore.Should().Be(100);
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_PassingEvaluation_LowerOrEqualScore_GrantsZeroXP()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Player Four",
            Email = "player4@test.com",
            PasswordHash = "hash",
            Level = 2,
            TotalXP = 150
        };
        dbContext.Users.Add(user);

        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            ChallengeId = challenge.Id,
            Status = ProgressStatus.Completed,
            HighScore = 100
        });
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "c2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "c2", ToComponentId = "c1", ConnectionType = "DATA" }
                ]
            }
        };

        // Act
        var result = await sut.EvaluateArchitectureAsync(challenge.Id, user.Id, request);

        // Assert
        result.Score.Should().Be(100);
        result.IsNewHighScore.Should().BeFalse();
        result.EarnedXP.Should().Be(0);
        result.CurrentUserXP.Should().Be(150);

        var updatedUser = await dbContext.Users.FindAsync(user.Id);
        updatedUser!.TotalXP.Should().Be(150);
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_FailingEvaluation_BelowThreshold_PassedFalse_GrantsZeroXP()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Player Five",
            Email = "player5@test.com",
            PasswordHash = "hash",
            Level = 1,
            TotalXP = 50
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        // Missing EC2 service and missing connection -> score will be below 70
        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" }
                ],
                Connections = []
            }
        };

        // Act
        var result = await sut.EvaluateArchitectureAsync(challenge.Id, user.Id, request);

        // Assert
        result.Passed.Should().BeFalse();
        result.Score.Should().BeLessThan(70);
        result.EarnedXP.Should().Be(0);
        result.CurrentUserXP.Should().Be(50);

        var progress = await dbContext.UserProgresses.FirstOrDefaultAsync(p => p.UserId == user.Id && p.ChallengeId == challenge.Id);
        progress.Should().NotBeNull();
        progress!.Status.Should().Be(ProgressStatus.InProgress);
    }

    [Fact]
    public async Task EvaluateArchitectureAsync_WhenChallengeDoesNotExist_ThrowsChallengeNotFoundException()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var sut = new EvaluationService(dbContext, new EvaluationEngine());
        var nonExistentId = Guid.NewGuid();

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "c1", ServiceCode = "AWS_S3" }
                ]
            }
        };

        // Act
        Func<Task> act = () => sut.EvaluateArchitectureAsync(nonExistentId, Guid.NewGuid(), request);

        // Assert
        await act.Should().ThrowAsync<ChallengeNotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }

    [Fact]
    public async Task GetChallengeAttemptsHistoryAsync_ReturnsOrderedAttempts()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var (challenge, _, _) = SetupChallengeWithServices(dbContext);
        var userId = Guid.NewGuid();

        var progress = new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = challenge.Id,
            Status = ProgressStatus.Completed,
            HighScore = 100
        };
        dbContext.UserProgresses.Add(progress);

        var sub1 = new ChallengeAttempt
        {
            Id = Guid.NewGuid(),
            ProgressId = progress.Id,
            Score = 50,
            Passed = false,
            GraphSubmittedJson = "{}",
            EvaluationResultJson = "{}",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        };

        var sub2 = new ChallengeAttempt
        {
            Id = Guid.NewGuid(),
            ProgressId = progress.Id,
            Score = 100,
            Passed = true,
            GraphSubmittedJson = "{}",
            EvaluationResultJson = "{}",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.ChallengeAttempts.AddRange(sub1, sub2);
        await dbContext.SaveChangesAsync();

        var sut = new EvaluationService(dbContext, new EvaluationEngine());

        // Act
        var attempts = await sut.GetChallengeAttemptsHistoryAsync(challenge.Id, userId);

        // Assert
        attempts.Should().HaveCount(2);
        attempts[0].Id.Should().Be(sub2.Id); // Most recent first
        attempts[0].Score.Should().Be(100);
        attempts[0].Passed.Should().BeTrue();
        attempts[1].Id.Should().Be(sub1.Id);
    }
}
