namespace AwsQuest.IntegrationTests.Content;

using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class NetworkChallengesGoldSolutionTests
{
    private readonly string _contentPath;
    private readonly JsonChallengeContentReader _reader;
    private readonly EvaluationEngine _engine;

    public NetworkChallengesGoldSolutionTests()
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
    public async Task Challenge302_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 302: Conectar la VPC a Internet
        var rules = await GetRulesAsync("Conectar la VPC a Internet");

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
                    Id = "sub-public-1",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-main",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Public,
                        SubnetType = "Public",
                        CidrBlock = "10.0.1.0/24",
                        Routes =
                        [
                            new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-main" }
                        ]
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
                    Id = "ec2-web-1",
                    ServiceCode = "AWS_EC2",
                    ParentId = "sub-public-1",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Compute,
                    Config = new ComponentConfig { InstanceCount = 1, AutoScaling = false }
                }
            ],
            Connections =
            [
                new GraphConnection
                {
                    FromComponentId = "vpc-main",
                    ToComponentId = "igw-main",
                    ConnectionType = "ATTACHED_VPC"
                }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
        result.Feedback.Items.Should().NotContain(i => i.Status == FeedbackItemStatus.Fail);
    }

    [Fact]
    public async Task Challenge302_EC2InPrivateSubnet_ShouldFailPlacementRule()
    {
        var rules = await GetRulesAsync("Conectar la VPC a Internet");

        // EC2 colocado en subred privada en vez de pública
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "vpc-main", ServiceCode = "NET_VPC" },
                new GraphComponent
                {
                    Id = "sub-private-1",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-main",
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Private,
                        SubnetType = "Private",
                        Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-main" }]
                    }
                },
                new GraphComponent { Id = "igw-main", ServiceCode = "NET_IGW", Config = new ComponentConfig { AttachedVpcId = "vpc-main" } },
                new GraphComponent { Id = "ec2-web-1", ServiceCode = "AWS_EC2", ParentId = "sub-private-1" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "vpc-main", ToComponentId = "igw-main", ConnectionType = "ATTACHED_VPC" }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Score.Should().BeLessThan(100);
        result.Feedback.Items.Should().Contain(i => i.Status == FeedbackItemStatus.Fail && i.Category == FeedbackCategory.Placement);
    }

    [Fact]
    public async Task Challenge402_GoldSolution_ShouldPassWith100Score()
    {
        // Challenge 402: Aplicación + RDS en Arquitectura de Capas
        var rules = await GetRulesAsync("Aplicación + RDS en Arquitectura de Capas");

        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "vpc-prod",
                    ServiceCode = "NET_VPC",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig { CidrBlock = "10.0.0.0/16" }
                },
                new GraphComponent
                {
                    Id = "sub-public-web",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-prod",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Public,
                        SubnetType = "Public",
                        CidrBlock = "10.0.1.0/24",
                        Routes =
                        [
                            new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-prod" }
                        ]
                    }
                },
                new GraphComponent
                {
                    Id = "sub-private-db",
                    ServiceCode = "NET_SUBNET",
                    ParentId = "vpc-prod",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig
                    {
                        SubnetTier = SubnetTier.Private,
                        SubnetType = "Private",
                        CidrBlock = "10.0.2.0/24"
                    }
                },
                new GraphComponent
                {
                    Id = "igw-prod",
                    ServiceCode = "NET_IGW",
                    Kind = ResourceKind.NetworkInfrastructure,
                    Category = ResourceCategory.NetworkVpc,
                    Config = new ComponentConfig { AttachedVpcId = "vpc-prod" }
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
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 80, ToPort = 80, Source = "0.0.0.0/0" }
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
                            new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 5432, ToPort = 5432, Source = "sg-ec2" }
                        ]
                    }
                },
                new GraphComponent
                {
                    Id = "ec2-app-1",
                    ServiceCode = "AWS_EC2",
                    ParentId = "sub-public-web",
                    Kind = ResourceKind.ManagedService,
                    Category = ResourceCategory.Compute,
                    Config = new ComponentConfig
                    {
                        InstanceCount = 1,
                        SecurityGroupIds = ["sg-ec2"]
                    }
                },
                new GraphComponent
                {
                    Id = "rds-postgres-1",
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
                new GraphConnection
                {
                    FromComponentId = "vpc-prod",
                    ToComponentId = "igw-prod",
                    ConnectionType = "ATTACHED_VPC"
                },
                new GraphConnection
                {
                    FromComponentId = "ec2-app-1",
                    ToComponentId = "rds-postgres-1",
                    ConnectionType = "DATABASE"
                },
                new GraphConnection
                {
                    FromComponentId = "ec2-app-1",
                    ToComponentId = "sg-ec2",
                    ConnectionType = "ATTACHED_SECURITY_GROUP"
                },
                new GraphConnection
                {
                    FromComponentId = "rds-postgres-1",
                    ToComponentId = "sg-rds",
                    ConnectionType = "ATTACHED_SECURITY_GROUP"
                }
            ]
        };

        var result = _engine.Evaluate(graph, rules, hintsUsed: 0);

        result.Passed.Should().BeTrue();
        result.Score.Should().Be(100);
        result.Feedback.Items.Should().NotContain(i => i.Status == FeedbackItemStatus.Fail);
    }
}
