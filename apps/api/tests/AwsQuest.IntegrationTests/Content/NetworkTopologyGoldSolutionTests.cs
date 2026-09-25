namespace AwsQuest.IntegrationTests.Content;

using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class NetworkTopologyGoldSolutionTests
{
    private readonly EvaluationEngine _engine;

    public NetworkTopologyGoldSolutionTests()
    {
        _engine = new EvaluationEngine();
    }

    [Fact]
    public void Architecture_Complete3Tier_VpcWithPublicAndPrivateSubnets_ShouldPassWith100Score()
    {
        // Arrange: Arquitectura de 3 capas:
        // - VPC (10.0.0.0/16)
        // - Subred Pública (10.0.1.0/24) con ALB e IGW
        // - Subred Privada 1 (10.0.2.0/24) con EC2 (ASG ON)
        // - Subred Privada 2 (10.0.3.0/24) con RDS (Multi-AZ ON)
        // - Internet Gateway adjunto a VPC
        // - Security Groups con reglas Ingress encadenadas
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "vpc-main",
                    ServiceCode = "NET_VPC",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig { CidrBlock = "10.0.0.0/16" }
                },
                new GraphComponent
                {
                    Id = "sub-public",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-main",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Public,
                        CidrBlock = "10.0.1.0/24",
                        Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-main" }]
                    }
                },
                new GraphComponent
                {
                    Id = "sub-private-app",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-main",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Private,
                        CidrBlock = "10.0.2.0/24"
                    }
                },
                new GraphComponent
                {
                    Id = "sub-private-db",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-main",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Private,
                        CidrBlock = "10.0.3.0/24"
                    }
                },
                new GraphComponent
                {
                    Id = "igw-main",
                    ServiceCode = "NET_IGW",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig { AttachedVpcId = "vpc-main" }
                },
                new GraphComponent
                {
                    Id = "sg-alb",
                    ServiceCode = "NET_SECURITY_GROUP",
                    Kind = ResourceKind.SecurityPolicy,
                    Category = ResourceCategory.Security,
                    Config = new ComponentConfig
                    {
                        SecurityGroupRules =
                        [
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 80, ToPort = 80, Source = "0.0.0.0/0" },
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 443, ToPort = 443, Source = "0.0.0.0/0" }
                        ]
                    }
                },
                new GraphComponent
                {
                    Id = "sg-ec2",
                    ServiceCode = "NET_SECURITY_GROUP",
                    Kind = ResourceKind.SecurityPolicy,
                    Category = ResourceCategory.Security,
                    Config = new ComponentConfig
                    {
                        SecurityGroupRules =
                        [
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 8080, ToPort = 8080, Source = "sg-alb" }
                        ]
                    }
                },
                new GraphComponent
                {
                    Id = "sg-rds",
                    ServiceCode = "NET_SECURITY_GROUP",
                    Kind = ResourceKind.SecurityPolicy,
                    Category = ResourceCategory.Security,
                    Config = new ComponentConfig
                    {
                        SecurityGroupRules =
                        [
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 5432, ToPort = 5432, Source = "AWS_EC2" }
                        ]
                    }
                },
                new GraphComponent
                {
                    Id = "alb-web",
                    ServiceCode = "AWS_ALB",
                    ParentId = "sub-public",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Networking,
                    Config = new ComponentConfig { SecurityGroupIds = ["sg-alb"] }
                },
                new GraphComponent
                {
                    Id = "ec2-app",
                    ServiceCode = "AWS_EC2",
                    ParentId = "sub-private-app",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Compute,
                    Config = new ComponentConfig
                    {
                        AutoScaling = true,
                        InstanceCount = 2,
                        SecurityGroupIds = ["sg-ec2"]
                    }
                },
                new GraphComponent
                {
                    Id = "rds-db",
                    ServiceCode = "AWS_RDS",
                    ParentId = "sub-private-db",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Database,
                    Config = new ComponentConfig
                    {
                        IsMultiAz = true,
                        IsPublic = false,
                        SecurityGroupIds = ["sg-rds"]
                    }
                }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "vpc-main", ToComponentId = "igw-main", ConnectionType = "ATTACHED_VPC" },
                new GraphConnection { FromComponentId = "alb-web", ToComponentId = "ec2-app", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "ec2-app", ToComponentId = "rds-db", ConnectionType = "DATABASE" },
                new GraphConnection { FromComponentId = "alb-web", ToComponentId = "sg-alb", ConnectionType = "ATTACHED_SECURITY_GROUP" },
                new GraphConnection { FromComponentId = "ec2-app", ToComponentId = "sg-ec2", ConnectionType = "ATTACHED_SECURITY_GROUP" },
                new GraphConnection { FromComponentId = "rds-db", ToComponentId = "sg-rds", ConnectionType = "ATTACHED_SECURITY_GROUP" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["NET_VPC", "NET_SUBNET", "NET_IGW", "AWS_ALB", "AWS_EC2", "AWS_RDS", "NET_SECURITY_GROUP"],
            PlacementRules =
            [
                new PlacementRule { ServiceCode = "NET_SUBNET", RequiredContainerCode = "NET_VPC", PenaltyIfViolated = 20 },
                new PlacementRule { ServiceCode = "AWS_ALB", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Public, PenaltyIfViolated = 20 },
                new PlacementRule { ServiceCode = "AWS_EC2", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private, PenaltyIfViolated = 20 },
                new PlacementRule { ServiceCode = "AWS_RDS", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private, PenaltyIfViolated = 25 }
            ],
            RoutingRules =
            [
                new RoutingRule { SubnetTier = SubnetTier.Public, RequiresRouteTo = "NET_IGW", PenaltyIfMissing = 20 }
            ],
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel { TargetServiceCode = "AWS_RDS", AllowedSourceServiceCode = "AWS_EC2", Protocol = "TCP", Port = 5432, PenaltyIfViolated = 20 }
            ],
            RequiredConnections =
            [
                new RequiredConnectionRule { FromServiceCode = "AWS_ALB", ToServiceCode = "AWS_EC2", ConnectionType = "HTTP_HTTPS", PenaltyIfMissing = 15 },
                new RequiredConnectionRule { FromServiceCode = "AWS_EC2", ToServiceCode = "AWS_RDS", ConnectionType = "DATABASE", PenaltyIfMissing = 15 }
            ],
            AntiPatterns =
            [
                new AntiPatternRule { Type = AntiPatternType.SinglePointOfFailure, Penalty = 25 },
                new AntiPatternRule { Type = AntiPatternType.PublicDatabaseExposure, Penalty = 30 }
            ]
        };

        // Act
        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        // Assert
        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
        result.Feedback.Items.Should().NotContain(i => i.Status == FeedbackItemStatus.Fail);
    }

    [Fact]
    public void Architecture_MultiAzSubnetTopology_WithRedundantTiers_ShouldEvaluateSuccessfully()
    {
        // Arrange: 2 Subredes Públicas (AZ-a, AZ-b) y 2 Subredes Privadas (AZ-a, AZ-b) en una VPC
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-enterprise", ServiceCode = "NET_VPC", Config = new ComponentConfig { CidrBlock = "10.0.0.0/16" } },
                new GraphComponent { Id = "sub-pub-1a", ServiceCode = "NET_SUBNET", ParentId = "vpc-enterprise", Config = new ComponentConfig { SubnetTier = SubnetTier.Public, CidrBlock = "10.0.1.0/24" } },
                new GraphComponent { Id = "sub-pub-1b", ServiceCode = "NET_SUBNET", ParentId = "vpc-enterprise", Config = new ComponentConfig { SubnetTier = SubnetTier.Public, CidrBlock = "10.0.2.0/24" } },
                new GraphComponent { Id = "sub-priv-1a", ServiceCode = "NET_SUBNET", ParentId = "vpc-enterprise", Config = new ComponentConfig { SubnetTier = SubnetTier.Private, CidrBlock = "10.0.11.0/24" } },
                new GraphComponent { Id = "sub-priv-1b", ServiceCode = "NET_SUBNET", ParentId = "vpc-enterprise", Config = new ComponentConfig { SubnetTier = SubnetTier.Private, CidrBlock = "10.0.12.0/24" } },
                new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW", Config = new ComponentConfig { AttachedVpcId = "vpc-enterprise" } },
                new GraphComponent { Id = "ec2-app-1", ServiceCode = "AWS_EC2", ParentId = "sub-priv-1a", Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 } },
                new GraphComponent { Id = "ec2-app-2", ServiceCode = "AWS_EC2", ParentId = "sub-priv-1b", Config = new ComponentConfig { AutoScaling = true, InstanceCount = 2 } },
                new GraphComponent { Id = "alb-multi-az", ServiceCode = "AWS_ALB", ParentId = "sub-pub-1a" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "vpc-enterprise", ToComponentId = "igw-1", ConnectionType = "ATTACHED_VPC" },
                new GraphConnection { FromComponentId = "alb-multi-az", ToComponentId = "ec2-app-1", ConnectionType = "HTTP_HTTPS" },
                new GraphConnection { FromComponentId = "alb-multi-az", ToComponentId = "ec2-app-2", ConnectionType = "HTTP_HTTPS" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["NET_VPC", "NET_SUBNET", "NET_IGW", "AWS_ALB", "AWS_EC2"],
            PlacementRules =
            [
                new PlacementRule { ServiceCode = "NET_SUBNET", RequiredContainerCode = "NET_VPC" },
                new PlacementRule { ServiceCode = "AWS_ALB", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Public },
                new PlacementRule { ServiceCode = "AWS_EC2", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private }
            ],
            MinInstances = new Dictionary<string, int> { ["NET_SUBNET"] = 4, ["AWS_EC2"] = 2 }
        };

        // Act
        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        // Assert
        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
    }

    [Fact]
    public void Architecture_IsolatedSubnet_WhenEvaluated_ShouldRecognizePrivateIsolation()
    {
        // Arrange: Subred aislada (Isolated) sin conexión externa
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-secure", ServiceCode = "NET_VPC" },
                new GraphComponent
                {
                    Id = "sub-isolated-vault",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-secure",
                    Config = new ComponentConfig { SubnetTier = SubnetTier.Isolated, CidrBlock = "10.0.99.0/24" }
                },
                new GraphComponent
                {
                    Id = "rds-vault",
                    ServiceCode = "AWS_RDS",
                    ParentId = "sub-isolated-vault",
                    Config = new ComponentConfig { IsPublic = false, IsMultiAz = true }
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            PlacementRules =
            [
                new PlacementRule { ServiceCode = "AWS_RDS", RequiredContainerCode = "NET_SUBNET", RequiredSubnetTier = SubnetTier.Private }
            ],
            AntiPatterns =
            [
                new AntiPatternRule { Type = AntiPatternType.PublicDatabaseExposure, Penalty = 30 }
            ]
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Passed.Should().BeTrue();
        result.Feedback.Items.Should().NotContain(i => i.Category == FeedbackCategory.Security && i.Status == FeedbackItemStatus.Fail);
    }

    [Fact]
    public void Architecture_MissingIgwRouteInPublicSubnet_ShouldApplyRoutingPenalty()
    {
        // Arrange: Subred pública sin ruta hacia Internet Gateway
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-orphan", ServiceCode = "NET_VPC" },
                new GraphComponent
                {
                    Id = "sub-public-broken",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-orphan",
                    Config = new ComponentConfig { SubnetTier = SubnetTier.Public, Routes = [] } // Sin ruta
                },
                new GraphComponent { Id = "igw-disconnected", ServiceCode = "NET_IGW" }, // Sin adjuntar a VPC
                new GraphComponent { Id = "ec2-isolated", ServiceCode = "AWS_EC2", ParentId = "sub-public-broken" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RoutingRules =
            [
                new RoutingRule { SubnetTier = SubnetTier.Public, RequiresRouteTo = "NET_IGW", PenaltyIfMissing = 20, Description = "Falta ruta a IGW" }
            ]
        };

        // Act
        var result = _engine.Evaluate(graph, rules);

        // Assert
        result.Passed.Should().BeTrue();
        result.Score.Should().Be(80);
        result.Feedback.Items.Should().Contain(i => i.Category == FeedbackCategory.NetworkTopology && i.Status == FeedbackItemStatus.Fail);
    }
}
