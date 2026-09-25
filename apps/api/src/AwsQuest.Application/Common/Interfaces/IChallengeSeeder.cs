namespace AwsQuest.Application.Common.Interfaces;

public interface IChallengeSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
