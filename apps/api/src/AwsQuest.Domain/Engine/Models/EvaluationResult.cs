namespace AwsQuest.Domain.Engine.Models;

public class EvaluationResult
{
    public int Score { get; set; }
    public bool Passed => Score >= PassingThreshold;
    public int PassingThreshold { get; set; } = 70;
    public EvaluationFeedback Feedback { get; set; } = new();
    public int HintsUsed { get; set; }
    public int TotalHintPenalties { get; set; }
    public int TotalErrorPenalties { get; set; }
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

    public static EvaluationResult Create(
        int rawScore,
        int hintPenalties,
        int errorPenalties,
        EvaluationFeedback feedback,
        int hintsUsed,
        int passingThreshold = 70)
    {
        var finalScore = Math.Clamp(100 - errorPenalties - hintPenalties, 0, 100);

        return new EvaluationResult
        {
            Score = finalScore,
            PassingThreshold = passingThreshold,
            Feedback = feedback,
            HintsUsed = hintsUsed,
            TotalHintPenalties = hintPenalties,
            TotalErrorPenalties = errorPenalties,
            EvaluatedAt = DateTime.UtcNow
        };
    }
}
