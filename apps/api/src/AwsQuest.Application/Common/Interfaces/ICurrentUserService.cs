namespace AwsQuest.Application.Common.Interfaces;

public interface ICurrentUserService
{
    /// <summary>
    /// Obtiene el identificador único del usuario autenticado en la petición actual.
    /// </summary>
    Guid? UserId { get; }

    /// <summary>
    /// Indica si la petición actual cuenta con un usuario autenticado.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Indica si el usuario autenticado está en Modo Invitado.
    /// </summary>
    bool IsGuest { get; }

    /// <summary>
    /// Correo electrónico del usuario (null en usuarios invitados).
    /// </summary>
    string? Email { get; }
}
