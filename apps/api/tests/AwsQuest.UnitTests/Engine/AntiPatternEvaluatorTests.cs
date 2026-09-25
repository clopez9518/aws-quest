namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class AntiPatternEvaluatorTests
{
    private readonly AntiPatternEvaluator _evaluator = new();

    [Fact]
    public void Evaluate_WhenSingleEc2WithoutAsg_ShouldDetectSpof()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "ec2-1",
                    ServiceCode = "AWS_EC2",
                    Config = new ComponentConfig { AutoScaling = false, InstanceCount = 1 }
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "SPOF_EC2",
                    Type = AntiPatternType.SinglePointOfFailure,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability,
                    Title = "Single Point of Failure en Cómputo",
                    Feedback = "Una única instancia EC2 sin Auto Scaling representa un SPOF."
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.Category == FeedbackCategory.Availability &&
            item.PenaltyApplied == 20);

        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenRdsWithoutMultiAz_ShouldDetectMissingMultiAz()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsMultiAz = false }
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "MISSING_MULTI_AZ",
                    Type = AntiPatternType.MissingMultiAz,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability,
                    Title = "Falta de Redundancia Multi-AZ",
                    Feedback = "La base de datos RDS requiere Multi-AZ para alta disponibilidad."
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().Contain(item =>
            item.Status == FeedbackItemStatus.Fail &&
            item.PenaltyApplied == 20);

        context.TotalErrorPenalties.Should().Be(20);
    }

    [Fact]
    public void Evaluate_WhenPublicDatabaseConfigured_ShouldDetectPublicDatabaseExposure()
    {
        // Arrange
        var graph = new SemanticGraph
        {
            Components =
            [
                new GraphComponent
                {
                    Id = "rds-1",
                    ServiceCode = "AWS_RDS",
                    Config = new ComponentConfig { IsPublic = true, SubnetType = "Public" }
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "PUBLIC_DB",
                    Type = AntiPatternType.PublicDatabaseExposure,
                    Penalty = 25,
                    Category = FeedbackCategory.Security,
                    Title = "Base de datos expuesta públicamente",
                    Feedback = "Las bases de datos deben estar en subnets privadas sin IP pública."
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
            item.PenaltyApplied == 25);

        context.TotalErrorPenalties.Should().Be(25);
    }

    [Fact]
    public void Evaluate_WhenMultipleEc2WithAsgAndMultiAzRds_ShouldPassAllAntiPatterns()
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
                    Config = new ComponentConfig { IsMultiAz = true, IsPublic = false }
                }
            ]
        };

        var rules = new ChallengeEvaluationRules
        {
            AntiPatterns =
            [
                new AntiPatternRule
                {
                    Code = "SPOF_CHECK",
                    Type = AntiPatternType.SinglePointOfFailure,
                    Penalty = 20,
                    Category = FeedbackCategory.Availability
                },
                new AntiPatternRule
                {
                    Code = "PUBLIC_DB_CHECK",
                    Type = AntiPatternType.PublicDatabaseExposure,
                    Penalty = 25,
                    Category = FeedbackCategory.Security
                }
            ]
        };

        var context = new EvaluationExecutionContext(graph, rules);

        // Act
        _evaluator.Evaluate(context);

        // Assert
        context.FeedbackItems.Should().OnlyContain(item => item.Status == FeedbackItemStatus.Pass);
        context.TotalErrorPenalties.Should().Be(0);
    }
}
