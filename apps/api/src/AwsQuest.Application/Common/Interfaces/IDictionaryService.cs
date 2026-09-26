namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Dictionary;

public interface IDictionaryService
{
    Task<List<DictionaryTermSummaryDto>> GetTermsAsync(DictionaryFilterParams filter, CancellationToken cancellationToken = default);
    Task<DictionaryTermDetailDto?> GetTermBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<DictionaryCategoryCountDto>> GetCategoriesSummaryAsync(CancellationToken cancellationToken = default);
}
