namespace AwsQuest.IntegrationTests.Evaluation;

using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class Wave2ChallengesGoldSolutionIntegrationTests : IntegrationTestBase
{
    public Wave2ChallengesGoldSolutionIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
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
    public async Task Evaluate_Unit6_Challenge604_ServerlessCompleteGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Arquitectura Serverless Completa"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "s3-static", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "apigw-1", ServiceCode = "AWS_APIGATEWAY" },
                    new GraphComponent { Id = "lambda-1", ServiceCode = "AWS_LAMBDA" },
                    new GraphComponent { Id = "dynamo-1", ServiceCode = "AWS_DYNAMODB" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "s3-static",
                        ToComponentId = "apigw-1",
                        ConnectionType = "HTTP_API"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "apigw-1",
                        ToComponentId = "lambda-1",
                        ConnectionType = "INVOCATION"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "lambda-1",
                        ToComponentId = "dynamo-1",
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
    public async Task Evaluate_Unit7_Challenge702_SnsFanOutGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Publicación de Eventos con SNS"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "sns-topic", ServiceCode = "AWS_SNS" },
                    new GraphComponent { Id = "sqs-sub", ServiceCode = "AWS_SQS" },
                    new GraphComponent { Id = "lambda-sub", ServiceCode = "AWS_LAMBDA" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "sns-topic",
                        ToComponentId = "sqs-sub",
                        ConnectionType = "MESSAGE_QUEUE"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "sns-topic",
                        ToComponentId = "lambda-sub",
                        ConnectionType = "INVOCATION"
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
    public async Task Evaluate_Unit7_Challenge704_RepairCoupledSystemGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Reparación de un Sistema Acoplado"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "ec2-web", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "sqs-buffer", ServiceCode = "AWS_SQS" },
                    new GraphComponent { Id = "ec2-worker", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "rds-db", ServiceCode = "AWS_RDS" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "ec2-web",
                        ToComponentId = "sqs-buffer",
                        ConnectionType = "MESSAGE_QUEUE"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "sqs-buffer",
                        ToComponentId = "ec2-worker",
                        ConnectionType = "MESSAGE_QUEUE"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-worker",
                        ToComponentId = "rds-db",
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
    public async Task Evaluate_Unit8_Challenge804_GlobalWebEnterpriseGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Arquitectura Web Global Resiliente"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "r53-dns", ServiceCode = "AWS_ROUTE53" },
                    new GraphComponent { Id = "waf-edge", ServiceCode = "AWS_WAF" },
                    new GraphComponent { Id = "cf-cdn", ServiceCode = "AWS_CLOUDFRONT" },
                    new GraphComponent { Id = "alb-origin", ServiceCode = "AWS_ALB" },
                    new GraphComponent { Id = "ec2-web-1", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "ec2-web-2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "r53-dns",
                        ToComponentId = "cf-cdn",
                        ConnectionType = "DNS_ROUTING"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "waf-edge",
                        ToComponentId = "cf-cdn",
                        ConnectionType = "SECURITY_ATTACHMENT"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "cf-cdn",
                        ToComponentId = "alb-origin",
                        ConnectionType = "ORIGIN"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-origin",
                        ToComponentId = "ec2-web-1",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-origin",
                        ToComponentId = "ec2-web-2",
                        ConnectionType = "HTTP_TRAFFIC"
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
