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

public class Wave3ChallengesGoldSolutionIntegrationTests : IntegrationTestBase
{
    public Wave3ChallengesGoldSolutionIntegrationTests(TestDatabaseFixture fixture) : base(fixture)
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
    public async Task Evaluate_Unit9_Challenge901_EcsEcrGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Contenedores con ECS + ECR"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "ecr-repo", ServiceCode = "AWS_ECR" },
                    new GraphComponent { Id = "ecs-cluster", ServiceCode = "AWS_ECS" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "ecr-repo",
                        ToComponentId = "ecs-cluster",
                        ConnectionType = "CONTAINER_IMAGE"
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
    public async Task Evaluate_Unit9_Challenge902_FargateServerlessGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Ejecución Serverless con Fargate"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "alb-entry", ServiceCode = "AWS_ALB" },
                    new GraphComponent { Id = "ecs-service", ServiceCode = "AWS_ECS" },
                    new GraphComponent { Id = "fargate-compute", ServiceCode = "AWS_FARGATE" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "alb-entry",
                        ToComponentId = "ecs-service",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ecs-service",
                        ToComponentId = "fargate-compute",
                        ConnectionType = "GENERIC"
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
    public async Task Evaluate_Unit10_Challenge1001_CloudWatchMonitoringGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Métricas y Logs con CloudWatch"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "ec2-app", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "rds-db", ServiceCode = "AWS_RDS" },
                    new GraphComponent { Id = "cw-telemetry", ServiceCode = "AWS_CLOUDWATCH" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "ec2-app",
                        ToComponentId = "rds-db",
                        ConnectionType = "DATABASE_QUERY"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-app",
                        ToComponentId = "cw-telemetry",
                        ConnectionType = "MONITORING_METRICS"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "rds-db",
                        ToComponentId = "cw-telemetry",
                        ConnectionType = "MONITORING_METRICS"
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
    public async Task Evaluate_Unit10_Challenge1003_CloudTrailAuditGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Auditoría de actividad con CloudTrail"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "trail-audit", ServiceCode = "AWS_CLOUDTRAIL" },
                    new GraphComponent { Id = "s3-audit-bucket", ServiceCode = "AWS_S3" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "trail-audit",
                        ToComponentId = "s3-audit-bucket",
                        ConnectionType = "OBJECT_ACCESS"
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
    public async Task Evaluate_Unit11_Challenge1102_CloudFormationDeployGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Despliegue automatizado con CloudFormation"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "cfn-stack", ServiceCode = "AWS_CLOUDFORMATION" },
                    new GraphComponent { Id = "s3-assets", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "lambda-handler", ServiceCode = "AWS_LAMBDA" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "cfn-stack",
                        ToComponentId = "s3-assets",
                        ConnectionType = "GENERIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "cfn-stack",
                        ToComponentId = "lambda-handler",
                        ConnectionType = "GENERIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "s3-assets",
                        ToComponentId = "lambda-handler",
                        ConnectionType = "EVENT_NOTIFICATION"
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
    public async Task Evaluate_Unit12_Challenge1201_EcommerceCapstoneGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Diseña una plataforma E-Commerce"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "cf-edge", ServiceCode = "AWS_CLOUDFRONT" },
                    new GraphComponent { Id = "s3-static", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "alb-ingress", ServiceCode = "AWS_ALB" },
                    new GraphComponent { Id = "ec2-app-1", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "ec2-app-2", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "rds-db", ServiceCode = "AWS_RDS", Config = new ComponentConfig { IsMultiAz = true } }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "cf-edge",
                        ToComponentId = "s3-static",
                        ConnectionType = "CDN_ORIGIN"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "cf-edge",
                        ToComponentId = "alb-ingress",
                        ConnectionType = "CDN_ORIGIN"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-ingress",
                        ToComponentId = "ec2-app-1",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "alb-ingress",
                        ToComponentId = "ec2-app-2",
                        ConnectionType = "HTTP_TRAFFIC"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-app-1",
                        ToComponentId = "rds-db",
                        ConnectionType = "DATABASE_QUERY"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "ec2-app-2",
                        ToComponentId = "rds-db",
                        ConnectionType = "DATABASE_QUERY"
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
    public async Task Evaluate_Unit12_Challenge1202_UnpredictableTrafficGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Arquitectura para tráfico impredecible"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "apigw", ServiceCode = "AWS_APIGATEWAY" },
                    new GraphComponent { Id = "sqs-buffer", ServiceCode = "AWS_SQS" },
                    new GraphComponent { Id = "lambda-worker", ServiceCode = "AWS_LAMBDA" },
                    new GraphComponent { Id = "dynamo-storage", ServiceCode = "AWS_DYNAMODB" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "apigw",
                        ToComponentId = "sqs-buffer",
                        ConnectionType = "MESSAGE_ENQUEUE"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "sqs-buffer",
                        ToComponentId = "lambda-worker",
                        ConnectionType = "ASYNC_INVOKE"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "lambda-worker",
                        ToComponentId = "dynamo-storage",
                        ConnectionType = "DATABASE_QUERY"
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
    public async Task Evaluate_Unit12_Challenge1204_ServerlessGlobalGoldSolution_ShouldPass()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await CreateTestUserAsync(context);

        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Diseña una arquitectura Serverless global"));
        challenge.Should().NotBeNull();

        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "cf-dist", ServiceCode = "AWS_CLOUDFRONT" },
                    new GraphComponent { Id = "s3-bucket", ServiceCode = "AWS_S3" },
                    new GraphComponent { Id = "apigw-entry", ServiceCode = "AWS_APIGATEWAY" },
                    new GraphComponent { Id = "lambda-func", ServiceCode = "AWS_LAMBDA" },
                    new GraphComponent { Id = "eventbus", ServiceCode = "AWS_EVENTBRIDGE" },
                    new GraphComponent { Id = "dynamo-tab", ServiceCode = "AWS_DYNAMODB" }
                ],
                Connections =
                [
                    new GraphConnection
                    {
                        FromComponentId = "cf-dist",
                        ToComponentId = "s3-bucket",
                        ConnectionType = "CDN_ORIGIN"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "apigw-entry",
                        ToComponentId = "lambda-func",
                        ConnectionType = "LAMBDA_PROXY"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "lambda-func",
                        ToComponentId = "eventbus",
                        ConnectionType = "EVENT_NOTIFICATION"
                    },
                    new GraphConnection
                    {
                        FromComponentId = "lambda-func",
                        ToComponentId = "dynamo-tab",
                        ConnectionType = "DATABASE_QUERY"
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
