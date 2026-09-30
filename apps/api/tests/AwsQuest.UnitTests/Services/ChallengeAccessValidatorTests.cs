namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using FluentAssertions;
using Xunit;

public class ChallengeAccessValidatorTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"AwsQuest_AccessValidatorTestDb_{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task ValidateAccessAsync_WhenOpenAccessMode_ShouldPassWithoutRestrictions()
    {
        var db = CreateInMemoryDbContext();
        var sut = new ChallengeAccessValidator(db);

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío Avanzado",
            RequiredXP = 500,
            PrerequisiteChallengeId = Guid.NewGuid()
        };

        var act = () => sut.ValidateAccessAsync(challenge, Guid.NewGuid());

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task ValidateAccessAsync_WhenProgressiveModeAndPrereqNotCompleted_ShouldThrowChallengeLockedException()
    {
        var db = CreateInMemoryDbContext();
        db.SystemConfigs.Add(new SystemConfig { Id = "global_config", AccessMode = AccessMode.Progressive, UpdatedAt = DateTime.UtcNow });

        var prereqChallenge = new Challenge { Id = Guid.NewGuid(), Title = "Desafío Básico 1" };
        var targetChallenge = new Challenge { Id = Guid.NewGuid(), Title = "Desafío Básico 2", PrerequisiteChallengeId = prereqChallenge.Id };
        var user = new User { Id = Guid.NewGuid(), Name = "Learner", TotalXP = 0 };

        db.Challenges.AddRange(prereqChallenge, targetChallenge);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var sut = new ChallengeAccessValidator(db);

        var act = () => sut.ValidateAccessAsync(targetChallenge, user.Id);

        await act.Should().ThrowAsync<ChallengeLockedException>()
            .WithMessage("*Requiere completar el desafío 'Desafío Básico 1'*");
    }

    [Fact]
    public async Task ValidateAccessAsync_WhenProgressiveModeAndInsufficientXP_ShouldThrowChallengeLockedException()
    {
        var db = CreateInMemoryDbContext();
        db.SystemConfigs.Add(new SystemConfig { Id = "global_config", AccessMode = AccessMode.Progressive, UpdatedAt = DateTime.UtcNow });

        var targetChallenge = new Challenge { Id = Guid.NewGuid(), Title = "Desafío Capstone", RequiredXP = 300 };
        var user = new User { Id = Guid.NewGuid(), Name = "Learner", TotalXP = 150 };

        db.Challenges.Add(targetChallenge);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var sut = new ChallengeAccessValidator(db);

        var act = () => sut.ValidateAccessAsync(targetChallenge, user.Id);

        await act.Should().ThrowAsync<ChallengeLockedException>()
            .WithMessage("*Requiere 300 XP (Actual: 150 XP)*");
    }
}
