namespace AwsQuest.UnitTests.Engine;

using System.Text.Json;
using System.Text.Json.Serialization;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using AwsQuest.Domain.Exceptions;
using FluentAssertions;
using Xunit;

public class DomainModelsTests
{
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        WriteIndented = true
    };

    [Fact]
    public void SemanticGraph_ShouldCorrectlyQueryComponentsAndConnections()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "node-alb-1",
                    ServiceCode = "AWS_ALB",
                    Config = new ComponentConfig { IsPublic = true }
                },
                new GraphComponent
                {
                    Id = "node-ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 }
                },
                new GraphComponent
                {
                    Id = "node-rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = true }
                }
            ],
            Connections =
            [
                new GraphConnection
                {
                    FromComponentId = "node-alb-1",
                    ToComponentId = "node-ec2-1",
                    ConnectionType = "HTTP_HTTPS"
                },
                new GraphConnection
                {
                    FromComponentId = "node-ec2-1",
                    ToComponentId = "node-rds-1",
                    ConnectionType = "DATABASE"
                }
            ]
        };

        // Act & Assert
        graph.IsEmpty.Should().BeFalse();
        graph.GetComponentCount("AWS_EC2").Should().Be(1);
        graph.GetComponentCount("AWS_S3").Should().Be(0);

        var alb = graph.GetComponentById("node-alb-1");
        alb.Should().NotBeNull();
        alb!.ServiceCode.Should().Be("AWS_ALB");

        graph.HasConnectionBetweenServices("AWS_ALB", "AWS_EC2").Should().BeTrue();
        graph.HasConnectionBetweenServices("AWS_EC2", "AWS_RDS").Should().BeTrue();
        graph.HasConnectionBetweenServices("AWS_ALB", "AWS_RDS").Should().BeFalse();

        var outboundFromAlb = graph.GetOutboundConnections("node-alb-1").ToList();
        outboundFromAlb.Should().HaveCount(1);
        outboundFromAlb[0].ToComponentId.Should().Be("node-ec2-1");

        var inboundToRds = graph.GetInboundConnections("node-rds-1").ToList();
        inboundToRds.Should().HaveCount(1);
        inboundToRds[0].FromComponentId.Should().Be("node-ec2-1");
    }

    [Theory]
    [InlineData(0, 0, 100, true)]
    [InlineData(10, 20, 70, true)]
    [InlineData(15, 20, 65, false)]
    [InlineData(50, 60, 0, false)] // Clamping to 0
    public void EvaluationResult_Create_ShouldComputeScoreAndPassStatusAccurately(
        int hintPenalties,
        int errorPenalties,
        int expectedScore,
        bool expectedPassed)
    {
        // Arrange
        var feedback = new EvaluationFeedback
        {
            Summary = "Test Evaluation",
            Items =
            [
                new FeedbackItem
                {
                    Status = expectedPassed ? FeedbackItemStatus.Pass : FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.Availability,
                    Title = "High Availability Check",
                    Explanation = "Explanation details"
                }
            ]
        };

        // Act
        var result = EvaluationResult.Create(100, hintPenalties, errorPenalties, feedback, hintsUsed: 1);

        // Assert
        result.Score.Should().Be(expectedScore);
        result.Passed.Should().Be(expectedPassed);
        result.TotalHintPenalties.Should().Be(hintPenalties);
        result.TotalErrorPenalties.Should().Be(errorPenalties);
        result.Feedback.Items.Should().HaveCount(1);
    }

    [Fact]
    public void GameScoringRules_CalculateEarnedXp_ShouldRespectAntiFarmingRule()
    {
        const int baseXP = 100;

        // Primer intento aprobado con 80 pts -> +80 XP
        var xp1 = GameScoringRules.CalculateEarnedXp(newScore: 80, previousHighScore: 0, baseXP: baseXP);
        xp1.Should().Be(80);

        // Segundo intento con menor puntuación (75 pts < 80 pts) -> 0 XP adicional
        var xp2 = GameScoringRules.CalculateEarnedXp(newScore: 75, previousHighScore: 80, baseXP: baseXP);
        xp2.Should().Be(0);

        // Tercer intento igualando récord previo (80 pts == 80 pts) -> 0 XP adicional
        var xp3 = GameScoringRules.CalculateEarnedXp(newScore: 80, previousHighScore: 80, baseXP: baseXP);
        xp3.Should().Be(0);

        // Cuarto intento con récord perfecto de 100 pts -> +(100 - 80) = +20 XP
        var xp4 = GameScoringRules.CalculateEarnedXp(newScore: 100, previousHighScore: 80, baseXP: baseXP);
        xp4.Should().Be(20);

        // Intento reprobado (60 pts < 70) incluso si supera 0 -> 0 XP
        var xpFailed = GameScoringRules.CalculateEarnedXp(newScore: 60, previousHighScore: 0, baseXP: baseXP);
        xpFailed.Should().Be(0);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(149, 1)]
    [InlineData(150, 2)]
    [InlineData(299, 2)]
    [InlineData(300, 3)]
    [InlineData(650, 5)]
    public void GameScoringRules_CalculateLevel_ShouldCalculateCorrectLevel(int totalXp, int expectedLevel)
    {
        var level = GameScoringRules.CalculateLevel(totalXp);
        level.Should().Be(expectedLevel);
    }

    [Fact]
    public void ServiceLimitExceededException_ShouldStoreContextProperties()
    {
        var ex = new ServiceLimitExceededException("AWS_EC2", maxInstances: 2, currentInstances: 3);

        ex.ServiceCode.Should().Be("AWS_EC2");
        ex.MaxInstances.Should().Be(2);
        ex.CurrentInstances.Should().Be(3);
        ex.Message.Should().Contain("AWS_EC2").And.Contain("2").And.Contain("3");
    }

    [Fact]
    public void SemanticGraph_ShouldSerializeAndDeserializeJsonCleanly()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "c1",
                    ServiceCode = "AWS_EC2",
                    ParentId = "sub-1",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Compute,
                    Config = new ComponentConfig
                    {
                        AutoScaling = true,
                        InstanceCount = 2,
                        SubnetTier = SubnetTier.Private,
                        SecurityGroupIds = ["sg-app-1"],
                        CustomProperties = new Dictionary<string, object> { ["instanceType"] = "t3.micro" }
                    }
                }
            ],
            Connections =
            [
                new GraphConnection
                {
                    FromComponentId = "c1",
                    ToComponentId = "c2",
                    ConnectionType = "HTTP_HTTPS"
                }
            ]
        };

        // Act
        var json = JsonSerializer.Serialize(graph, _jsonOptions);
        var deserialized = JsonSerializer.Deserialize<SemanticGraph>(json, _jsonOptions);

        // Assert
        deserialized.Should().NotBeNull();
        deserialized!.Components.Should().HaveCount(1);
        deserialized.Components[0].ServiceCode.Should().Be("AWS_EC2");
        deserialized.Components[0].ParentId.Should().Be("sub-1");
        deserialized.Components[0].Kind.Should().Be(ResourceKind.ManagedService);
        deserialized.Components[0].Category.Should().Be(ResourceCategory.Compute);
        deserialized.Components[0].Config.AutoScaling.Should().BeTrue();
        deserialized.Components[0].Config.SubnetTier.Should().Be(SubnetTier.Private);
        deserialized.Components[0].Config.SecurityGroupIds.Should().Contain("sg-app-1");
        deserialized.Connections.Should().HaveCount(1);
        deserialized.Connections[0].ConnectionType.Should().Be("HTTP_HTTPS");
    }

    [Fact]
    public void ChallengeEvaluationRules_ShouldSerializeAndDeserializeNetworkRulesCleanly()
    {
        // Arrange
        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS", "NET_VPC", "NET_SUBNET"],
            ForbiddenServices = ["AWS_S3"],
            MinInstances = new Dictionary<string, int> { ["AWS_EC2"] = 2 },
            MaxInstances = new Dictionary<string, int> { ["AWS_ALB"] = 1 },
            RequiredConnections =
            [
                new RequiredConnectionRule
                {
                    FromServiceCode = "AWS_ALB",
                    ToServiceCode = "AWS_EC2",
                    ConnectionType = "HTTP_HTTPS",
                    PenaltyIfMissing = 15,
                    Description = "ALB debe apuntar a las instancias EC2"
                }
            ],
            PlacementRules =
            [
                new PlacementRule
                {
                    ServiceCode = "AWS_RDS",
                    RequiredContainerCode = "NET_SUBNET",
                    RequiredSubnetTier = SubnetTier.Private,
                    PenaltyIfViolated = 25,
                    Description = "RDS debe residir en subnet privada"
                }
            ],
            RoutingRules =
            [
                new RoutingRule
                {
                    SubnetTier = SubnetTier.Public,
                    RequiresRouteTo = "NET_IGW",
                    PenaltyIfMissing = 20,
                    Description = "Subnet pública debe tener ruta a IGW"
                }
            ],
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    PenaltyIfViolated = 15,
                    Description = "RDS solo acepta tráfico desde EC2 en puerto 5432"
                }
            ],
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "SPOF_EC2",
                    Type = AntiPatternType.SinglePointOfFailure,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability,
                    Title = "Punto único de fallo",
                    Feedback = "Se requiere más de una instancia EC2."
                }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var json = JsonSerializer.Serialize(rules, _jsonOptions);
        var deserialized = JsonSerializer.Deserialize<ChallengeEvaluationRules>(json, _jsonOptions);

        // Assert
        deserialized.Should().NotBeNull();
        deserialized!.RequiredServices.Should().Contain("NET_VPC");
        deserialized.PlacementRules.Should().HaveCount(1);
        deserialized.PlacementRules[0].RequiredSubnetTier.Should().Be(SubnetTier.Private);
        deserialized.RoutingRules.Should().HaveCount(1);
        deserialized.RoutingRules[0].RequiresRouteTo.Should().Be("NET_IGW");
        deserialized.SecurityGroupRules.Should().HaveCount(1);
        deserialized.SecurityGroupRules[0].Port.Should().Be(5432);
        deserialized.AntiPatterns.Should().HaveCount(1);
        deserialized.PassingScoreThreshold.Should().Be(70);
    }
}
