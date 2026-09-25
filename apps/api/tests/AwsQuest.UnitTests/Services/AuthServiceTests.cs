namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using FluentAssertions;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Dtos.Auth;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Authentication;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;

public class AuthServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static (AuthService service, AppDbContext dbContext, BCryptPasswordHasher hasher, JwtService jwtService) CreateSut()
    {
        var dbContext = CreateInMemoryDbContext();
        var hasher = new BCryptPasswordHasher();
        var jwtSettings = Options.Create(new JwtSettings
        {
            Secret = "SuperSecretKeyForDevelopmentOnlyDoNotUseInProduction1234567890!",
            Issuer = "AwsQuestApiTest",
            Audience = "AwsQuestClientTest",
            ExpirationHours = 24,
            GuestExpirationDays = 30
        });
        var jwtService = new JwtService(jwtSettings);
        var authService = new AuthService(dbContext, jwtService, hasher);

        return (authService, dbContext, hasher, jwtService);
    }

    [Fact]
    public async Task CreateGuestSessionAsync_CreatesUserInDbAndReturnsValidToken()
    {
        // Arrange
        var (sut, dbContext, _, _) = CreateSut();

        // Act
        var result = await sut.CreateGuestSessionAsync();

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.User.Should().NotBeNull();
        result.User.IsGuest.Should().BeTrue();
        result.User.Email.Should().BeNull();
        result.User.TotalXP.Should().Be(0);
        result.User.Level.Should().Be(1);
        result.User.Name.Should().StartWith("Invitado_");

        var userInDb = await dbContext.Users.FindAsync(result.User.Id);
        userInDb.Should().NotBeNull();
        userInDb!.IsGuest.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_WithoutGuest_CreatesNewRegisteredUserAndReturnsToken()
    {
        // Arrange
        var (sut, dbContext, hasher, _) = CreateSut();
        var request = new RegisterRequestDto
        {
            Email = "aprendiz@awsquest.dev",
            Password = "SecurePassword123!",
            Name = "Aprendiz AWS"
        };

        // Act
        var result = await sut.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be("aprendiz@awsquest.dev");
        result.User.Name.Should().Be("Aprendiz AWS");
        result.User.IsGuest.Should().BeFalse();
        result.MigratedProgressCount.Should().Be(0);

        var userInDb = await dbContext.Users.FindAsync(result.User.Id);
        userInDb.Should().NotBeNull();
        userInDb!.IsGuest.Should().BeFalse();
        hasher.VerifyPassword("SecurePassword123!", userInDb.PasswordHash!).Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_WithValidGuest_PromotesGuestInPlaceAndMigratesProgressCount()
    {
        // Arrange
        var (sut, dbContext, _, _) = CreateSut();
        
        // Crear un usuario invitado con progreso previo
        var guestId = Guid.NewGuid();
        var challengeId = Guid.NewGuid();
        var guest = new User
        {
            Id = guestId,
            Name = "Invitado_9999",
            IsGuest = true,
            TotalXP = 250,
            Level = 2,
            Progress = new List<UserProgress>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    UserId = guestId,
                    ChallengeId = challengeId,
                    Status = ProgressStatus.Completed,
                    HighScore = 95
                }
            }
        };
        dbContext.Users.Add(guest);
        await dbContext.SaveChangesAsync();

        var request = new RegisterRequestDto
        {
            Email = "carlos@awsquest.dev",
            Password = "SecurePassword123!",
            Name = "Carlos López"
        };

        // Act
        var result = await sut.RegisterAsync(request, guestUserId: guestId);

        // Assert
        result.Should().NotBeNull();
        result.User.Id.Should().Be(guestId);
        result.User.Email.Should().Be("carlos@awsquest.dev");
        result.User.Name.Should().Be("Carlos López");
        result.User.IsGuest.Should().BeFalse();
        result.User.TotalXP.Should().Be(250);
        result.User.Level.Should().Be(2);
        result.MigratedProgressCount.Should().Be(1);

        var userInDb = await dbContext.Users.Include(u => u.Progress).FirstOrDefaultAsync(u => u.Id == guestId);
        userInDb.Should().NotBeNull();
        userInDb!.IsGuest.Should().BeFalse();
        userInDb.Email.Should().Be("carlos@awsquest.dev");
        userInDb.Progress.Should().HaveCount(1);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsDuplicateEmailException()
    {
        // Arrange
        var (sut, dbContext, _, _) = CreateSut();
        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "duplicado@awsquest.dev",
            Name = "Existente",
            IsGuest = false
        };
        dbContext.Users.Add(existingUser);
        await dbContext.SaveChangesAsync();

        var request = new RegisterRequestDto
        {
            Email = "duplicado@awsquest.dev",
            Password = "SecurePassword123!",
            Name = "Otro Nombre"
        };

        // Act
        var act = () => sut.RegisterAsync(request);

        // Assert
        await act.Should().ThrowAsync<DuplicateEmailException>()
            .WithMessage("*duplicado@awsquest.dev*");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsLoginResponseDto()
    {
        // Arrange
        var (sut, dbContext, hasher, _) = CreateSut();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "login@awsquest.dev",
            PasswordHash = hasher.HashPassword("Password123!"),
            Name = "Login User",
            IsGuest = false,
            TotalXP = 100,
            Level = 1
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var request = new LoginRequestDto
        {
            Email = "login@awsquest.dev",
            Password = "Password123!"
        };

        // Act
        var result = await sut.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.User.Id.Should().Be(user.Id);
        result.User.Email.Should().Be("login@awsquest.dev");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ThrowsInvalidCredentialsException()
    {
        // Arrange
        var (sut, dbContext, hasher, _) = CreateSut();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "login@awsquest.dev",
            PasswordHash = hasher.HashPassword("CorrectPassword123!"),
            Name = "Login User",
            IsGuest = false
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var request = new LoginRequestDto
        {
            Email = "login@awsquest.dev",
            Password = "WrongPassword999!"
        };

        // Act
        var act = () => sut.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentEmail_ThrowsInvalidCredentialsException()
    {
        // Arrange
        var (sut, _, _, _) = CreateSut();
        var request = new LoginRequestDto
        {
            Email = "nonexistent@awsquest.dev",
            Password = "Password123!"
        };

        // Act
        var act = () => sut.LoginAsync(request);

        // Assert
        await act.Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task GetCurrentUserProfileAsync_WithValidUser_ReturnsProfileWithCompletedCount()
    {
        // Arrange
        var (sut, dbContext, _, _) = CreateSut();
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Name = "Perfil User",
            Email = "perfil@awsquest.dev",
            IsGuest = false,
            TotalXP = 500,
            Level = 3
        };
        dbContext.Users.Add(user);

        dbContext.UserProgresses.AddRange(
            new UserProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ChallengeId = Guid.NewGuid(),
                Status = ProgressStatus.Completed,
                HighScore = 100
            },
            new UserProgress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ChallengeId = Guid.NewGuid(),
                Status = ProgressStatus.InProgress,
                HighScore = 50
            }
        );
        await dbContext.SaveChangesAsync();

        // Act
        var profile = await sut.GetCurrentUserProfileAsync(userId);

        // Assert
        profile.Should().NotBeNull();
        profile.Id.Should().Be(userId);
        profile.Name.Should().Be("Perfil User");
        profile.TotalXP.Should().Be(500);
        profile.Level.Should().Be(3);
        profile.CompletedChallengesCount.Should().Be(1);
    }

    [Fact]
    public async Task GetCurrentUserProfileAsync_WithNonExistentUser_ThrowsUserNotFoundException()
    {
        // Arrange
        var (sut, _, _, _) = CreateSut();
        var nonExistentId = Guid.NewGuid();

        // Act
        var act = () => sut.GetCurrentUserProfileAsync(nonExistentId);

        // Assert
        await act.Should().ThrowAsync<UserNotFoundException>()
            .WithMessage($"*{nonExistentId}*");
    }
}
