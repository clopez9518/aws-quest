namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Auth;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class AuthControllerIntegrationTests : IntegrationTestBase
{
    public AuthControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Post_GuestSession_ShouldReturnGuestTokenAndUser()
    {
        // Act
        var guest = await CreateGuestSessionAsync();

        // Assert
        guest.AccessToken.Should().NotBeNullOrWhiteSpace();
        guest.User.Should().NotBeNull();
        guest.User.IsGuest.Should().BeTrue();
        guest.User.Email.Should().BeNull();
        guest.User.Name.Should().StartWith("Invitado_");
        guest.User.TotalXP.Should().Be(0);
        guest.User.Level.Should().Be(1);
    }

    [Fact]
    public async Task Post_Register_NewUser_ShouldCreateRegisteredAccount()
    {
        // Act
        var registered = await CreateRegisteredUserAsync("newuser@awsquest.io", "SecurePassword123!", "Cloud Pioneer");

        // Assert
        registered.AccessToken.Should().NotBeNullOrWhiteSpace();
        registered.User.Should().NotBeNull();
        registered.User.IsGuest.Should().BeFalse();
        registered.User.Email.Should().Be("newuser@awsquest.io");
        registered.User.Name.Should().Be("Cloud Pioneer");
        registered.User.TotalXP.Should().Be(0);
        registered.User.Level.Should().Be(1);
    }

    [Fact]
    public async Task Post_Register_DuplicateEmail_ShouldReturnConflict409()
    {
        // Arrange
        await CreateRegisteredUserAsync("duplicate@awsquest.io", "SecurePassword123!", "First User");

        // Act
        var request = new RegisterRequestDto
        {
            Email = "duplicate@awsquest.io",
            Password = "SecurePassword123!",
            Name = "Second User"
        };
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var body = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
        error.Should().NotBeNull();
        error!.Error.Code.Should().Be("EMAIL_ALREADY_EXISTS");
    }

    [Fact]
    public async Task Post_Register_WithGuestToken_ShouldPromoteGuestAccountPreservingData()
    {
        // 1. Crear invitado
        var guest = await CreateGuestSessionAsync();
        SetAuthorizationToken(guest.AccessToken);

        // 2. Registrar cuenta enviando el token de invitado en el header
        var request = new RegisterRequestDto
        {
            Email = "promoted@awsquest.io",
            Password = "NewSecurePass123!",
            Name = "Promoted Hero"
        };
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<RegisterResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();

        var promotedUser = envelope.Data.User;
        promotedUser.Id.Should().Be(guest.User.Id); // Mismo ID en BD
        promotedUser.IsGuest.Should().BeFalse();
        promotedUser.Email.Should().Be("promoted@awsquest.io");
        promotedUser.Name.Should().Be("Promoted Hero");

        // 3. Probar GET /api/v1/auth/me con el nuevo token emitido
        SetAuthorizationToken(envelope.Data.AccessToken);
        var meResponse = await Client.GetAsync("/api/v1/auth/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var meBody = await meResponse.Content.ReadAsStringAsync();
        var meEnvelope = JsonSerializer.Deserialize<ApiResponse<UserProfileDto>>(meBody, JsonOptions);
        meEnvelope.Should().NotBeNull();
        meEnvelope!.Data.Email.Should().Be("promoted@awsquest.io");
        meEnvelope.Data.IsGuest.Should().BeFalse();
    }

    [Fact]
    public async Task Post_Login_ValidCredentials_ShouldReturnToken()
    {
        // Arrange
        await CreateRegisteredUserAsync("loginuser@awsquest.io", "Password123!", "Login Hero");

        // Act
        var loginRequest = new LoginRequestDto
        {
            Email = "loginuser@awsquest.io",
            Password = "Password123!"
        };
        var content = new StringContent(JsonSerializer.Serialize(loginRequest, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<LoginResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        envelope!.Data.AccessToken.Should().NotBeNullOrWhiteSpace();
        envelope.Data.User.Email.Should().Be("loginuser@awsquest.io");
    }

    [Fact]
    public async Task Post_Login_InvalidPassword_ShouldReturnUnauthorized401()
    {
        // Arrange
        await CreateRegisteredUserAsync("testuser@awsquest.io", "CorrectPassword123!", "Valid User");

        // Act
        var loginRequest = new LoginRequestDto
        {
            Email = "testuser@awsquest.io",
            Password = "WrongPassword!"
        };
        var content = new StringContent(JsonSerializer.Serialize(loginRequest, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/login", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var body = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
        error.Should().NotBeNull();
        error!.Error.Code.Should().Be("INVALID_CREDENTIALS");
    }

    [Fact]
    public async Task Get_Me_WithoutAuth_ShouldReturnUnauthorized401()
    {
        // Act
        Client.DefaultRequestHeaders.Authorization = null;
        var response = await Client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
