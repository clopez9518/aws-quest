namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class SecurityGroupEvaluatorTests
{
    private readonly SecurityGroupEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenRdsHasSecurityGroupAllowingEc2OnPort5432_ShouldPass()
    {
        // Arrange
        var ec2 = new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" };
        var sgDb = new GraphComponent
        {
            Id = "sg-db",
            ServiceCode = "NET_SECURITY_GROUP",
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
            Config = new ComponentConfig { SecurityGroupIds = ["sg-db"] }
        };

        var graph = new SemanticGraph { Components = [ec2, sgDb, rds] };
        var rules = new ChallengeEvaluationRules
        {
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    PenaltyIfViolated = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.SecurityGroup && i.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }

    [Fact]
    public void Evaluate_WhenRdsHasNoSecurityGroupAttached_ShouldFailWithPenalty()
    {
        // Arrange
        var rds = new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS" };
        var graph = new SemanticGraph { Components = [rds] };
        var rules = new ChallengeEvaluationRules
        {
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    PenaltyIfViolated = 20,
                    Description = "RDS requiere un SG asociado"
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.SecurityGroup && i.Status == FeedbackItemStatus.Fail);
        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenRdsSecurityGroupHasPublicAccessOpen_ShouldFailWithPenalty()
    {
        // Arrange
        var sgDb = new GraphComponent
        {
            Id = "sg-db",
            ServiceCode = "NET_SECURITY_GROUP",
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
                        Source = "0.0.0.0/0" // Exposición pública
                    }
                ]
            }
        };
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS",
            Config = new ComponentConfig { SecurityGroupIds = ["sg-db"] }
        };

        var graph = new SemanticGraph { Components = [sgDb, rds] };
        var rules = new ChallengeEvaluationRules
        {
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    ProhibitPublicAccess = true,
                    PenaltyIfViolated = 25
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
    public void Evaluate_WhenRdsSecurityGroupIsAttachedViaGraphConnection_ShouldPass()
    {
        // Arrange
        var ec2 = new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" };
        var sgDb = new GraphComponent
        {
            Id = "sg-db",
            ServiceCode = "NET_SECURITY_GROUP",
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
                        Source = "EC2"
                    }
                ]
            }
        };
        var rds = new GraphComponent
        {
            Id = "rds-1",
            ServiceCode = "AWS_RDS"
        };

        var graph = new SemanticGraph
        {
            Components = [ec2, sgDb, rds],
            Connections =
            [
                new GraphConnection
                {
                    FromComponentId = "sg-db",
                    ToComponentId = "rds-1",
                    ConnectionType = "ATTACHED_SECURITY_GROUP"
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            SecurityGroupRules =
            [
                new SecurityGroupRuleModel
                {
                    TargetServiceCode = "AWS_RDS",
                    AllowedSourceServiceCode = "AWS_EC2",
                    Protocol = "TCP",
                    Port = 5432,
                    PenaltyIfViolated = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(i => i.Category == FeedbackCategory.SecurityGroup && i.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }
}
