namespace AwsQuest.Domain.Engine;

using AwsQuest.Domain.Engine.Models;

public interface IEvaluationEngine
{
    EvaluationResult Evaluate(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0);
}
