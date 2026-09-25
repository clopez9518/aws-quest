namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class ServicePresenceEvaluatorTests
{
    private readonly ServicePresenceEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenAllRequiredServicesPresent_ShouldAddPassFeedback()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "c1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "c2", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "c3", ServiceCode = "AWS_RDS" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().HaveCount(3);
        context.FeedbackItems.Should().OnlyContain(item => item.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }

    [Fact]
    public void Evaluate_WhenRequiredServiceMissing_ShouldAddFailFeedbackWithPenalty()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "c2", ServiceCode = "AWS_RDS" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            RequiredServices = ["AWS_ALB", "AWS_EC2", "AWS_RDS"]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Title.Contains("AWS_ALB") &&
            item.PenaltyApplied == 20);

        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenForbiddenServicePresent_ShouldAddFailFeedbackWithPenalty()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" },
                new GraphComponent { Id = "c2", ServiceCode = "AWS_S3" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            ForbiddenServices = ["AWS_S3"]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Title.Contains("AWS_S3") &&
            item.PenaltyApplied == 25);

        context.TotalErrorPenalties.Should().Be(25);
    }

    [Fact]
    public void Evaluate_WhenMinInstancesNotMet_ShouldAddFailFeedback()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            MinInstances = new Dictionary<string, int> { ["AWS_EC2"] = 2 }
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Category == FeedbackCategory.Availability &&
            item.PenaltyApplied == 15);

        context.TotalErrorPenalties.Should().Be(15);
    }

    [Fact]
    public void Evaluate_WhenMaxInstancesExceeded_ShouldAddFailFeedback()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent { Id = "alb1", ServiceCode = "AWS_ALB" },
                new GraphComponent { Id = "alb2", ServiceCode = "AWS_ALB" }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            MaxInstances = new Dictionary<string, int> { ["AWS_ALB"] = 1 }
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Category == FeedbackCategory.CostOptimization &&
            item.PenaltyApplied == 15);

        context.TotalErrorPenalties.Should().Be(15);
    }
}
