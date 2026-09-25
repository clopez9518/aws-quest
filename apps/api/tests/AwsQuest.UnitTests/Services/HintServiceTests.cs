namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;

public class HintServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task UnlockNextHintAsync_FirstHint_ReturnsFirstHintAndIncrementsProgressHintsUsed()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío S3",
            HintsJson = @"[
                {""orderIndex"": 1, ""text"": ""Usa un bucket S3"", ""penaltyPoints"": 5},
                {""orderIndex"": 2, ""text"": ""Habilita versionado"", ""penaltyPoints"": 10}
            ]"
        };

        dbContext.Challenges.Add(challenge);
        await dbContext.SaveChangesAsync();

        var sut = new HintService(dbContext);

        // Act
        var result = await sut.UnlockNextHintAsync(challenge.Id, userId);

        // Assert
        result.Should().NotBeNull();
        result.UnlockedHint.Should().NotBeNull();
        result.UnlockedHint.OrderIndex.Should().Be(1);
        result.UnlockedHint.Text.Should().Be("Usa un bucket S3");
        result.UnlockedHint.PenaltyApplied.Should().Be(5);
        result.TotalHintsUnlocked.Should().Be(1);
        result.TotalPenaltyAccumulated.Should().Be(5);

        // Verify DB persistence
        var progress = await dbContext.UserProgresses.FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challenge.Id);
        progress.Should().NotBeNull();
        progress!.HintsUsed.Should().Be(1);
    }

    [Fact]
    public async Task UnlockNextHintAsync_SecondHint_ReturnsNextHintAndCumulativePenalty()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío S3",
            HintsJson = @"[
                {""orderIndex"": 1, ""text"": ""Usa un bucket S3"", ""penaltyPoints"": 5},
                {""orderIndex"": 2, ""text"": ""Habilita versionado"", ""penaltyPoints"": 10},
                {""orderIndex"": 3, ""text"": ""Configura lifecycle"", ""penaltyPoints"": 15}
            ]"
        };

        dbContext.Challenges.Add(challenge);
        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = challenge.Id,
            HintsUsed = 1
        });
        await dbContext.SaveChangesAsync();

        var sut = new HintService(dbContext);

        // Act
        var result = await sut.UnlockNextHintAsync(challenge.Id, userId);

        // Assert
        result.Should().NotBeNull();
        result.UnlockedHint.OrderIndex.Should().Be(2);
        result.UnlockedHint.Text.Should().Be("Habilita versionado");
        result.UnlockedHint.PenaltyApplied.Should().Be(10);
        result.TotalHintsUnlocked.Should().Be(2);
        result.TotalPenaltyAccumulated.Should().Be(15); // 5 + 10

        var progress = await dbContext.UserProgresses.FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challenge.Id);
        progress!.HintsUsed.Should().Be(2);
    }

    [Fact]
    public async Task UnlockNextHintAsync_WhenAllHintsAlreadyUnlocked_ThrowsAllHintsUnlockedException()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var userId = Guid.NewGuid();

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío S3",
            HintsJson = @"[
                {""orderIndex"": 1, ""text"": ""Usa un bucket S3"", ""penaltyPoints"": 5}
            ]"
        };

        dbContext.Challenges.Add(challenge);
        dbContext.UserProgresses.Add(new UserProgress
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = challenge.Id,
            HintsUsed = 1
        });
        await dbContext.SaveChangesAsync();

        var sut = new HintService(dbContext);

        // Act
        Func<Task> act = () => sut.UnlockNextHintAsync(challenge.Id, userId);

        // Assert
        await act.Should().ThrowAsync<AllHintsUnlockedException>()
            .WithMessage("*desbloqueado todas las pistas*");
    }

    [Fact]
    public async Task UnlockNextHintAsync_WhenChallengeDoesNotExist_ThrowsChallengeNotFoundException()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var sut = new HintService(dbContext);
        var nonExistentId = Guid.NewGuid();

        // Act
        Func<Task> act = () => sut.UnlockNextHintAsync(nonExistentId, Guid.NewGuid());

        // Assert
        await act.Should().ThrowAsync<ChallengeNotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }

    [Fact]
    public async Task UnlockNextHintAsync_InProgressiveMode_WhenChallengeIsLocked_ThrowsChallengeLockedException()
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
            Title = "Desafío Bloqueado",
            HintsJson = @"[{""orderIndex"": 1, ""text"": ""Pista"", ""penaltyPoints"": 5}]"
        };

        dbContext.Challenges.AddRange(prereq, target);
        await dbContext.SaveChangesAsync();

        var sut = new HintService(dbContext);

        // Act
        Func<Task> act = () => sut.UnlockNextHintAsync(target.Id, userId);

        // Assert
        await act.Should().ThrowAsync<ChallengeLockedException>()
            .WithMessage("*Prerrequisito*");
    }
}
