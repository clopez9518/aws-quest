namespace AwsQuest.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class SystemConfigService : ISystemConfigService
{
    private const string GlobalConfigId = "global_config";
    private readonly IAppDbContext _dbContext;

    public SystemConfigService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SystemConfigResponseDto> GetConfigAsync(CancellationToken cancellationToken = default)
    {
        var config = await _dbContext.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == GlobalConfigId, cancellationToken);

        if (config == null)
        {
            config = new SystemConfig
            {
                Id = GlobalConfigId,
                AccessMode = AccessMode.OpenAccess,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.SystemConfigs.Add(config);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return config.ToDto();
    }

    public async Task<SystemConfigResponseDto> UpdateConfigAsync(UpdateSystemConfigRequestDto request, CancellationToken cancellationToken = default)
    {
        var config = await _dbContext.SystemConfigs
            .FirstOrDefaultAsync(c => c.Id == GlobalConfigId, cancellationToken);

        if (config == null)
        {
            config = new SystemConfig
            {
                Id = GlobalConfigId,
                AccessMode = request.AccessMode,
                UpdatedAt = DateTime.UtcNow
            };
            _dbContext.SystemConfigs.Add(config);
        }
        else
        {
            config.AccessMode = request.AccessMode;
            config.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return config.ToDto();
    }
}
