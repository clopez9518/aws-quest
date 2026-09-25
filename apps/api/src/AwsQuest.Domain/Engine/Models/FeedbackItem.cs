namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class FeedbackItem
{
    public FeedbackItemStatus Status { get; set; } = FeedbackItemStatus.Pass;
    public FeedbackCategory Category { get; set; } = FeedbackCategory.ServiceSelection;
    public string Title { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int PenaltyApplied { get; set; } = 0;
    public List<string> RelatedComponentIds { get; set; } = [];

    // Campos Pedagógicos y Formativos (Fase 0 - Well-Architected Framework)
    public string? ProductionRisk { get; set; }
    public string? WellArchitectedPillar { get; set; }
    public string? FormativeRecommendation { get; set; }
}
