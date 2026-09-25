namespace AwsQuest.Domain.Engine.Models;

public class ChallengeEvaluationRules
{
    // Reglas Existentes (Compatibilidad 100%)
    public List<string> RequiredServices { get; set; } = [];
    public List<string> ForbiddenServices { get; set; } = [];
    public Dictionary<string, int> MinInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, int> MaxInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<RequiredConnectionRule> RequiredConnections { get; set; } = [];
    public List<ForbiddenConnectionRule> ForbiddenConnections { get; set; } = [];
    public List<AntiPatternRule> AntiPatterns { get; set; } = [];
    public int PassingScoreThreshold { get; set; } = 70;

    // Nuevas Reglas de Infraestructura y Topología
    public List<PlacementRule> PlacementRules { get; set; } = [];
    public List<RoutingRule> RoutingRules { get; set; } = [];
    public List<SecurityGroupRuleModel> SecurityGroupRules { get; set; } = [];
}
