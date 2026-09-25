namespace AwsQuest.Infrastructure.Authentication;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Domain.Entities;

public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;
    private readonly SymmetricSecurityKey _key;

    public JwtService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
        if (string.IsNullOrWhiteSpace(_settings.Secret) || _settings.Secret.Length < 32)
        {
            throw new InvalidOperationException("JwtSettings:Secret debe tener al menos 32 caracteres.");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new("isGuest", user.IsGuest.ToString().ToLowerInvariant()),
            new(ClaimTypes.Role, "Learner"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!user.IsGuest && !string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, user.Email));
        }

        var expires = user.IsGuest
            ? DateTime.UtcNow.AddDays(_settings.GuestExpirationDays)
            : DateTime.UtcNow.AddHours(_settings.ExpirationHours);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            Issuer = _settings.Issuer,
            Audience = _settings.Audience,
            SigningCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _key,
            ValidateIssuer = !string.IsNullOrEmpty(_settings.Issuer),
            ValidIssuer = _settings.Issuer,
            ValidateAudience = !string.IsNullOrEmpty(_settings.Audience),
            ValidAudience = _settings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        try
        {
            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public Guid? ExtractUserIdFromToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        var cleanToken = token.Trim();
        if (cleanToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            cleanToken = cleanToken["Bearer ".Length..].Trim();
        }

        var principal = GetPrincipalFromToken(cleanToken);
        if (principal == null) return null;

        var subClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(subClaim, out var userId) ? userId : null;
    }
}
