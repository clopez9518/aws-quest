namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Domain.Enums;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class SystemConfigControllerIntegrationTests : IntegrationTestBase
{
    public SystemConfigControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Get_SystemConfig_ShouldReturnCurrentMode()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/system/config");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<SystemConfigResponseDto>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.AccessMode.Should().Be(AccessMode.OpenAccess);
    }

    [Fact]
    public async Task Patch_SystemConfig_Authenticated_ShouldUpdateAccessMode()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        SetAuthorizationToken(guest.AccessToken);

        var request = new UpdateSystemConfigRequestDto
        {
            AccessMode = AccessMode.Progressive
        };
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PatchAsync("/api/v1/system/config", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<SystemConfigResponseDto>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.AccessMode.Should().Be(AccessMode.Progressive);

        // Comprobar que GET subsecuente refleja Progressive
        var getResponse = await Client.GetAsync("/api/v1/system/config");
        var getBody = await getResponse.Content.ReadAsStringAsync();
        var getEnvelope = JsonSerializer.Deserialize<ApiResponse<SystemConfigResponseDto>>(getBody, JsonOptions);
        getEnvelope!.Data.AccessMode.Should().Be(AccessMode.Progressive);
    }
}
