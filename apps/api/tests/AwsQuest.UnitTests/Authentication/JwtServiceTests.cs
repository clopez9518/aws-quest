namespace AwsQuest.UnitTests.Authentication;

using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Options;
using AwsQuest.Domain.Entities;
using AwsQuest.Infrastructure.Authentication;

public class JwtServiceTests
{
    private readonly JwtSettings _settings = new()
    {
        Secret = "ThisIsASecretKeyWithMoreThan32CharactersForTestingPurposes!",
        Issuer = "AwsQuestApiTest",
        Audience = "AwsQuestClientTest",
        ExpirationHours = 24,
        GuestExpirationDays = 30
    };

    private JwtService CreateService(JwtSettings? settings = null)
    {
        var options = Options.Create(settings ?? _settings);
        return new JwtService(options);
    }

    [Fact]
    public void GenerateToken_ForGuestUser_ContainsIsGuestClaimTrueAndNoEmail()
    {
        // Arrange
        var service = CreateService();
        var guestUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Invitado_1234",
            Email = null,
            IsGuest = true
        };

        // Act
        var token = service.GenerateToken(guestUser);
        var principal = service.GetPrincipalFromToken(token);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();
        principal.Should().NotBeNull();
        principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be(guestUser.Id.ToString());
        principal.FindFirst(ClaimTypes.Name)?.Value.Should().Be("Invitado_1234");
        principal.FindFirst("isGuest")?.Value.Should().Be("true");
        principal.FindFirst(ClaimTypes.Email).Should().BeNull();
    }

    [Fact]
    public void GenerateToken_ForRegisteredUser_ContainsIsGuestClaimFalseAndEmailClaim()
    {
        // Arrange
        var service = CreateService();
        var registeredUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Carlos López",
            Email = "carlos@awsquest.dev",
            IsGuest = false
        };

        // Act
        var token = service.GenerateToken(registeredUser);
        var principal = service.GetPrincipalFromToken(token);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();
        principal.Should().NotBeNull();
        principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be(registeredUser.Id.ToString());
        principal.FindFirst(ClaimTypes.Name)?.Value.Should().Be("Carlos López");
        principal.FindFirst("isGuest")?.Value.Should().Be("false");
        principal.FindFirst(ClaimTypes.Email)?.Value.Should().Be("carlos@awsquest.dev");
    }

    [Fact]
    public void GetPrincipalFromToken_WithTamperedToken_ReturnsNull()
    {
        // Arrange
        var service = CreateService();
        var user = new User { Id = Guid.NewGuid(), Name = "Test", IsGuest = false, Email = "test@test.com" };
        var token = service.GenerateToken(user);
        var tamperedToken = token[..^5] + "XXXXX";

        // Act
        var principal = service.GetPrincipalFromToken(tamperedToken);

        // Assert
        principal.Should().BeNull();
    }

    [Fact]
    public void ExtractUserIdFromToken_WithBearerPrefix_ExtractsGuidCorrectly()
    {
        // Arrange
        var service = CreateService();
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, Name = "Test User", IsGuest = true };
        var token = "Bearer " + service.GenerateToken(user);

        // Act
        var extractedId = service.ExtractUserIdFromToken(token);

        // Assert
        extractedId.Should().Be(userId);
    }

    [Fact]
    public void Constructor_WithSecretShorterThan32Chars_ThrowsInvalidOperationException()
    {
        // Arrange
        var invalidSettings = new JwtSettings { Secret = "TooShort" };

        // Act
        var act = () => CreateService(invalidSettings);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*32 caracteres*");
    }
}
