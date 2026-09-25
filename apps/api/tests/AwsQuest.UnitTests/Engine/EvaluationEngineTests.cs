namespace AwsQuest.UnitTests.Engine;

using System.Diagnostics;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using AwsQuest.Domain.Exceptions;
using FluentAssertions;
using Xunit;

public class EvaluationEngineTests
{
    private readonly EvaluationEngine _engine = new();

    [Fact]
    public void Evaluate_WhenGraphIsEmpty_ShouldThrowInvalidGraphException()
    {
        var emptyGraph = new SemanticGraph();
        var rules = new ChallengeEvaluationRules();

        var act = () => _engine.Evaluate(emptyGraph, rules);

        act.Should().Throw<InvalidGraphException>()
            .WithMessage("*vacía*");
    }

    [Fact]
    public void Evaluate_PerfectThreeTierArchitecture_ShouldReturn100ScoreAndPass()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "alb-1",
                    ServiceCode = "AWS_ALB"
                },
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 }
                },
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = true, IsPublic = false, SubnetType = "Private" }
                }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-1", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "rds-1", ConnectionType = "DATABASE" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"],
            ForbiddenServices = ["AWS_S3"],
            MinInstances = new Dictionary<string, int> { ["AWS_EC2"] = 2 },
            MaxInstances = new Dictionary<string, int> { ["AWS_ALB"] = 1 },
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2" },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS" }
            ],
            ForbiddenConnections =
            [
                new ForbiddenConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_RDS", Penalty = 30 }
            ],
            AntiPatterns =
            [
                new AntiPatternRule { Type = AntiPatternType.SinglePointOfFailure, Penalty = 20 },
                new AntiPatternRule { Type = AntiPatternType.PublicDatabaseExposure, Penalty = 25 }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var result = _engine.Evaluate(graph, rules, hintsUsed: 0, hintPenalties: 0);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.TotalHintPenalties.Should().Be(0);
        result.Feedback.Items.Should().OnlyContain(item => item.Status == FeedbackItemStatus.Pass);
        result.Feedback.Summary.Should().Contain("Excelente trabajo");
    }

    [Fact]
    public void Evaluate_FlawedArchitectureWithSpofAndMissingConnection_ShouldEvaluateAccurately()
    {
        // Arrange: 1 EC2 (no ASG) + RDS (no Multi-AZ, Public) + no ALB
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { AutoScaling = false, InstanceCount = 1 }
                },
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = false, IsPublic = true }
                }
            ],
            Connections = [] // Sin conexión
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"],
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2", PenaltyIfMissing = 15 },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS", PenaltyIfMissing = 15 }
            ],
            AntiPatterns =
            [
                new AntiPatternRule { Type = AntiPatternType.SinglePointOfFailure, Penalty = 20 },
                new AntiPatternRule { Type = AntiPatternType.PublicDatabaseExposure, Penalty = 25 }
            ],
            PassingScoreThreshold = 70
        };

        // Act: 1 pista usada (penalización 5 pts)
        var result = _engine.Evaluate(graph, rules, hintsUsed: 1, hintPenalties: 5);

        // Assert
        // Missing ALB (-20) + Missing ALB->EC2 conn (-15) + Missing EC2->RDS conn (-15) + SPOF (-20) + Public DB (-25) + Hint (-5) = 100
        result.Score.Should().Be(0); // 100 - 95 - 5 = 0
        result.Passed.Should().BeFalse();
        result.Feedback.Items.Should().Contain(i => i.Status == FeedbackItemStatus.Fail);
    }

    [Fact]
    public void Evaluate_Performance_ShouldCompleteUnder100Milliseconds()
    {
        // Arrange: Grafo con 20 nodos y 30 conexiones
        var components = new List<GraphComponent>();
        var connections = new List<GraphConnection>();

        for (int i = 1; i <= 10; i++)
        {
            components.Add(new GraphComponent { Id = $"ec2-{i}", ServiceCode = "AWS_EC2" });
            components.Add(new GraphComponent { Id = $"rds-{i}", ServiceCode = "AWS_RDS" });
            connections.Add(new GraphConnection { FromComponentId = $"ec2-{i}", ToComponentId = $"rds-{i}" });
        }

        var graph = new SemanticGraph { Components = components, Connections = connections };
        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_EC2", "AWS_RDS"],
            RequiredConnections = [new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS" }]
        };

        // Act
        var stopwatch = Stopwatch.StartNew();
        var result = _engine.Evaluate(graph, rules);
        stopwatch.Stop();

        // Assert
        result.Should().NotBeNull();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100);
    }

    [Fact]
    public void Evaluate_FullThreeTierVpcArchitecture_ShouldScore100()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var igw = new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW", ParentId = "vpc-1" };
        var rtPublic = new GraphComponent
        {
            Id = "rt-pub",
            ServiceCode = "NET_ROUTE_TABLE",
            ParentId = "vpc-1",
            Config = new ComponentConfig
            {
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-1" }]
            }
        };
        var publicSubnet = new GraphComponent
        {
            Id = "sub-pub",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Public, RouteTableId = "rt-pub" }
        };
        var alb = new GraphComponent
        {
            Id = "alb-1",
            ServiceCode = "AWS_ALB",
            ParentId = "sub-pub"
        };
        var natGw = new GraphComponent
        {
            Id = "nat-1",
            ServiceCode = "NET_NAT_GATEWAY",
            ParentId = "sub-pub"
        };
        var rtPrivate = new GraphComponent
        {
            Id = "rt-priv",
            ServiceCode = "NET_ROUTE_TABLE",
            ParentId = "vpc-1",
            Config = new ComponentConfig
            {
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "nat-1" }]
            }
        };
        var privateAppSubnet = new GraphComponent
        {
            Id = "sub-priv-app",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Private, RouteTableId = "rt-priv" }
        };
        var ec2 = new GraphComponent
        {
            Id = "ec2-1",
            ServiceCode = "AWS_EC2",
            ParentId = "sub-priv-app",
            Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 }
        };
        var privateDbSubnet = new GraphComponent
        {
            Id = "sub-priv-db",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Private, RouteTableId = "rt-priv" }
        };
        var sgRds = new GraphComponent
        {
            Id = "sg-rds",
            ServiceCode = "NET_SECURITY_GROUP",
            ParentId = "vpc-1",
            Config = new ComponentConfig
            {
                SecurityGroupRules =
                [
                    new SecurityGroupRule
                    {
                        Direction = RuleDirection.Ingress,
                        Protocol = "TCP",
                        FromPort = 5432,
                        ToPort = 5432,
                        Source = "AWS_EC2"
                    }
                ]
            }
        };
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS",
            ParentId = "sub-priv-db",
            Config = new ComponentConfig { IsMultiAz = true, IsPublic = false, SecurityGroupIds = ["sg-rds"] }
        };

        var graph = new SemanticGraph
        {
            Components = [vpc, igw, rtPublic, publicSubnet, alb, natGw, rtPrivate, privateAppSubnet, ec2, privateDbSubnet, sgRds, rds],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-1", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "rds-1", ConnectionType = "DATABASE" },
                new GraphConnection { FromComponentId = "rt-pub", ToComponentId = "igw-1", ConnectionType = "NETWORK_ROUTE" },
                new GraphConnection { FromComponentId = "rt-priv", ToComponentId = "nat-1", ConnectionType = "NETWORK_ROUTE" },
                new GraphConnection { FromComponentId = "sg-rds", ToComponentId = "rds-1", ConnectionType = "ATTACHED_SECURITY_GROUP" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["NET_VPC", "NET_SUBNET", "AWS_ALB", "AWS_EC2", "AWS_RDS"],
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2" },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS" }
            ],
            PlacementRules =
            [
                new PlacementRule { ServiceCode = "AWS_ALB", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Public },
                new PlacementRule { ServiceCode = "AWS_EC2", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private },
                new PlacementRule { ServiceCode = "AWS_RDS", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private }
            ],
            RoutingRules =
            [
                new RoutingRule { SubnetTier = SubnetTier.Public, RequiresRouteTo = "NET_IGW" },
                new RoutingRule { SubnetTier = SubnetTier.Private, RequiresRouteTo = "NET_NAT_GATEWAY" }
            ],
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    ProhibitPublicAccess = true
                }
            ],
            AntiPatterns =
            [
                new AntiPatternRule { Type = AntiPatternType.SinglePointOfFailure, Penalty = 20 },
                new AntiPatternRule { Type = AntiPatternType.PublicDatabaseExposure, Penalty = 25 }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.Feedback.Items.Should().OnlyContain(i => i.Status == FeedbackItemStatus.Pass);
    }

    [Fact]
    public void Evaluate_Challenge103_VpcPublicSubnetIgw_ShouldPassWith100Score()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                new GraphComponent
                {
                    Id = "subnet-1",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-1",
                    Config = new ComponentConfig { SubnetTier = SubnetTier.Public, SubnetType = "Public" }
                },
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    ParentId = "subnet-1"
                },
                new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "vpc-1", ToComponentId = "igw-1", ConnectionType = "ATTACHED_VPC" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["NET_VPC", "NET_SUBNET", "NET_IGW", "AWS_EC2"],
            ForbiddenServices = ["AWS_RDS"],
            MinInstances = new Dictionary<string, int> { ["NET_VPC"] = 1, ["NET_SUBNET"] = 1, ["NET_IGW"] = 1, ["AWS_EC2"] = 1 },
            MaxInstances = new Dictionary<string, int> { ["NET_VPC"] = 1, ["NET_SUBNET"] = 2, ["NET_IGW"] = 1, ["AWS_EC2"] = 1 },
            PlacementRules =
            [
                new PlacementRule { ServiceCode = "NET_SUBNET", RequiredContainerCode = "NET_VPC" },
                new PlacementRule { ServiceCode = "AWS_EC2", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Public }
            ],
            RoutingRules =
            [
                new RoutingRule { SubnetTier = SubnetTier.Public, RequiresRouteTo = "NET_IGW", PenaltyIfMissing = 25 }
            ],
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "NET_VPC", ToServiceCode = "NET_IGW", ConnectionType = "ATTACHED_VPC", IsBidirectional = true, PenaltyIfMissing = 20 }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.Feedback.Items.Should().OnlyContain(i => i.Status == FeedbackItemStatus.Pass);
    }

    [Fact]
    public void Evaluate_Challenge201_WithTwoEc2AndMultiAzRds_ShouldPassWith100Score()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "ec2-2", ServiceCode = "AWS_EC2" },
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = true, IsPublic = false }
                }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-1", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-2", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "rds-1", ConnectionType = "DATABASE" },
                new GraphConnection { FromComponentId = "ec2-2", ToComponentId = "rds-1", ConnectionType = "DATABASE" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"],
            MinInstances = new Dictionary<string, int> { ["AWS_EC2"] = 2 },
            MaxInstances = new Dictionary<string, int> { ["AWS_ALB"] = 1, ["AWS_RDS"] = 1 },
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2", ConnectionType = "HTTP_HTTPS", PenaltyIfMissing = 15 },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS", ConnectionType = "DATABASE", PenaltyIfMissing = 15 }
            ],
            ForbiddenConnections =
            [
                new ForbiddenConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_RDS", Penalty = 25 }
            ],
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "SPOF_EC2",
                    Type = AntiPatternType.SinglePointOfFailure,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability,
                    Title = "Punto Único de Fallo en Cómputo",
                    Feedback = "Una sola instancia EC2 sin Auto Scaling representa un SPOF."
                },
                new AntiPatternRule
                {
                    Code = "PUBLIC_RDS",
                    Type = AntiPatternType.PublicDatabaseExposure,
                    Penalty = 25,
                    Category = FeedbackCategory.Security,
                    Title = "Base de Datos Expuesta a Internet",
                    Feedback = "La base de datos RDS no debe tener acceso público activado."
                },
                new AntiPatternRule
                {
                    Code = "NO_MULTIAZ_RDS",
                    Type = AntiPatternType.MissingMultiAz,
                    Penalty = 15,
                    Category = FeedbackCategory.Availability,
                    Title = "Base de Datos sin Redundancia Multi-AZ",
                    Feedback = "Amazon RDS debe tener la opción Multi-AZ habilitada."
                }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.Feedback.Items.Should().OnlyContain(i => i.Status == FeedbackItemStatus.Pass);
    }

    [Fact]
    public void Evaluate_Challenge201_WithAutoScalingEc2AndMultiAzRds_ShouldPassWith100Score()
    {
        // Arrange: 1 nodo EC2 con AutoScaling = true e instanceCount = 2
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 }
                },
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = true, IsPublic = false }
                }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-1", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "rds-1", ConnectionType = "DATABASE" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"],
            MinInstances = new Dictionary<string, int> { ["AWS_EC2"] = 2 },
            MaxInstances = new Dictionary<string, int> { ["AWS_ALB"] = 1, ["AWS_RDS"] = 1 },
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2", ConnectionType = "HTTP_HTTPS", PenaltyIfMissing = 15 },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS", ConnectionType = "DATABASE", PenaltyIfMissing = 15 }
            ],
            ForbiddenConnections =
            [
                new ForbiddenConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_RDS", Penalty = 25 }
            ],
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "SPOF_EC2",
                    Type = AntiPatternType.SinglePointOfFailure,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability,
                    Title = "Punto Único de Fallo en Cómputo"
                },
                new AntiPatternRule
                {
                    Code = "NO_MULTIAZ_RDS",
                    Type = AntiPatternType.MissingMultiAz,
                    Penalty = 15,
                    Category = FeedbackCategory.Availability,
                    Title = "Base de Datos sin Redundancia Multi-AZ"
                }
            ],
            PassingScoreThreshold = 70
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.Feedback.Items.Should().OnlyContain(i => i.Status == FeedbackItemStatus.Pass);
    }
}
