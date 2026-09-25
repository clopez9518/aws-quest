namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Common.Models.Seeding;

public interface IChallengeContentReader
{
    Task<SeedingDataPackage> ReadContentAsync(string contentRootPath, CancellationToken cancellationToken = default);
}
