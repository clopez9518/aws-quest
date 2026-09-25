namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.SystemConfig;

public interface ISystemConfigService
{
    /// <summary>
    /// Obtiene la configuración global del sistema y la modalidad de acceso a desafíos activa.
    /// </summary>
    Task<SystemConfigResponseDto> GetConfigAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Actualiza la política global de accesibilidad al contenido (Modo Libre vs. Progresivo).
    /// </summary>
    Task<SystemConfigResponseDto> UpdateConfigAsync(UpdateSystemConfigRequestDto request, CancellationToken cancellationToken = default);
}
