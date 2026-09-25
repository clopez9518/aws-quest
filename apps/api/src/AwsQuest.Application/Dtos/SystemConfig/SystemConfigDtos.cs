namespace AwsQuest.Application.Dtos.SystemConfig;

using AwsQuest.Domain.Enums;

public class SystemConfigResponseDto
{
    public AccessMode AccessMode { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class UpdateSystemConfigRequestDto
{
    public AccessMode AccessMode { get; init; }
}
