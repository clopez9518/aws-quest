namespace AwsQuest.IntegrationTests.Middlewares;

using System.Net;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Auth;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class GlobalErrorHandlingIntegrationTests : IntegrationTestBase
{
    public GlobalErrorHandlingIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Post_Register_InvalidPayload_ShouldReturnStructuredValidationErrors()
    {
        // Arrange: Email inválido y contraseña demasiado corta
        var request = new RegisterRequestDto
        {
            Email = "not-an-email",
            Password = "123",
            Name = ""
        };
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync("/api/v1/auth/register", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);

        error.Should().NotBeNull();
        error!.Error.Code.Should().Be("VALIDATION_ERROR");
        error.Error.Details.Should().NotBeNull();
        body.Should().Contain("Email");
    }

    [Fact]
    public async Task Get_NonExistentEndpoint_ShouldReturn404()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/non-existent-endpoint-xyz");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
