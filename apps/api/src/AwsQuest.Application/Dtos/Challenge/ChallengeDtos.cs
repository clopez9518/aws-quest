namespace AwsQuest.Application.Dtos.Challenge;

using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ChallengeDetailResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DifficultyLevel Difficulty { get; init; }
    public ChallengeMode Mode { get; init; }
    public int BaseXP { get; init; }
    public List<ChallengeAllowedServiceDto> AllowedServices { get; init; } = [];
    public HintsSummaryDto HintsSummary { get; init; } = new();
    public ChallengeBriefingDto? Briefing { get; init; }
    public ChallengeReflectionPromptDto? ReflectionPrompt { get; init; }
    public SemanticGraph? LastAttemptGraph { get; init; }
    public SemanticGraph? InitialGraph { get; init; }
}

public class ChallengeReflectionPromptDto
{
    public string Question { get; init; } = string.Empty;
    public WellArchitectedPillar Pillar { get; init; }
    public int BonusXP { get; init; } = 25;
    public List<ReflectionOptionPublicDto> Options { get; init; } = [];
    public bool IsCompleted { get; init; }
    public string? SelectedOptionId { get; init; }
}

public class ReflectionOptionPublicDto
{
    public string Id { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
}

public class SubmitReflectionAnswerRequestDto
{
    public string SelectedOptionId { get; init; } = string.Empty;
}

public class SubmitReflectionAnswerResponseDto
{
    public bool IsCorrect { get; init; }
    public int BonusXpEarned { get; init; }
    public string Explanation { get; init; } = string.Empty;
    public string CorrectOptionId { get; init; } = string.Empty;
    public int CurrentUserXP { get; init; }
    public int CurrentUserLevel { get; init; }
    public List<ReflectionOptionExplanationDto> AllExplanations { get; init; } = [];
}

public class ReflectionOptionExplanationDto
{
    public string Id { get; init; } = string.Empty;
    public bool IsCorrect { get; init; }
    public string Explanation { get; init; } = string.Empty;
}

public class ChallengeBriefingDto
{
    public string KeyConcept { get; init; } = string.Empty;
    public string BusinessScenario { get; init; } = string.Empty;
    public string LearningObjective { get; init; } = string.Empty;
    public List<string> KeyTakeaways { get; init; } = [];
    public List<BriefingKeyComponentDto> KeyComponents { get; init; } = [];
    public string EstimatedReadTime { get; init; } = "30 seg";
}

public class BriefingKeyComponentDto
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ServiceCode { get; init; }
    public string? Category { get; init; }
    public string? Slug { get; init; }
}

public class ChallengeAllowedServiceDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public int? MaxInstances { get; init; }
    public bool IsDistractor { get; init; }
    public ResourceKind Kind { get; init; }
    public PlacementScope PlacementScope { get; init; }
    public string DictionarySlug { get; init; } = string.Empty;
}

public class HintsSummaryDto
{
    public int TotalHints { get; init; }
    public int UnlockedCount { get; init; }
    public List<UnlockedHintDto> UnlockedHints { get; init; } = [];
}

public class UnlockedHintDto
{
    public int OrderIndex { get; init; }
    public string Text { get; init; } = string.Empty;
    public int PenaltyApplied { get; init; }
}

public class UnlockHintResponseDto
{
    public UnlockedHintDto UnlockedHint { get; init; } = new();
    public int TotalHintsUnlocked { get; init; }
    public int TotalPenaltyAccumulated { get; init; }
}
