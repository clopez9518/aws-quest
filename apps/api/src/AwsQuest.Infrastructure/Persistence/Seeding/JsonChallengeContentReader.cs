namespace AwsQuest.Infrastructure.Persistence.Seeding;

using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models.Seeding;

public class JsonChallengeContentReader : IChallengeContentReader
{
    private readonly ILogger<JsonChallengeContentReader> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public JsonChallengeContentReader(ILogger<JsonChallengeContentReader>? logger = null)
    {
        _logger = logger ?? NullLogger<JsonChallengeContentReader>.Instance;
    }

    public async Task<SeedingDataPackage> ReadContentAsync(string contentRootPath, CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(contentRootPath))
        {
            _logger.LogError("[ContentReader] Directorio no encontrado: {Path}", contentRootPath);
            throw new DirectoryNotFoundException($"El directorio de contenido no fue encontrado: {contentRootPath}");
        }

        _logger.LogInformation("[ContentReader] Leyendo contenido declarativo desde: {Path}", contentRootPath);

        var package = new SeedingDataPackage();

        // 1. Leer Configuración Global
        var configPath = Path.Combine(contentRootPath, "system-config.json");
        if (File.Exists(configPath))
        {
            var configJson = await File.ReadAllTextAsync(configPath, cancellationToken);
            package.SystemConfig = JsonSerializer.Deserialize<SystemConfigSeedDto>(configJson, JsonOptions) ?? new();
            _logger.LogInformation("[ContentReader] Configuración global leída. AccessMode: {AccessMode}", package.SystemConfig.AccessMode);
        }

        // 2. Leer Catálogo Maestro de Servicios
        var servicesPath = Path.Combine(contentRootPath, "services", "aws-services.json");
        if (File.Exists(servicesPath))
        {
            var servicesJson = await File.ReadAllTextAsync(servicesPath, cancellationToken);
            package.Services = JsonSerializer.Deserialize<List<ServiceSeedDto>>(servicesJson, JsonOptions) ?? [];
            _logger.LogInformation("[ContentReader] Catálogo maestro leído: {Count} servicios.", package.Services.Count);
        }

        // 3. Leer Unidades y Desafíos
        var challengesDir = Path.Combine(contentRootPath, "challenges");
        if (Directory.Exists(challengesDir))
        {
            var unitDirs = Directory.GetDirectories(challengesDir)
                .OrderBy(d => d)
                .ToList();

            foreach (var unitDir in unitDirs)
            {
                var unitJsonPath = Path.Combine(unitDir, "unit.json");
                if (!File.Exists(unitJsonPath)) continue;

                var unitJson = await File.ReadAllTextAsync(unitJsonPath, cancellationToken);
                var unitDto = JsonSerializer.Deserialize<UnitSeedDto>(unitJson, JsonOptions);
                if (unitDto == null) continue;

                var challengeFiles = Directory.GetFiles(unitDir, "challenge-*.json")
                    .OrderBy(f => f)
                    .ToList();

                foreach (var challengeFile in challengeFiles)
                {
                    var challengeJson = await File.ReadAllTextAsync(challengeFile, cancellationToken);
                    var challengeDto = JsonSerializer.Deserialize<ChallengeSeedDto>(challengeJson, JsonOptions);
                    if (challengeDto != null)
                    {
                        unitDto.Challenges.Add(challengeDto);
                        _logger.LogInformation(
                            "[ContentReader] -> Desafío cargado: '{Title}' (Archivo: {File}). Reglas: RequiredServices=[{Required}], AntiPatterns={AntiCount}, ReqConnections={ReqConnCount}",
                            challengeDto.Title,
                            Path.GetFileName(challengeFile),
                            string.Join(",", challengeDto.EvaluationRules.RequiredServices),
                            challengeDto.EvaluationRules.AntiPatterns.Count,
                            challengeDto.EvaluationRules.RequiredConnections.Count);
                    }
                }

                package.Units.Add(unitDto);
            }
        }

        return package;
    }
}
