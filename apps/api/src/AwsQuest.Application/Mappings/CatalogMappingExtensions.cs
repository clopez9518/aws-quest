namespace AwsQuest.Application.Mappings;

using System.Text.Json;
using System.Text.Json.Serialization;
using AwsQuest.Application.Dtos.Catalog;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public static class CatalogMappingExtensions
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public static CatalogChallengeDto ToCatalogDto(
        this Challenge challenge, 
        bool isLocked, 
        string? lockReason, 
        UserProgress? progress)
    {
        return new CatalogChallengeDto
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Difficulty = challenge.Difficulty,
            Mode = Enum.TryParse<ChallengeMode>(challenge.Mode.Replace("_", ""), true, out var m) ? m : ChallengeMode.Builder,
            BaseXP = challenge.BaseXP,
            RequiredXP = challenge.RequiredXP,
            OrderIndex = challenge.OrderIndex,
            IsLocked = isLocked,
            LockReason = lockReason,
            UserProgress = progress != null ? new ChallengeProgressSummaryDto
            {
                Status = progress.Status,
                HighScore = progress.HighScore,
                HintsUsed = progress.HintsUsed,
                CompletedAt = progress.FirstCompletedAt
            } : new ChallengeProgressSummaryDto
            {
                Status = ProgressStatus.NotStarted,
                HighScore = 0,
                HintsUsed = 0,
                CompletedAt = null
            }
        };
    }

    public static ChallengeDetailResponseDto ToDetailDto(
        this Challenge challenge, 
        UserProgress? progress)
    {
        // 1. Mapear servicios permitidos
        var allowedServices = challenge.AllowedServices
            .Where(cs => cs.Service != null)
            .OrderBy(cs => cs.Service.Name)
            .Select(cs => new ChallengeAllowedServiceDto
            {
                Code = cs.Service.Code,
                Name = cs.Service.Name,
                Category = cs.Service.Category,
                ShortDescription = cs.Service.ShortDescription,
                IconUrl = cs.Service.IconUrl,
                MaxInstances = cs.MaxInstances,
                IsDistractor = cs.IsDistractor,
                Kind = cs.Service.Kind,
                PlacementScope = cs.Service.PlacementScope
            }).ToList();

        // 2. Deserializar definiciones de pistas
        var hintsDefinitions = !string.IsNullOrWhiteSpace(challenge.HintsJson)
            ? JsonSerializer.Deserialize<List<HintDefinition>>(challenge.HintsJson, JsonOptions) ?? []
            : [];

        var hintsUsedCount = progress?.HintsUsed ?? 0;

        // 3. Sanitizar pistas: filtrar sólo las pistas desbloqueadas
        var unlockedHints = hintsDefinitions
            .Where(h => h.OrderIndex <= hintsUsedCount)
            .OrderBy(h => h.OrderIndex)
            .Select(h => new UnlockedHintDto
            {
                OrderIndex = h.OrderIndex,
                Text = h.Text,
                PenaltyApplied = h.PenaltyPoints
            }).ToList();

        var hintsSummary = new HintsSummaryDto
        {
            TotalHints = hintsDefinitions.Count,
            UnlockedCount = hintsUsedCount,
            UnlockedHints = unlockedHints
        };

        // 4. Deserializar grafo del último intento si existe
        SemanticGraph? lastAttemptGraph = null;
        if (progress != null && !string.IsNullOrWhiteSpace(progress.LastAttemptGraphJson))
        {
            try
            {
                lastAttemptGraph = JsonSerializer.Deserialize<SemanticGraph>(progress.LastAttemptGraphJson, JsonOptions);
            }
            catch
            {
                lastAttemptGraph = null;
            }
        }

        // 5. Deserializar grafo inicial para modos como FIX_ARCHITECTURE
        SemanticGraph? initialGraph = null;
        if (!string.IsNullOrWhiteSpace(challenge.InitialGraphJson))
        {
            try
            {
                initialGraph = JsonSerializer.Deserialize<SemanticGraph>(challenge.InitialGraphJson, JsonOptions);
            }
            catch
            {
                initialGraph = null;
            }
        }

        // 6. Deserializar micro-cápsula de briefing si existe
        ChallengeBriefingDto? briefing = null;
        if (!string.IsNullOrWhiteSpace(challenge.BriefingJson))
        {
            try
            {
                var briefingModel = JsonSerializer.Deserialize<ChallengeBriefing>(challenge.BriefingJson, JsonOptions);
                if (briefingModel != null)
                {
                    briefing = new ChallengeBriefingDto
                    {
                        KeyConcept = briefingModel.KeyConcept,
                        BusinessScenario = briefingModel.BusinessScenario,
                        LearningObjective = briefingModel.LearningObjective,
                        KeyTakeaways = briefingModel.KeyTakeaways,
                        EstimatedReadTime = briefingModel.EstimatedReadTime
                    };
                }
            }
            catch
            {
                briefing = null;
            }
        }

        // 7. Deserializar checkpoint de reflexión activa si existe (Sanitizado anti-cheat)
        ChallengeReflectionPromptDto? reflectionPrompt = null;
        if (!string.IsNullOrWhiteSpace(challenge.ReflectionPromptJson))
        {
            try
            {
                var promptModel = JsonSerializer.Deserialize<ChallengeReflectionPrompt>(challenge.ReflectionPromptJson, JsonOptions);
                if (promptModel != null)
                {
                    var isCompleted = progress?.ReflectionCompleted ?? false;
                    var selectedOptionId = progress?.ReflectionSelectedOptionId;

                    reflectionPrompt = new ChallengeReflectionPromptDto
                    {
                        Question = promptModel.Question,
                        Pillar = promptModel.Pillar,
                        BonusXP = promptModel.BonusXP,
                        IsCompleted = isCompleted,
                        SelectedOptionId = selectedOptionId,
                        Options = promptModel.Options.Select(o => new ReflectionOptionPublicDto
                        {
                            Id = o.Id,
                            Text = o.Text
                        }).ToList()
                    };
                }
            }
            catch
            {
                reflectionPrompt = null;
            }
        }

        return new ChallengeDetailResponseDto
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            Difficulty = challenge.Difficulty,
            Mode = Enum.TryParse<ChallengeMode>(challenge.Mode.Replace("_", ""), true, out var m) ? m : ChallengeMode.Builder,
            BaseXP = challenge.BaseXP,
            AllowedServices = allowedServices,
            HintsSummary = hintsSummary,
            Briefing = briefing,
            ReflectionPrompt = reflectionPrompt,
            LastAttemptGraph = lastAttemptGraph,
            InitialGraph = initialGraph
        };
    }
}
