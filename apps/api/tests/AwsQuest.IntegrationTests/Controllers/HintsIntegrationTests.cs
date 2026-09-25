namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class HintsIntegrationTests : IntegrationTestBase
{
    public HintsIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    private async Task<Guid> GetChallengeWithMultipleHintsIdAsync(string token)
    {
        SetAuthorizationToken(token);
        var response = await Client.GetAsync("/api/v1/units");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<UnitResponseDto>>>(body, JsonOptions);
        
        var chWithHints = envelope!.Data.SelectMany(u => u.Challenges).First(c => c.Title.Contains("EC2") || c.Title.Contains("EBS"));
        return chWithHints.Id;
    }

    [Fact]
    public async Task Post_UnlockHint_Sequential_ShouldUnlockAndAccumulatePenalty()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var challengeId = await GetChallengeWithMultipleHintsIdAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

        // 1. Desbloquear Pista 1
        var response1 = await Client.PostAsync($"/api/v1/challenges/{challengeId}/hints/unlock", null);
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        var body1 = await response1.Content.ReadAsStringAsync();
        var envelope1 = JsonSerializer.Deserialize<ApiResponse<UnlockHintResponseDto>>(body1, JsonOptions);
        
        envelope1.Should().NotBeNull();
        envelope1!.Data.Should().NotBeNull();
        envelope1.Data.UnlockedHint.OrderIndex.Should().Be(1);
        envelope1.Data.UnlockedHint.Text.Should().NotBeNullOrWhiteSpace();
        envelope1.Data.TotalPenaltyAccumulated.Should().BeGreaterThan(0);
        envelope1.Data.TotalHintsUnlocked.Should().Be(1);

        // 2. Desbloquear Pista 2
        var response2 = await Client.PostAsync($"/api/v1/challenges/{challengeId}/hints/unlock", null);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);
        var body2 = await response2.Content.ReadAsStringAsync();
        var envelope2 = JsonSerializer.Deserialize<ApiResponse<UnlockHintResponseDto>>(body2, JsonOptions);

        envelope2.Should().NotBeNull();
        envelope2!.Data.UnlockedHint.OrderIndex.Should().Be(2);
        envelope2.Data.TotalHintsUnlocked.Should().Be(2);
        envelope2.Data.TotalPenaltyAccumulated.Should().BeGreaterThan(envelope1.Data.TotalPenaltyAccumulated);
    }

    [Fact]
    public async Task Post_UnlockHint_WhenAllUnlocked_ShouldReturnBadRequest400()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var challengeId = await GetChallengeWithMultipleHintsIdAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

        // Desbloquear todas las pistas disponibles
        while (true)
        {
            var res = await Client.PostAsync($"/api/v1/challenges/{challengeId}/hints/unlock", null);
            if (res.StatusCode == HttpStatusCode.BadRequest)
            {
                var body = await res.Content.ReadAsStringAsync();
                var error = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
                error.Should().NotBeNull();
                error!.Error.Code.Should().Be("ALL_HINTS_UNLOCKED");
                break;
            }
            res.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
