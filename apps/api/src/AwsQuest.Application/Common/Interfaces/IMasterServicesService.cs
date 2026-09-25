namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.MasterServices;

public interface IMasterServicesService
{
    /// <summary>
    /// Obtiene la lista completa de servicios AWS activos en la plataforma, con soporte de filtrado opcional por categoría.
    /// </summary>
    Task<List<AwsServiceResponseDto>> GetServicesAsync(string? category = null, CancellationToken cancellationToken = default);
}
