namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Auth;

public interface IAuthService
{
    /// <summary>
    /// Crea una sesión anónima en Modo Invitado con identidad persistida y emite su JWT.
    /// </summary>
    Task<GuestSessionResponseDto> CreateGuestSessionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Registra un nuevo usuario permanente. Si se provee un guestUserId válido,
    /// migra atómicamente su progreso, intentos y XP acumulados a la cuenta registrada (RN-13 / CU-08).
    /// </summary>
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request, Guid? guestUserId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida credenciales e inicia sesión para un usuario registrado.
    /// </summary>
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene el perfil consolidado del usuario actual incluyendo conteo de desafíos completados.
    /// </summary>
    Task<UserProfileDto> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}
