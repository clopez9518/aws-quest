namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class ConnectionEvaluatorTests
{
    private readonly ConnectionEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenRequiredConnectionsPresent_ShouldAddPassFeedback()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "ec2-1", ConnectionType = "HTTP_HTTPS" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredConnections =
            [
                new RequiredConnectionRule
                {
                    FromServiceCode = "AWS_ALB",
                    ToServiceCode = "AWS_EC2",
                    PenaltyIfMissing = 15,
                    Description = "ALB conectado a EC2"
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().ContainSingle(item =>
            item.Status == FeedbackItemStatus.Pass &&
            item.Category == FeedbackCategory.Connection);

        context.TotalErrorPenalties.Should().Be(0);
    }

    [Fact]
    public void Evaluate_WhenRequiredConnectionMissing_ShouldAddFailFeedbackWithPenalty()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" }
            ],
            Connections = []
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredConnections =
            [
                new RequiredConnectionRule
                {
                    FromServiceCode = "AWS_ALB",
                    ToServiceCode = "AWS_EC2",
                    PenaltyIfMissing = 15,
                    Description = "ALB conectado a EC2"
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Category == FeedbackCategory.Connection &&
            item.PenaltyApplied == 15);

        context.TotalErrorPenalties.Should().Be(15);
    }

    [Fact]
    public void Evaluate_WhenForbiddenConnectionExists_ShouldAddFailFeedbackWithPenalty()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "alb-1", ToComponentId = "rds-1", ConnectionType = "HTTP_HTTPS" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            ForbiddenConnections =
            [
                new ForbiddenConnectionRule
                {
                    FromServiceCode = "AWS_ALB",
                    ToServiceCode = "AWS_RDS",
                    Reason = "Conexión directa indebida entre ALB y base de datos.",
                    Penalty = 20
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Category == FeedbackCategory.Security &&
            item.PenaltyApplied == 20);

        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenOrphanComponentExists_ShouldAddWarningFeedback()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS" },
                new GraphComponent { Id = "s3-orphan", ServiceCode = "AWS_S3" }
            ],
            Connections =
            [
                new GraphConnection { FromComponentId = "ec2-1", ToComponentId = "rds-1", ConnectionType = "DATABASE" }
            ]
        };

        var rules = new ChallengeEvaluationRules();
        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Warning &&
            item.Category == FeedbackCategory.ArchitecturePattern &&
            item.RelatedComponentIds.Contains("s3-orphan"));
    }
}
