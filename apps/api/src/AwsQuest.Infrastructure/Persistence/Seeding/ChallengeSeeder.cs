using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models.Seeding;
using AwsQuest.Domain.Entities;

namespace AwsQuest.Infrastructure.Persistence.Seeding;


public class ChallengeSeeder(
    IAppDbContext context,
    IChallengeContentReader contentReader,
    IConfiguration configuration,
    ILogger<ChallengeSeeder> logger) : IChallengeSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var contentPath = configuration["Content:Path"];
        if (string.IsNullOrWhiteSpace(contentPath) || !Directory.Exists(contentPath))
        {
            contentPath = FindContentRootDirectory();
        }

        logger.LogInformation("Iniciando Seeding de contenido declarativo desde: {Path}", contentPath);

        var package = await contentReader.ReadContentAsync(contentPath, cancellationToken);

        var strategy = context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            var isRelational = context.Database.IsRelational();
            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
            if (isRelational)
            {
                transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            }

            try
            {
                // 1. Sincronizar SystemConfig
                var existingConfig = await context.SystemConfigs.FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);
                if (existingConfig == null)
                {
                    context.SystemConfigs.Add(new SystemConfig
                    {
                        Id = "global_config",
                        AccessMode = package.SystemConfig.AccessMode,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                // 2. Sincronizar AwsServices
                var existingServices = await context.AwsServices.ToListAsync(cancellationToken);
                var existingServiceMap = existingServices.ToDictionary(s => s.Code, s => s, StringComparer.OrdinalIgnoreCase);
                var serviceMap = new Dictionary<string, AwsService>(StringComparer.OrdinalIgnoreCase);

                foreach (var sDto in package.Services)
                {
                    if (!existingServiceMap.TryGetValue(sDto.Code, out var service))
                    {
                        service = new AwsService
                        {
                            Code = sDto.Code,
                            Name = sDto.Name,
                            Category = sDto.Category,
                            ShortDescription = sDto.ShortDescription,
                            IconUrl = sDto.IconUrl,
                            IsActive = sDto.IsActive,
                            Kind = sDto.Kind,
                            PlacementScope = sDto.PlacementScope,
                            DefaultConfigJson = sDto.DefaultConfigJson,
                            CreatedAt = DateTime.UtcNow
                        };
                        context.AwsServices.Add(service);
                        existingServiceMap[sDto.Code] = service;
                    }
                    else
                    {
                        service.Name = sDto.Name;
                        service.Category = sDto.Category;
                        service.ShortDescription = sDto.ShortDescription;
                        service.IconUrl = sDto.IconUrl;
                        service.IsActive = sDto.IsActive;
                        service.Kind = sDto.Kind;
                        service.PlacementScope = sDto.PlacementScope;
                        service.DefaultConfigJson = sDto.DefaultConfigJson;
                    }
                    serviceMap[sDto.Code] = service;
                }
                await context.SaveChangesAsync(cancellationToken);

                // 3. Sincronizar Unidades y Desafíos
                foreach (var uDto in package.Units)
                {
                    var unit = context.Units.Local.FirstOrDefault(u => u.OrderIndex == uDto.OrderIndex)
                        ?? await context.Units.FirstOrDefaultAsync(u => u.OrderIndex == uDto.OrderIndex, cancellationToken);
                    if (unit == null)
                    {
                        unit = new Unit
                        {
                            Title = uDto.Title,
                            Description = uDto.Description,
                            OrderIndex = uDto.OrderIndex,
                            CreatedAt = DateTime.UtcNow
                        };
                        context.Units.Add(unit);
                        await context.SaveChangesAsync(cancellationToken);
                    }
                    else
                    {
                        unit.Title = uDto.Title;
                        unit.Description = uDto.Description;
                    }

                    foreach (var cDto in uDto.Challenges)
                    {
                        var evalRulesJson = JsonSerializer.Serialize(cDto.EvaluationRules, JsonOptions);
                        var hintsJson = JsonSerializer.Serialize(cDto.Hints, JsonOptions);
                        var initialGraphJson = cDto.InitialGraph != null
                            ? JsonSerializer.Serialize(cDto.InitialGraph, JsonOptions)
                            : null;
                        var briefingJson = cDto.Briefing != null
                            ? JsonSerializer.Serialize(cDto.Briefing, JsonOptions)
                            : null;
                        var reflectionPromptJson = cDto.ReflectionPrompt != null
                            ? JsonSerializer.Serialize(cDto.ReflectionPrompt, JsonOptions)
                            : null;

                        var challenge = context.Challenges.Local
                            .FirstOrDefault(c => c.UnitId == unit.Id && (c.OrderIndex == cDto.OrderIndex || c.Title == cDto.Title))
                            ?? await context.Challenges
                                .Include(c => c.AllowedServices)
                                .FirstOrDefaultAsync(c => c.UnitId == unit.Id && (c.OrderIndex == cDto.OrderIndex || c.Title == cDto.Title), cancellationToken);

                        if (challenge == null)
                        {
                            challenge = new Challenge
                            {
                                UnitId = unit.Id,
                                Title = cDto.Title,
                                Description = cDto.Description,
                                Difficulty = cDto.Difficulty,
                                Mode = cDto.Mode,
                                BaseXP = cDto.BaseXP,
                                RequiredXP = cDto.RequiredXP,
                                OrderIndex = cDto.OrderIndex,
                                EvaluationRulesJson = evalRulesJson,
                                HintsJson = hintsJson,
                                InitialGraphJson = initialGraphJson,
                                BriefingJson = briefingJson,
                                ReflectionPromptJson = reflectionPromptJson,
                                CreatedAt = DateTime.UtcNow
                            };
                            context.Challenges.Add(challenge);
                            await context.SaveChangesAsync(cancellationToken);
                        }
                        else
                        {
                            challenge.Title = cDto.Title;
                            challenge.Description = cDto.Description;
                            challenge.Difficulty = cDto.Difficulty;
                            challenge.Mode = cDto.Mode;
                            challenge.BaseXP = cDto.BaseXP;
                            challenge.RequiredXP = cDto.RequiredXP;
                            challenge.EvaluationRulesJson = evalRulesJson;
                            challenge.HintsJson = hintsJson;
                            challenge.InitialGraphJson = initialGraphJson;
                            challenge.BriefingJson = briefingJson;
                            challenge.ReflectionPromptJson = reflectionPromptJson;
                        }

                        logger.LogInformation(
                            "[ChallengeSeeder] Sincronizando Desafío en DB: '{Title}' (Unidad {UnitOrder}, Desafío {ChallengeOrder}). ID: {ChallengeId}. Longitud de EvaluationRulesJson: {RulesLen}",
                            challenge.Title,
                            unit.OrderIndex,
                            challenge.OrderIndex,
                            challenge.Id,
                            evalRulesJson.Length);

                        // Sincronizar ChallengeServices de forma limpia e idempotente
                        var existingMap = challenge.AllowedServices.ToDictionary(cs => cs.ServiceId);
                        var incomingServiceIds = new HashSet<Guid>();

                        foreach (var asDto in cDto.AllowedServices)
                        {
                            if (serviceMap.TryGetValue(asDto.ServiceCode, out var awsService))
                            {
                                incomingServiceIds.Add(awsService.Id);
                                if (existingMap.TryGetValue(awsService.Id, out var existingCs))
                                {
                                    existingCs.MaxInstances = asDto.MaxInstances;
                                    existingCs.IsDistractor = asDto.IsDistractor;
                                }
                                else
                                {
                                    context.ChallengeServices.Add(new ChallengeService
                                    {
                                        ChallengeId = challenge.Id,
                                        ServiceId = awsService.Id,
                                        MaxInstances = asDto.MaxInstances,
                                        IsDistractor = asDto.IsDistractor
                                    });
                                }
                            }
                        }

                        // Eliminar servicios que ya no pertenezcan al desafío
                        foreach (var existingCs in challenge.AllowedServices.Where(cs => !incomingServiceIds.Contains(cs.ServiceId)))
                        {
                            context.ChallengeServices.Remove(existingCs);
                        }
                    }
                }

                await context.SaveChangesAsync(cancellationToken);
                if (transaction != null)
                {
                    await transaction.CommitAsync(cancellationToken);
                }
                logger.LogInformation("Seeding de contenido declarativo completado exitosamente.");
            }
            catch (Exception ex)
            {
                if (transaction != null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                }
                logger.LogError(ex, "Error durante la ejecución del Seeding de contenido.");
                throw;
            }
        });
    }

    private static string FindContentRootDirectory()
    {
        var current = AppContext.BaseDirectory;
        while (!string.IsNullOrEmpty(current))
        {
            var candidate = Path.Combine(current, "content");
            if (Directory.Exists(candidate) && Directory.Exists(Path.Combine(candidate, "challenges")))
            {
                return candidate;
            }
            var parent = Directory.GetParent(current);
            if (parent == null) break;
            current = parent.FullName;
        }
        return Path.Combine(AppContext.BaseDirectory, "content");
    }
}
