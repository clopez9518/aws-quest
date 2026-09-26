namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Domain.Enums;

[ApiController]
[Route("api/v1/dictionary")]
[Produces("application/json")]
public class DictionaryController : ControllerBase
{
    private readonly IDictionaryService _dictionaryService;

    public DictionaryController(IDictionaryService dictionaryService)
    {
        _dictionaryService = dictionaryService;
    }

    /// <summary>
    /// Consulta el glosario de términos con soporte de búsqueda por texto libre, categoría y pilar Well-Architected.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DictionaryTermSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTerms(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] WellArchitectedPillar? pillar,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        var filter = new DictionaryFilterParams(search, category, pillar, limit, offset);
        var terms = await _dictionaryService.GetTermsAsync(filter, cancellationToken);
        return Ok(ApiResponse<List<DictionaryTermSummaryDto>>.Ok(terms));
    }

    /// <summary>
    /// Obtiene la ficha técnica detallada de un término por su slug, incluyendo el grafo de relaciones y desafíos asociados.
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ApiResponse<DictionaryTermDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTermBySlug(
        [FromRoute] string slug,
        CancellationToken cancellationToken = default)
    {
        var term = await _dictionaryService.GetTermBySlugAsync(slug, cancellationToken);
        if (term == null)
        {
            return NotFound(ApiErrorResponse.Create("NOT_FOUND", $"El término '{slug}' no fue encontrado en el diccionario."));
        }

        return Ok(ApiResponse<DictionaryTermDetailDto>.Ok(term));
    }

    /// <summary>
    /// Obtiene el resumen de categorías disponibles y el conteo de términos en cada una.
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(ApiResponse<List<DictionaryCategoryCountDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken = default)
    {
        var categories = await _dictionaryService.GetCategoriesSummaryAsync(cancellationToken);
        return Ok(ApiResponse<List<DictionaryCategoryCountDto>>.Ok(categories));
    }
}
