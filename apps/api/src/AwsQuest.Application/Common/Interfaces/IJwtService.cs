namespace AwsQuest.Application.Common.Interfaces;

using System.Security.Claims;
using AwsQuest.Domain.Entities;

public interface IJwtService
{
    /// <summary>
    /// Genera un token JWT firmado para el usuario dado (sea invitado o registrado).
    /// </summary>
    string GenerateToken(User user);

    /// <summary>
    /// Valida un token JWT y extrae su ClaimsPrincipal. Retorna null si el token es inválido o expiró.
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromToken(string token);

    /// <summary>
    /// Extrae de forma segura el identificador de usuario (Guid) desde un token JWT string, o null si falla.
    /// </summary>
    Guid? ExtractUserIdFromToken(string? token);
}
