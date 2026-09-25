namespace AwsQuest.Domain.Engine.Context;

using AwsQuest.Domain.Engine.Models;

public class EvaluationExecutionContext
{
    public SemanticGraph Graph { get; }
    public ChallengeEvaluationRules Rules { get; }
    public int HintsUsed { get; }
    public int HintPenalties { get; }

    public List<FeedbackItem> FeedbackItems { get; } = [];
    public int TotalErrorPenalties { get; private set; }

    public EvaluationExecutionContext(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0)
    {
        Graph = graph ?? throw new ArgumentNullException(nameof(graph));
        Rules = rules ?? throw new ArgumentNullException(nameof(rules));
        HintsUsed = hintsUsed;
        HintPenalties = hintPenalties;
    }

    public void AddFeedback(FeedbackItem item)
    {
        FeedbackItems.Add(item);
        if (item.PenaltyApplied > 0)
        {
            TotalErrorPenalties += item.PenaltyApplied;
        }
    }
}
