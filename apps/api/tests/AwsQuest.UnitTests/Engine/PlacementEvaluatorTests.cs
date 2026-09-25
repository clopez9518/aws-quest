namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class PlacementEvaluatorTests
{
    private readonly PlacementEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenRdsIsInPrivateSubnet_ShouldPassWithNoPenalty()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var privateSubnet = new GraphComponent
        {
            Id = "sub-priv-1",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Private }
        };
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS",
            ParentId = "sub-priv-1"
        };

        var graph = new SemanticGraph { Components = [vpc, privateSubnet, rds] };
        var rules = new ChallengeEvaluationRules
        {
            PlacementRules =
            [
                new PlacementRule
                {
                    ServiceCode = "AWS_RDS",
                    RequiredContainerCode = "NET_SUBNET",
                    RequiredSubnetTier = SubnetTier.Private,
                    PenaltyIfViolated = 25
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.Placement && i.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }

    [Fact]
    public void Evaluate_WhenRdsIsInPublicSubnetAndPrivateRequired_ShouldFailWithPenalty()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var publicSubnet = new GraphComponent
        {
            Id = "sub-pub-1",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Public }
        };
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS",
            ParentId = "sub-pub-1"
        };

        var graph = new SemanticGraph { Components = [vpc, publicSubnet, rds] };
        var rules = new ChallengeEvaluationRules
        {
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
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.Placement && i.Status == FeedbackItemStatus.Fail);
        context.TotalErrorPenalties.Should().Be(25);
    }

    [Fact]
    public void Evaluate_WhenServiceHasNoParentSubnetAndPlacementRuleExists_ShouldFailWithPenalty()
    {
        // Arrange
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS",
            ParentId = null
        };

        var graph = new SemanticGraph { Components = [rds] };
        var rules = new ChallengeEvaluationRules
        {
            PlacementRules =
            [
                new PlacementRule
                {
                    ServiceCode = "AWS_RDS",
                    RequiredContainerCode = "NET_SUBNET",
                    PenaltyIfViolated = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.Placement && i.Status == FeedbackItemStatus.Fail);
        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenNoPlacementRulesDefined_ShouldPassSilentlyWithoutPenalties()
    {
        // Arrange (Retrocompatibilidad con desafíos legados)
        var ec2 = new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" };
        var graph = new SemanticGraph { Components = [ec2] };
        var rules = new ChallengeEvaluationRules(); // Sin PlacementRules

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().BeEmpty();
        context.TotalErrorPenalties.Should().Be(0);
    }
}
