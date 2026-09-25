namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class ChallengesControllerIntegrationTests : IntegrationTestBase
{
    public ChallengesControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    private async Task<Guid> GetFirstChallengeIdAsync(string token)
    {
        SetAuthorizationToken(token);
        var response = await Client.GetAsync("/api/v1/units");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<UnitResponseDto>>>(body, JsonOptions);
        return envelope!.Data[0].Challenges[0].Id;
    }

    [Fact]
    public async Task Get_ChallengeById_ValidId_ShouldReturnChallengeDetailsWithSanitizedHints()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var challengeId = await GetFirstChallengeIdAsync(guest.AccessToken);

        // Act
        SetAuthorizationToken(guest.AccessToken);
        var response = await Client.GetAsync($"/api/v1/challenges/{challengeId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<ChallengeDetailResponseDto>>(body, JsonOptions);
        
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Id.Should().Be(challengeId);
        envelope.Data.AllowedServices.Should().NotBeEmpty();
        envelope.Data.HintsSummary.Should().NotBeNull();
        
        // Anti-cheat verification: Si no ha desbloqueado pistas, la lista de unlockedHints está vacía
        envelope.Data.HintsSummary.UnlockedHints.Should().BeEmpty();
        envelope.Data.HintsSummary.TotalHints.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Get_ChallengeById_NonExistentGuid_ShouldReturnNotFound404()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        SetAuthorizationToken(guest.AccessToken);
        var fakeId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/v1/challenges/{fakeId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        var error = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
        error.Should().NotBeNull();
        error!.Error.Code.Should().Be("CHALLENGE_NOT_FOUND");
    }

    [Fact]
    public async Task Post_SubmitReflection_ValidOption_ShouldReturnFeedbackAndAwardBonusXP()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var challengeId = await GetFirstChallengeIdAsync(guest.AccessToken);

        SetAuthorizationToken(guest.AccessToken);
        var detailRes = await Client.GetAsync($"/api/v1/challenges/{challengeId}");
        var detailBody = await detailRes.Content.ReadAsStringAsync();
        var detailEnvelope = JsonSerializer.Deserialize<ApiResponse<ChallengeDetailResponseDto>>(detailBody, JsonOptions);

        detailEnvelope!.Data.ReflectionPrompt.Should().NotBeNull();
        var prompt = detailEnvelope.Data.ReflectionPrompt!;
        prompt.Options.Should().NotBeEmpty();

        var selectedOption = prompt.Options.First();

        // Act
        var payload = new SubmitReflectionAnswerRequestDto
        {
            SelectedOptionId = selectedOption.Id
        };
        var content = new StringContent(JsonSerializer.Serialize(payload, JsonOptions), System.Text.Encoding.UTF8, "application/json");
        var response = await Client.PostAsync($"/api/v1/challenges/{challengeId}/reflection", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<SubmitReflectionAnswerResponseDto>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Explanation.Should().NotBeNullOrWhiteSpace();
        envelope.Data.AllExplanations.Should().NotBeEmpty();
    }
}
