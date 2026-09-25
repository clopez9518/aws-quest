namespace AwsQuest.IntegrationTests.Infrastructure;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Auth;
using FluentAssertions;
using Xunit;

[CollectionDefinition("DatabaseCollection")]
public class DatabaseCollection : ICollectionFixture<TestDatabaseFixture> { }

[Collection("DatabaseCollection")]
public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected readonly TestDatabaseFixture Fixture;
    protected readonly HttpClient Client;
    protected readonly JsonSerializerOptions JsonOptions;

    protected IntegrationTestBase(TestDatabaseFixture fixture)
    {
        Fixture = fixture;
        Client = fixture.Factory.CreateClient();
        JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
        JsonOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    }

    public virtual async Task InitializeAsync()
    {
        await Fixture.ResetUserDataAsync();
        Client.DefaultRequestHeaders.Authorization = null;
    }

    public virtual Task DisposeAsync() => Task.CompletedTask;

    protected async Task<GuestSessionResponseDto> CreateGuestSessionAsync()
    {
        var response = await Client.PostAsync("/api/v1/auth/guest", null);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<GuestSessionResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        return envelope.Data;
    }

    protected async Task<RegisterResponseDto> CreateRegisteredUserAsync(
        string email = "test@awsquest.io",
        string password = "Password123!",
        string name = "Cloud Architect")
    {
        var request = new RegisterRequestDto
        {
            Email = email,
            Password = password,
            Name = name
        };
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/register", content);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<RegisterResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        return envelope.Data;
    }

    protected void SetAuthorizationToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
