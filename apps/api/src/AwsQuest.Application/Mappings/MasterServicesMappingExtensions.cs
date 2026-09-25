namespace AwsQuest.Application.Mappings;

using AwsQuest.Application.Dtos.MasterServices;
using AwsQuest.Domain.Entities;

public static class MasterServicesMappingExtensions
{
    public static AwsServiceResponseDto ToDto(this AwsService service) => new()
    {
        Id = service.Id,
        Code = service.Code,
        Name = service.Name,
        Category = service.Category,
        ShortDescription = service.ShortDescription,
        IconUrl = service.IconUrl,
        IsActive = service.IsActive,
        Kind = service.Kind,
        PlacementScope = service.PlacementScope,
        DefaultConfigJson = service.DefaultConfigJson
    };
}
