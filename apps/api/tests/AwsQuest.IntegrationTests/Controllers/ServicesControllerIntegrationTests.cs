namespace AwsQuest.IntegrationTests.Controllers;

using System.Net;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.MasterServices;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Xunit;

public class ServicesControllerIntegrationTests : IntegrationTestBase
{
    public ServicesControllerIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Get_Services_ShouldReturnAllMasterServices()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/services");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<AwsServiceResponseDto>>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Should().HaveCount(32);
        envelope.Data.Should().Contain(s => s.Code == "AWS_S3");
        envelope.Data.Should().Contain(s => s.Code == "AWS_EC2");
        envelope.Data.Should().Contain(s => s.Code == "AWS_RDS");
        envelope.Data.Should().Contain(s => s.Code == "AWS_ALB");
        envelope.Data.Should().Contain(s => s.Code == "AWS_CLOUDFRONT");
        envelope.Data.Should().Contain(s => s.Code == "AWS_DYNAMODB");
        envelope.Data.Should().Contain(s => s.Code == "NET_VPC");
        envelope.Data.Should().Contain(s => s.Code == "NET_SUBNET");
        envelope.Data.Should().Contain(s => s.Code == "NET_IGW");
        envelope.Data.Should().Contain(s => s.Code == "NET_NAT_GATEWAY");
        envelope.Data.Should().Contain(s => s.Code == "AWS_EBS");
        envelope.Data.Should().Contain(s => s.Code == "AWS_ECS");
    }

    [Fact]
    public async Task Get_Services_WithCategoryFilter_ShouldReturnFilteredServices()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/services?category=Compute");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<IReadOnlyList<AwsServiceResponseDto>>>(body, JsonOptions);

        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        envelope.Data.Should().AllSatisfy(s => s.Category.Should().Be("Compute"));
    }
}
