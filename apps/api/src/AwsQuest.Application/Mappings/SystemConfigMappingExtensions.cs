namespace AwsQuest.Application.Mappings;

using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Domain.Entities;

public static class SystemConfigMappingExtensions
{
    public static SystemConfigResponseDto ToDto(this SystemConfig config) => new()
    {
        AccessMode = config.AccessMode,
        UpdatedAt = config.UpdatedAt
    };
}
