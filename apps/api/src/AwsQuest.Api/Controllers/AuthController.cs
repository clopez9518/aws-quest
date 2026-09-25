namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Auth;

[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtService _jwtService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        IAuthService authService,
        IJwtService jwtService,
        ICurrentUserService currentUserService)
    {
        _authService = authService;
        _jwtService = jwtService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Genera una nueva sesión anónima en Modo Invitado.
    /// </summary>
    [HttpPost("guest")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<GuestSessionResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGuestSession(CancellationToken cancellationToken)
    {
        var result = await _authService.CreateGuestSessionAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<GuestSessionResponseDto>.Ok(result));
    }

    /// <summary>
    /// Registra un usuario permanente y migra el progreso del invitado si se adjunta su token Bearer.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<RegisterResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequestDto request, 
        CancellationToken cancellationToken)
    {
        Guid? guestUserId = null;
        if (Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            guestUserId = _jwtService.ExtractUserIdFromToken(authHeader.ToString());
        }

        var result = await _authService.RegisterAsync(request, guestUserId, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<RegisterResponseDto>.Ok(result));
    }

    /// <summary>
    /// Inicia sesión con credenciales registradas.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto request, 
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(ApiResponse<LoginResponseDto>.Ok(result));
    }

    /// <summary>
    /// Obtiene el perfil y estado de progreso del usuario actual (autenticado o invitado).
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<UserProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized(new ApiErrorResponse
            {
                Error = new ApiErrorDetails
                {
                    Code = ErrorCodes.Unauthorized,
                    Message = "Usuario no autenticado o token inválido."
                }
            });
        }

        var profile = await _authService.GetCurrentUserProfileAsync(userId.Value, cancellationToken);
        return Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }
}
