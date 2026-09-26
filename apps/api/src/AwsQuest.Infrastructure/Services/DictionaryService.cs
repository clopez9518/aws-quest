namespace AwsQuest.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;

public class DictionaryService : IDictionaryService
{
    private readonly IAppDbContext _context;
    private readonly ILogger<DictionaryService> _logger;

    public DictionaryService(
        IAppDbContext context,
        ILogger<DictionaryService>? logger = null)
    {
        _context = context;
        _logger = logger ?? NullLogger<DictionaryService>.Instance;
    }

    public async Task<List<DictionaryTermSummaryDto>> GetTermsAsync(
        DictionaryFilterParams filter,
        CancellationToken cancellationToken = default)
    {
        var query = _context.DictionaryTerms.AsNoTracking().AsQueryable();

        // 1. Filtro por búsqueda de texto
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(search) ||
                t.ShortDefinition.ToLower().Contains(search) ||
                t.Slug.ToLower().Contains(search) ||
                (t.ServiceCode != null && t.ServiceCode.ToLower().Contains(search)));
        }

        // 2. Filtro por categoría
        if (!string.IsNullOrWhiteSpace(filter.Category))
        {
            var category = filter.Category.Trim().ToLower();
            query = query.Where(t => t.Category.ToLower() == category);
        }

        // 3. Filtro por Pilar Well-Architected
        if (filter.Pillar.HasValue)
        {
            query = query.Where(t => t.Pillar == filter.Pillar.Value);
        }

        // 4. Ordenamiento y Paginación
        var limit = filter.Limit <= 0 ? 100 : Math.Min(filter.Limit, 200);
        var offset = Math.Max(0, filter.Offset);

        var terms = await query
            .OrderBy(t => t.DisplayOrder)
            .ThenBy(t => t.Title)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return terms.Select(t => t.ToSummaryDto()).ToList();
    }

    public async Task<DictionaryTermDetailDto?> GetTermBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        var normalizedSlug = slug.Trim().ToLower();

        var term = await _context.DictionaryTerms
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug.ToLower() == normalizedSlug, cancellationToken);

        if (term == null)
        {
            return null;
        }

        // 1. Resolver grafo de términos relacionados
        var relatedSlugs = term.RelatedTermSlugs ?? [];
        var relatedTerms = new List<DictionaryRelatedTermDto>();

        if (relatedSlugs.Count > 0)
        {
            var matchedTerms = await _context.DictionaryTerms
                .AsNoTracking()
                .Where(t => relatedSlugs.Contains(t.Slug))
                .ToListAsync(cancellationToken);

            // Mantener el orden definido en relatedTermSlugs
            foreach (var rSlug in relatedSlugs)
            {
                var match = matchedTerms.FirstOrDefault(m => string.Equals(m.Slug, rSlug, StringComparison.OrdinalIgnoreCase));
                if (match != null)
                {
                    relatedTerms.Add(new DictionaryRelatedTermDto(
                        match.Slug,
                        match.Title,
                        match.Category,
                        match.ServiceCode
                    ));
                }
            }
        }

        // 2. Resolver desafíos asociados
        var associatedChallengeIds = term.AssociatedChallengeIds ?? [];
        var associatedChallenges = new List<DictionaryAssociatedChallengeDto>();

        if (associatedChallengeIds.Count > 0)
        {
            // Parsear Guids válidos para consultar los desafíos
            var challengeGuids = new List<Guid>();
            foreach (var idStr in associatedChallengeIds)
            {
                if (Guid.TryParse(idStr, out var parsedGuid))
                {
                    challengeGuids.Add(parsedGuid);
                }
            }

            var matchedChallenges = await _context.Challenges
                .AsNoTracking()
                .Where(c => challengeGuids.Contains(c.Id))
                .ToListAsync(cancellationToken);

            foreach (var c in matchedChallenges)
            {
                associatedChallenges.Add(new DictionaryAssociatedChallengeDto(
                    c.Id.ToString(),
                    c.Title,
                    c.Difficulty,
                    c.BaseXP
                ));
            }
        }

        return term.ToDetailDto(relatedTerms, associatedChallenges);
    }

    public async Task<List<DictionaryCategoryCountDto>> GetCategoriesSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var terms = await _context.DictionaryTerms
            .AsNoTracking()
            .Select(t => t.Category)
            .ToListAsync(cancellationToken);

        var groups = terms
            .GroupBy(c => c, StringComparer.OrdinalIgnoreCase)
            .Select(g => new DictionaryCategoryCountDto(
                Category: g.Key,
                Count: g.Count(),
                Label: FormatCategoryLabel(g.Key)
            ))
            .OrderByDescending(c => c.Count)
            .ThenBy(c => c.Label)
            .ToList();

        return groups;
    }

    private static string FormatCategoryLabel(string category)
    {
        return category.ToLowerInvariant() switch
        {
            "service" => "Servicios AWS",
            "concept" => "Conceptos Cloud",
            "infrastructure" => "Redes e Infraestructura",
            "well-architected" => "Well-Architected",
            _ => char.ToUpperInvariant(category[0]) + category[1..]
        };
    }
}
