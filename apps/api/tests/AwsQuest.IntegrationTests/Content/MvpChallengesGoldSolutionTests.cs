namespace AwsQuest.IntegrationTests.Content;

using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class MvpChallengesGoldSolutionTests
{
    private readonly string _contentPath;
    private readonly JsonChallengeContentReader _reader;
    private readonly EvaluationEngine _engine;

    public MvpChallengesGoldSolutionTests()
    {
        _contentPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../../content"));
        if (!Directory.Exists(_contentPath))
        {
            _contentPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../../../../content"));
        }
        if (!Directory.Exists(_contentPath))
        {
            _contentPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "content"));
        }

        _reader = new JsonChallengeContentReader();
        _engine = new EvaluationEngine();
    }

    private async Task<ChallengeEvaluationRules> GetRulesAsync(string challengeTitle)
    {
        var package = await _reader.ReadContentAsync(_contentPath);
        var challenge = package.Units.SelectMany(u => u.Challenges).FirstOrDefault(c => c.Title.Contains(challengeTitle));
        challenge.Should().NotBeNull($"el desafío '{challengeTitle}' debe existir en el contenido");
        return challenge!.EvaluationRules;
    }

    [Fact]
    public async Task Challenge101_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 101: Mi primer servidor con EC2
        var rules = await GetRulesAsync("Mi primer servidor");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { InstanceCount = 1 }
                }
            ],
            Connections = []
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
        result.Feedback.Items.Should().Contain(i => i.Status == FeedbackItemStatus.Pass);
    }

    [Fact]
    public async Task Challenge102_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 102: Persistencia: EBS
        var rules = await GetRulesAsync("Persistencia: EBS");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", Config = new ComponentConfig { InstanceCount = 1 } },
                new GraphComponent { Id = "ebs-1", ServiceCode = "AWS_EBS", Config = new ComponentConfig { InstanceCount = 1 } }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "ebs-1", ConnectionType = "ATTACHED_STORAGE" }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public async Task Challenge104_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 104: Almacenamiento de objetos con S3
        var rules = await GetRulesAsync("Almacenamiento de objetos con S3");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "s3-1", ServiceCode = "AWS_S3" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "s3-1", ConnectionType = "OBJECT_STORAGE" }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public async Task Challenge202_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 202: Separando Frontend y Backend con S3 + EC2
        var rules = await GetRulesAsync("Separando Frontend y Backend");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "s3-frontend", ServiceCode = "AWS_S3" },
                new GraphComponent { Id = "ec2-backend", ServiceCode = "AWS_EC2" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "s3-frontend", ToComponentId = "ec2-backend", ConnectionType = "HTTP_API" }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public async Task Challenge301_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 301: Crear una VPC y sus Subnets
        var rules = await GetRulesAsync("Crear una VPC y sus Subnets");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                new GraphComponent { Id = "sub-1", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" },
                new GraphComponent { Id = "sub-2", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" }
            ],
            Connections = []
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public async Task Challenge401_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 401: Base de Datos con RDS
        var rules = await GetRulesAsync("Base de Datos con RDS");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                new GraphComponent { Id = "sub-priv", ServiceCode = "NET_SUBNET", ParentId = "vpc-1", Config = new ComponentConfig { SubnetTier = SubnetTier.Private, SubnetType = "Private" } },
                new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS", ParentId = "sub-priv", Config = new ComponentConfig { IsPublic = false } }
            ],
            Connections = []
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public async Task Challenge501_WithAntiPattern_ShouldFailWithPenalties()
    {
        var rules = await GetRulesAsync("Eliminar un Single Point of Failure");

        // Arquitectura defectuosa con SPOF
        var defectiveGraph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", Config = new ComponentConfig { InstanceCount = 1, AutoScaling = false } }
            ],
            Connections = []
        };

        var result = _engine.Evaluate(defectiveGraph, rules, hintsUsed: 0);

        result.Passed.Should().BeFalse();
        result.Score.Should().BeLessThan(70);
        result.Feedback.Items.Should().Contain(i => i.Title.Contains("Punto Único de Fallo") && i.Status == FeedbackItemStatus.Fail);
    }
}
