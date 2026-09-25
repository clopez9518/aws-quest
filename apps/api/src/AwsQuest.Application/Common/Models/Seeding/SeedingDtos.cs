
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

namespace AwsQuest.Application.Common.Models.Seeding;

public class ServiceSeedDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ResourceKind Kind { get; set; } = ResourceKind.ManagedService;
    public PlacementScope PlacementScope { get; set; } = PlacementScope.RegionalGlobal;
    public string? DefaultConfigJson { get; set; }
}

public class UnitSeedDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<ChallengeSeedDto> Challenges { get; set; } = [];
}

public class AllowedServiceSeedDto
{
    public string ServiceCode { get; set; } = string.Empty;
    public int? MaxInstances { get; set; }
    public bool IsDistractor { get; set; } = false;
}

public class ChallengeSeedDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Easy;
    public string Mode { get; set; } = "BUILDER";
    public int BaseXP { get; set; } = 100;
    public int RequiredXP { get; set; } = 0;
    public int OrderIndex { get; set; }
    public List<AllowedServiceSeedDto> AllowedServices { get; set; } = [];
    public List<HintDefinition> Hints { get; set; } = [];
    public ChallengeBriefing? Briefing { get; set; }
    public ChallengeReflectionPrompt? ReflectionPrompt { get; set; }
    public SemanticGraph? InitialGraph { get; set; }
    public ChallengeEvaluationRules EvaluationRules { get; set; } = new();
}

public class SystemConfigSeedDto
{
    public AccessMode AccessMode { get; set; } = AccessMode.OpenAccess;
}

public class SeedingDataPackage
{
    public SystemConfigSeedDto SystemConfig { get; set; } = new();
    public List<ServiceSeedDto> Services { get; set; } = [];
    public List<UnitSeedDto> Units { get; set; } = [];
}
