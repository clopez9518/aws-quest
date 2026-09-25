namespace AwsQuest.Application.Dtos.Evaluation;

using AwsQuest.Domain.Engine.Models;

public class EvaluateArchitectureRequestDto
{
    public SemanticGraph Graph { get; init; } = new();
    public int HintsUsed { get; init; }
}

public class EvaluateArchitectureResponseDto
{
    public int Score { get; init; }
    public bool Passed { get; init; }
    public bool IsNewHighScore { get; init; }
    public int EarnedXP { get; init; }
    public int CurrentUserXP { get; init; }
    public int CurrentUserLevel { get; init; }
    public EvaluationFeedback Feedback { get; init; } = new();
    public Guid AttemptId { get; init; }
}

public class ChallengeAttemptHistoryDto
{
    public Guid Id { get; init; }
    public int Score { get; init; }
    public bool Passed { get; init; }
    public int HintsUsed { get; init; }
    public DateTime CreatedAt { get; init; }
    public SemanticGraph GraphSubmitted { get; init; } = new();
}
