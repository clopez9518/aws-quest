namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Catalog;

public interface ICatalogService
{
    /// <summary>
    /// Obtiene el catálogo jerárquico de unidades y desafíos evaluando la política de acceso activa
    /// (OpenAccess vs Progressive) y el progreso acumulado del usuario especificado.
    /// </summary>
    Task<List<UnitResponseDto>> GetUnitsCatalogAsync(Guid userId, CancellationToken cancellationToken = default);
}
