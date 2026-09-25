namespace AwsQuest.Domain.Engine.Models;

public class EvaluationFeedback
{
    public string Summary { get; set; } = string.Empty;
    public List<FeedbackItem> Items { get; set; } = [];

    // Consolidación Post-Desafío (Fase 0)
    public List<string> KeyConceptsLearned { get; set; } = [];
    public string? ArchitecturalTradeoffs { get; set; }
}
