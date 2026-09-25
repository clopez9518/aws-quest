namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Catalog;

[ApiController]
[Route("api/v1/units")]
[Authorize]
[Produces("application/json")]
public class UnitsController : ControllerBase
{
    private readonly ICatalogService _catalogService;
    private readonly ICurrentUserService _currentUserService;

    public UnitsController(
        ICatalogService catalogService, 
        ICurrentUserService currentUserService)
    {
        _catalogService = catalogService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Obtiene el catálogo de unidades y desafíos con el estado de avance del usuario activo.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<UnitResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUnitsCatalog(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized(new ApiErrorResponse
            {
                Error = new ApiErrorDetails
                {
                    Code = ErrorCodes.Unauthorized,
                    Message = "Usuario no autenticado o token inválido."
                }
            });
        }

        var units = await _catalogService.GetUnitsCatalogAsync(userId.Value, cancellationToken);
        return Ok(ApiResponse<List<UnitResponseDto>>.Ok(units));
    }
}
