namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Domain.Entities;

public interface IChallengeAccessValidator
{
    Task ValidateAccessAsync(Challenge challenge, Guid userId, CancellationToken cancellationToken = default);
}
