namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class NetworkTopologyEvaluatorTests
{
    private readonly NetworkTopologyEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenPublicSubnetHasRouteToIgw_ShouldPass()
    {
        // Arrange
        var igw = new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" };
        var rt = new GraphComponent
        {
            Id = "rt-pub",
            ServiceCode = "NET_ROUTE_TABLE",
            Config = new ComponentConfig
            {
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-1" }]
            }
        };
        var publicSubnet = new GraphComponent
        {
            Id = "sub-pub",
            ServiceCode = "NET_SUBNET",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Public, RouteTableId = "rt-pub" }
        };

        var graph = new SemanticGraph { Components = [igw, rt, publicSubnet] };
        var rules = new ChallengeEvaluationRules
        {
            RoutingRules =
            [
                new RoutingRule
                {
                    SubnetTier = SubnetTier.Public,
                    RequiresRouteTo = "NET_IGW",
                    PenaltyIfMissing = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.NetworkTopology && i.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }

    [Fact]
    public void Evaluate_WhenPublicSubnetLacksRouteToIgw_ShouldFailWithPenalty()
    {
        // Arrange
        var publicSubnet = new GraphComponent
        {
            Id = "sub-pub",
            ServiceCode = "NET_SUBNET",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Public }
        };

        var graph = new SemanticGraph { Components = [publicSubnet] };
        var rules = new ChallengeEvaluationRules
        {
            RoutingRules =
            [
                new RoutingRule
                {
                    SubnetTier = SubnetTier.Public,
                    RequiresRouteTo = "NET_IGW",
                    PenaltyIfMissing = 20,
                    Description = "La subnet pública debe tener ruta a IGW"
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.NetworkTopology && i.Status == FeedbackItemStatus.Fail);
        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenPrivateSubnetHasDirectRouteToIgw_ShouldFailDueToForbiddenRoute()
    {
        // Arrange
        var igw = new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" };
        var privateSubnet = new GraphComponent
        {
            Id = "sub-priv",
            ServiceCode = "NET_SUBNET",
            Config = new ComponentConfig
            {
                SubnetTier = SubnetTier.Private,
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-1" }]
            }
        };

        var graph = new SemanticGraph { Components = [igw, privateSubnet] };
        var rules = new ChallengeEvaluationRules
        {
            RoutingRules =
            [
                new RoutingRule
                {
                    SubnetTier = SubnetTier.Private,
                    ForbiddenRouteTo = "NET_IGW",
                    PenaltyIfMissing = 25,
                    Description = "Subnet privada no debe rutear a IGW"
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.Security && i.Status == FeedbackItemStatus.Fail);
        context.TotalErrorPenalties.Should().Be(25);
    }

    [Fact]
    public void Evaluate_WhenPrivateSubnetHasRouteViaNatGateway_ShouldPass()
    {
        // Arrange
        var nat = new GraphComponent { Id = "nat-1", ServiceCode = "NET_NAT_GATEWAY" };
        var privateSubnet = new GraphComponent
        {
            Id = "sub-priv",
            ServiceCode = "NET_SUBNET",
            Config = new ComponentConfig
            {
                SubnetTier = SubnetTier.Private,
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "nat-1" }]
            }
        };

        var graph = new SemanticGraph { Components = [nat, privateSubnet] };
        var rules = new ChallengeEvaluationRules
        {
            RoutingRules =
            [
                new RoutingRule
                {
                    SubnetTier = SubnetTier.Private,
                    RequiresRouteTo = "NET_NAT_GATEWAY",
                    ForbiddenRouteTo = "NET_IGW",
                    PenaltyIfMissing = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.NetworkTopology && i.Status == FeedbackItemStatus.Pass);
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.Security && i.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }
}
