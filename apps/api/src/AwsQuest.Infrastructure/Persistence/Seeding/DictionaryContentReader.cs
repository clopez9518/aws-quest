namespace AwsQuest.Infrastructure.Persistence.Seeding;

using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models.Seeding;

public class DictionaryContentReader : IDictionaryContentReader
{
    private readonly ILogger<DictionaryContentReader> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public DictionaryContentReader(ILogger<DictionaryContentReader>? logger = null)
    {
        _logger = logger ?? NullLogger<DictionaryContentReader>.Instance;
    }

    public async Task<DictionarySeedPackageDto> ReadDictionaryAsync(string basePath, CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(basePath))
        {
            _logger.LogError("[DictionaryContentReader] Directorio no encontrado: {Path}", basePath);
            throw new DirectoryNotFoundException($"El directorio base no fue encontrado: {basePath}");
        }

        var dictionaryJsonPath = Path.Combine(basePath, "dictionary", "terms.json");
        if (!File.Exists(dictionaryJsonPath))
        {
            // Intentar directamente si basePath ya apunta al directorio dictionary o al archivo
            if (File.Exists(Path.Combine(basePath, "terms.json")))
            {
                dictionaryJsonPath = Path.Combine(basePath, "terms.json");
            }
            else
            {
                _logger.LogWarning("[DictionaryContentReader] Archivo terms.json no encontrado en {Path}. Retornando lista vacía.", dictionaryJsonPath);
                return new DictionarySeedPackageDto();
            }
        }

        _logger.LogInformation("[DictionaryContentReader] Leyendo términos del diccionario desde: {Path}", dictionaryJsonPath);

        var json = await File.ReadAllTextAsync(dictionaryJsonPath, cancellationToken);
        var package = JsonSerializer.Deserialize<DictionarySeedPackageDto>(json, JsonOptions);

        if (package == null || package.Terms == null)
        {
            _logger.LogWarning("[DictionaryContentReader] El archivo terms.json no contenía términos válidos.");
            return new DictionarySeedPackageDto();
        }

        // Validación de unicidad de slugs
        var duplicateSlugs = package.Terms
            .GroupBy(t => t.Slug, StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateSlugs.Count > 0)
        {
            var duplicatesJoined = string.Join(", ", duplicateSlugs);
            _logger.LogError("[DictionaryContentReader] Slugs duplicados encontrados en terms.json: {Slugs}", duplicatesJoined);
            throw new InvalidOperationException($"Slugs duplicados detectados en el diccionario: {duplicatesJoined}");
        }

        _logger.LogInformation("[DictionaryContentReader] {Count} términos leídos exitosamente.", package.Terms.Count);
        return package;
    }
}
