namespace AwsQuest.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.MasterServices;
using AwsQuest.Application.Mappings;

public class MasterServicesService : IMasterServicesService
{
    private readonly IAppDbContext _dbContext;

    public MasterServicesService(IAppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<AwsServiceResponseDto>> GetServicesAsync(string? category = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.AwsServices
            .AsNoTracking()
            .Where(s => s.IsActive);

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCategory = category.Trim().ToUpper();
            query = query.Where(s => s.Category.ToUpper() == normalizedCategory);
        }

        var services = await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return services.Select(s => s.ToDto()).ToList();
    }
}
