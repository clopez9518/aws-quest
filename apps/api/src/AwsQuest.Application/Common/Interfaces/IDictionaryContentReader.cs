namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Common.Models.Seeding;

public interface IDictionaryContentReader
{
    Task<DictionarySeedPackageDto> ReadDictionaryAsync(string basePath, CancellationToken cancellationToken = default);
}
