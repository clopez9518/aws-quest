namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.SystemConfig;

[ApiController]
[Route("api/v1/system/config")]
[Produces("application/json")]
public class SystemConfigController : ControllerBase
{
    private readonly ISystemConfigService _systemConfigService;

    public SystemConfigController(ISystemConfigService systemConfigService)
    {
        _systemConfigService = systemConfigService;
    }

    /// <summary>
    /// Obtiene la política global de accesibilidad y configuración activa del sistema.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SystemConfigResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConfig(CancellationToken cancellationToken)
    {
        var config = await _systemConfigService.GetConfigAsync(cancellationToken);
        return Ok(ApiResponse<SystemConfigResponseDto>.Ok(config));
    }

    /// <summary>
    /// Actualiza la política global de accesibilidad al contenido (Modo Libre vs. Progresivo).
    /// </summary>
    [HttpPatch]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<SystemConfigResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateConfig(
        [FromBody] UpdateSystemConfigRequestDto request,
        CancellationToken cancellationToken)
    {
        var updatedConfig = await _systemConfigService.UpdateConfigAsync(request, cancellationToken);
        return Ok(ApiResponse<SystemConfigResponseDto>.Ok(updatedConfig));
    }
}
