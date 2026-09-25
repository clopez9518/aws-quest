namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class UnitsControllerIntegrationTests : IntegrationTestBase
{
    public UnitsControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Get_Units_AuthenticatedGuest_ShouldReturnUnitsWithChallenges()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        SetAuthorizationToken(guest.AccessToken);

        // Act
        var response = await Client.GetAsync("/api/v1/units");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<UnitResponseDto>>>(body, JsonOptions);
        
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Should().NotBeEmpty();

        var firstUnit = envelope.Data[0];
        firstUnit.Challenges.Should().NotBeEmpty();
        
        // En OpenAccess (por defecto), ningún desafío debe estar bloqueado
        firstUnit.Challenges.Should().AllSatisfy(c =>
        {
            c.IsLocked.Should().BeFalse();
        });
    }

    [Fact]
    public async Task Get_Units_Unauthenticated_ShouldReturnUnauthorized401()
    {
        // Arrange
        Client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await Client.GetAsync("/api/v1/units");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
