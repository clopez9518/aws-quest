namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class ScoreCalculatorTests
{
    private readonly ScoreCalculator _calculator = new();

    [Fact]
    public void Calculate_WhenZeroErrorsAndZeroHints_ShouldReturnScore100AndPass()
    {
        // Arrange
        var graph = new SemanticGraph { Components = [new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }] };
        var rules = new ChallengeEvaluationRules { PassingScoreThreshold = 70 };
        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        var result = _calculator.Calculate(context);

        // Assert
        result.Score.Should().Be(100);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(0);
        result.TotalHintPenalties.Should().Be(0);
        result.Feedback.Summary.Should().Contain("Excelente trabajo");
    }

    [Fact]
    public void Calculate_WhenPenaltyCausesScoreAboveThreshold_ShouldPass()
    {
        // Arrange
        var graph = new SemanticGraph { Components = [new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }] };
        var rules = new ChallengeEvaluationRules { PassingScoreThreshold = 70 };
        var context = new EvaluationExecutionContext(graph, rules);

        context.AddFeedback(new FeedbackItem
        {
            Status = FeedbackItemStatus.Fail,
            PenaltyApplied = 20
        });

        // Act
        var result = _calculator.Calculate(context);

        // Assert
        result.Score.Should().Be(80);
        result.Passed.Should().BeTrue();
        result.TotalErrorPenalties.Should().Be(20);
        result.Feedback.Summary.Should().Contain("aprobado con 80/100");
    }

    [Fact]
    public void Calculate_WhenPenaltiesAndHintsReduceScoreBelow70_ShouldFail()
    {
        // Arrange
        var graph = new SemanticGraph { Components = [new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }] };
        var rules = new ChallengeEvaluationRules { PassingScoreThreshold = 70 };
        var context = new EvaluationExecutionContext(graph, rules, hintsUsed: 2, hintPenalties: 15);

        context.AddFeedback(new FeedbackItem
        {
            Status = FeedbackItemStatus.Fail,
            PenaltyApplied = 20
        });

        // Act
        var result = _calculator.Calculate(context);

        // Assert
        // Score = 100 - 20 (errors) - 15 (hints) = 65
        result.Score.Should().Be(65);
        result.Passed.Should().BeFalse();
        result.TotalErrorPenalties.Should().Be(20);
        result.TotalHintPenalties.Should().Be(15);
        result.Feedback.Items.Should().Contain(item => item.Category == FeedbackCategory.HintPenalty);
    }

    [Fact]
    public void Calculate_WhenScoreExactlyAtPassingThreshold_ShouldPass()
    {
        // Arrange
        var graph = new SemanticGraph { Components = [new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }] };
        var rules = new ChallengeEvaluationRules { PassingScoreThreshold = 70 };
        var context = new EvaluationExecutionContext(graph, rules);

        context.AddFeedback(new FeedbackItem
        {
            Status = FeedbackItemStatus.Fail,
            PenaltyApplied = 30
        });

        // Act
        var result = _calculator.Calculate(context);

        // Assert
        result.Score.Should().Be(70);
        result.Passed.Should().BeTrue();
    }

    [Fact]
    public void Calculate_WhenTotalPenaltiesExceed100_ShouldClampToZero()
    {
        // Arrange
        var graph = new SemanticGraph { Components = [new GraphComponent { Id = "c1", ServiceCode = "AWS_EC2" }] };
        var rules = new ChallengeEvaluationRules();
        var context = new EvaluationExecutionContext(graph, rules, hintsUsed: 3, hintPenalties: 30);

        context.AddFeedback(new FeedbackItem
        {
            Status = FeedbackItemStatus.Fail,
            PenaltyApplied = 90
        });

        // Act
        var result = _calculator.Calculate(context);

        // Assert
        // Raw = 100 - 90 - 30 = -20 -> Clamped = 0
        result.Score.Should().Be(0);
        result.Passed.Should().BeFalse();
    }
}
