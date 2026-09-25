namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text.Json;
using FluentAssertions;
using AwsQuest.IntegrationTests.Infrastructure;
using Xunit;

public class HealthCheckIntegrationTests : IntegrationTestBase
{
    public HealthCheckIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task GetHealth_WhenDatabaseIsRunning_Returns200WithHealthyStatus()
    {
        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        root.GetProperty("status").GetString().Should().Be("Healthy");
        root.TryGetProperty("checks", out var checks).Should().BeTrue();
        checks.GetArrayLength().Should().BeGreaterThan(0);

        var postgresCheck = checks.EnumerateArray().FirstOrDefault(c => c.GetProperty("component").GetString() == "postgresql");
        postgresCheck.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        postgresCheck.GetProperty("status").GetString().Should().Be("Healthy");
    }
}
