namespace AwsQuest.IntegrationTests.Evaluation;

using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class Wave1ChallengesGoldSolutionIntegrationTests : IntegrationTestBase
{
    public Wave1ChallengesGoldSolutionIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    private async Task<Guid> CreateTestUserAsync(AppDbContext context)
    {
        var user = new AwsQuest.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Name = $"Test User {Guid.NewGuid():N}",
            Email = $"test-{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            IsGuest = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user.Id;
    }

    [Fact]
    public async Task Evaluate_Unit1_Challenge102_EbsGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Persistencia: EBS"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "ebs-1", ServiceCode = "AWS_EBS" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "ec2-1",
                        ToComponentId = "ebs-1",
                        ConnectionType = "ATTACHED_STORAGE"
                    }
                ]
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, userId, request);

        result.Passed.Should().BeTrue();
        result.Score.Should().BeGreaterThanOrEqualTo(70);
    }

    [Fact]
    public async Task Evaluate_Unit2_Challenge203_CloudFrontS3GoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("CloudFront + S3"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "cf-1", ServiceCode = "AWS_CLOUDFRONT" },
                    new GraphComponent { Id = "s3-1", ServiceCode = "AWS_S3" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "cf-1",
                        ToComponentId = "s3-1",
                        ConnectionType = "ORIGIN"
                    }
                ]
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, userId, request);

        result.Passed.Should().BeTrue();
        result.Score.Should().BeGreaterThanOrEqualTo(70);
    }

    [Fact]
    public async Task Evaluate_Unit3_Challenge302_VpcIgwGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Conectar la VPC a Internet"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                    new GraphComponent
                    {
                        Id = "subnet-pub-1",
                        ServiceCode = "NET_SUBNET",
                        ParentId = "vpc-1",
                        Config = new ComponentConfig { SubnetTier = SubnetTier.Public, SubnetType = "Public" }
                    },
                    new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" },
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "subnet-pub-1" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "vpc-1",
                        ToComponentId = "igw-1",
                        ConnectionType = "ATTACHED_VPC"
                    }
                ]
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, userId, request);

        result.Passed.Should().BeTrue();
        result.Score.Should().BeGreaterThanOrEqualTo(70);
    }

    [Fact]
    public async Task Evaluate_Unit4_Challenge403_RepairExposedDatabaseGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Base de Datos Expuesta"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        // Remediated topology: RDS moved to private subnet
        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                    new GraphComponent
                    {
                        Id = "subnet-pub",
                        ServiceCode = "NET_SUBNET",
                        ParentId = "vpc-1",
                        Config = new ComponentConfig { SubnetTier = SubnetTier.Public, SubnetType = "Public" }
                    },
                    new GraphComponent
                    {
                        Id = "subnet-priv",
                        ServiceCode = "NET_SUBNET",
                        ParentId = "vpc-1",
                        Config = new ComponentConfig { SubnetTier = SubnetTier.Private, SubnetType = "Private" }
                    },
                    new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" },
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "subnet-pub" },
                    new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS", ParentId = "subnet-priv", Config = new ComponentConfig { IsPublic = false } }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "vpc-1",
                        ToComponentId = "igw-1",
                        ConnectionType = "ATTACHED_VPC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-1",
                        ToComponentId = "rds-1",
                        ConnectionType = "DATABASE"
                    }
                ]
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, userId, request);

        result.Passed.Should().BeTrue();
        result.Score.Should().BeGreaterThanOrEqualTo(70);
    }

    [Fact]
    public async Task Evaluate_Unit5_Challenge505_SreOutageIncidentGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Incidente SRE: Servidor Saturado"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        // Remediated topology: ALB + 2 EC2 in public subnets + RDS in private subnet
        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                    new GraphComponent
                    {
                        Id = "subnet-pub-1",
                        ServiceCode = "NET_SUBNET",
                        ParentId = "vpc-1",
                        Config = new ComponentConfig { SubnetTier = SubnetTier.Public, SubnetType = "Public" }
                    },
                    new GraphComponent
                    {
                        Id = "subnet-priv-1",
                        ServiceCode = "NET_SUBNET",
                        ParentId = "vpc-1",
                        Config = new ComponentConfig { SubnetTier = SubnetTier.Private, SubnetType = "Private" }
                    },
                    new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" },
                    new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "subnet-pub-1" },
                    new GraphComponent { Id = "ec2-2", ServiceCode = "AWS_EC2", ParentId = "subnet-pub-1" },
                    new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS", ParentId = "subnet-priv-1", Config = new ComponentConfig { IsPublic = false, IsMultiAz = true } }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "vpc-1",
                        ToComponentId = "igw-1",
                        ConnectionType = "ATTACHED_VPC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-1",
                        ToComponentId = "ec2-1",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-1",
                        ToComponentId = "ec2-2",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-1",
                        ToComponentId = "rds-1",
                        ConnectionType = "DATABASE"
                    }
                ]
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, userId, request);

        result.Passed.Should().BeTrue();
        result.Score.Should().BeGreaterThanOrEqualTo(70);
    }
}
