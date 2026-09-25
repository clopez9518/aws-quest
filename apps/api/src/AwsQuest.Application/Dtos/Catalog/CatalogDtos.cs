namespace AwsQuest.Application.Dtos.Catalog;

using AwsQuest.Domain.Enums;

public class UnitResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int OrderIndex { get; init; }
    public List<CatalogChallengeDto> Challenges { get; init; } = [];
}

public class CatalogChallengeDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public DifficultyLevel Difficulty { get; init; }
    public ChallengeMode Mode { get; init; }
    public int BaseXP { get; init; }
    public int RequiredXP { get; init; }
    public int OrderIndex { get; init; }
    public bool IsLocked { get; init; }
    public string? LockReason { get; init; }
    public ChallengeProgressSummaryDto? UserProgress { get; init; }
}

public class ChallengeProgressSummaryDto
{
    public ProgressStatus Status { get; init; } = ProgressStatus.NotStarted;
    public int HighScore { get; init; }
    public int HintsUsed { get; init; }
    public DateTime? CompletedAt { get; init; }
}
