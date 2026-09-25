namespace AwsQuest.Application.Common.Interfaces;

public interface IPasswordHasher
{
    /// <summary>
    /// Genera un hash seguro de la contraseña usando BCrypt con salt dinámico.
    /// </summary>
    string HashPassword(string password);

    /// <summary>
    /// Verifica si una contraseña en texto plano coincide con el hash almacenado.
    /// </summary>
    bool VerifyPassword(string password, string passwordHash);
}
