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

public class EvaluationControllerIntegrationTests : IntegrationTestBase
{
    public EvaluationControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    private async Task<(Guid Challenge101Id, Guid Challenge201Id)> GetChallengeIdsAsync(string token)
    {
        SetAuthorizationToken(token);
        var response = await Client.GetAsync("/api/v1/units");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<UnitResponseDto>>>(body, JsonOptions);
        
        var ch101 = envelope!.Data.SelectMany(u => u.Challenges).First(c => c.Title.Contains("EC2") || c.Title.Contains("Servidor"));
        var ch201 = envelope.Data.SelectMany(u => u.Challenges).First(c => c.Title.Contains("Web"));

        return (ch101.Id, ch201.Id);
    }

    [Fact]
    public async Task Post_Evaluate_Challenge101_ValidS3Architecture_ShouldPassAndAward100XP()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var (ch101Id, _) = await GetChallengeIdsAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

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

        // Act
        var response = await Client.PostAsync($"/api/v1/challenges/{ch101Id}/evaluate", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<EvaluateArchitectureResponseDto>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Passed.Should().BeTrue();
        envelope.Data.Score.Should().Be(100);
        envelope.Data.EarnedXP.Should().Be(100);
        envelope.Data.CurrentUserXP.Should().Be(100);
        envelope.Data.IsNewHighScore.Should().BeTrue();
        envelope.Data.Feedback.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Post_Evaluate_Challenge201_IncompleteArchitecture_ShouldFailAndAwardZeroXP()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var (_, ch201Id) = await GetChallengeIdsAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent
                    {
                        Id = "rds-single-1",
                        ServiceCode = "AWS_RDS",
                        Config = new ComponentConfig { IsMultiAz = false, IsPublic = false }
                    }
                ],
                Connections = []
            },
            HintsUsed = 0
        };

        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/v1/challenges/{ch201Id}/evaluate", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<EvaluateArchitectureResponseDto>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Passed.Should().BeFalse();
        envelope.Data.Score.Should().BeLessThan(70);
        envelope.Data.EarnedXP.Should().Be(0);
        envelope.Data.CurrentUserXP.Should().Be(0);
        envelope.Data.Feedback.Items.Should().Contain(f => f.Status == Domain.Enums.FeedbackItemStatus.Fail);
    }

    [Fact]
    public async Task Post_Evaluate_AntiRefarming_ShouldAwardOnlyDeltaXP()
    {
        // Arrange
        var guest = await CreateGuestSessionAsync();
        var (ch101Id, _) = await GetChallengeIdsAsync(guest.AccessToken);
        SetAuthorizationToken(guest.AccessToken);

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

        // 1. Primer intento exitoso: gana 100 XP
        var response1 = await Client.PostAsync($"/api/v1/challenges/{ch101Id}/evaluate", content);
        var body1 = await response1.Content.ReadAsStringAsync();
        var env1 = JsonSerializer.Deserialize<ApiResponse<EvaluateArchitectureResponseDto>>(body1, JsonOptions);
        env1!.Data.EarnedXP.Should().Be(100);
        env1.Data.CurrentUserXP.Should().Be(100);

        // 2. Segundo intento idéntico: no supera el récord de 100, earnedXP debe ser 0 (RN-10)
        var response2 = await Client.PostAsync($"/api/v1/challenges/{ch101Id}/evaluate", content);
        var body2 = await response2.Content.ReadAsStringAsync();
        var env2 = JsonSerializer.Deserialize<ApiResponse<EvaluateArchitectureResponseDto>>(body2, JsonOptions);
        env2!.Data.EarnedXP.Should().Be(0);
        env2.Data.CurrentUserXP.Should().Be(100);
        env2.Data.IsNewHighScore.Should().BeFalse();
    }
}
