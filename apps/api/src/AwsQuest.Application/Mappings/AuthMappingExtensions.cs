namespace AwsQuest.Application.Mappings;

using AwsQuest.Application.Dtos.Auth;
using AwsQuest.Domain.Entities;

public static class AuthMappingExtensions
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            IsGuest = user.IsGuest,
            TotalXP = user.TotalXP,
            Level = user.Level
        };
    }

    public static UserProfileDto ToProfileDto(this User user, int completedChallengesCount)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            IsGuest = user.IsGuest,
            TotalXP = user.TotalXP,
            Level = user.Level,
            CompletedChallengesCount = completedChallengesCount,
            CreatedAt = user.CreatedAt
        };
    }
}
