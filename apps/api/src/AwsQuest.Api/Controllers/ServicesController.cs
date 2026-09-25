namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.MasterServices;

[ApiController]
[Route("api/v1/services")]
[Produces("application/json")]
public class ServicesController : ControllerBase
{
    private readonly IMasterServicesService _masterServicesService;

    public ServicesController(IMasterServicesService masterServicesService)
    {
        _masterServicesService = masterServicesService;
    }

    /// <summary>
    /// Obtiene la lista completa de servicios AWS disponibles en la plataforma, con soporte de filtrado opcional por categoría.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<AwsServiceResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetServices(
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        var services = await _masterServicesService.GetServicesAsync(category, cancellationToken);
        return Ok(ApiResponse<List<AwsServiceResponseDto>>.Ok(services));
    }
}
