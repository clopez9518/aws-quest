namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class AttemptsControllerIntegrationTests : IntegrationTestBase
{
    public AttemptsControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
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
    public async Task Get_Attempts_AfterEvaluation_ShouldReturnChronologicalHistory()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var challengeId = await GetFirstChallengeIdAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

        // Realizar un intento de evaluación válido para challenge-101 (EC2)
        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent
                    {
                        Id = "ec2-node-1",
                        ServiceCode = "AWS_EC2",
                        Config = new ComponentConfig { InstanceCount = 1 }
                    }
                ],
                Connections = []
            },
            HintsUsed = 0
        };

        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");
        await Client.PostAsync($"/api/v1/challenges/{challengeId}/evaluate", content);

        // Act
        var response = await Client.GetAsync($"/api/v1/challenges/{challengeId}/attempts");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<ChallengeAttemptHistoryDto>>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Should().HaveCount(1);
        envelope.Data[0].Score.Should().Be(100);
        envelope.Data[0].Passed.Should().BeTrue();
        envelope.Data[0].GraphSubmitted.Components.Should().HaveCount(1);
    }
}
