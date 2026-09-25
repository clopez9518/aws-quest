namespace AwsQuest.Application.Dtos.Auth;

public class UserDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public bool IsGuest { get; init; }
    public int TotalXP { get; init; }
    public int Level { get; init; }
}

public class GuestSessionResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}

public class RegisterRequestDto
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public class RegisterResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
    public int MigratedProgressCount { get; init; }
}

public class LoginRequestDto
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}

public class LoginResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}

public class UserProfileDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public bool IsGuest { get; init; }
    public int TotalXP { get; init; }
    public int Level { get; init; }
    public int CompletedChallengesCount { get; init; }
    public DateTime CreatedAt { get; init; }
}
