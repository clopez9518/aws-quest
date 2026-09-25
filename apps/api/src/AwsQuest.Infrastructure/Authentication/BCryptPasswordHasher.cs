namespace AwsQuest.Infrastructure.Authentication;

using AwsQuest.Application.Common.Interfaces;
using BCrypt.Net;

public class BCryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 11;

    public string HashPassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        return BCrypt.EnhancedHashPassword(password, WorkFactor, HashType.SHA384);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            return BCrypt.EnhancedVerify(password, passwordHash, HashType.SHA384);
        }
        catch
        {
            return false;
        }
    }
}
