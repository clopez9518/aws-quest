using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.Application.Dtos.Evaluation;

namespace AwsQuest.Api.Controllers;

[ApiController]
[Route("api/v1/challenges")]
[Authorize]
[Produces("application/json")]
public class ChallengesController : ControllerBase
{
    private readonly IChallengeService _challengeService;
    private readonly IHintService _hintService;
    private readonly IEvaluationService _evaluationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ChallengesController> _logger;

    public ChallengesController(
        IChallengeService challengeService,
        IHintService hintService,
        IEvaluationService evaluationService,
        ICurrentUserService currentUserService,
        ILogger<ChallengesController> logger)
    {
        _challengeService = challengeService;
        _hintService = hintService;
        _evaluationService = evaluationService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene el contexto y especificación completa de un desafío para inicializar el workspace.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ChallengeDetailResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChallengeDetail(
        [FromRoute] Guid id, 
        CancellationToken cancellationToken)
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

        var challengeDetail = await _challengeService.GetChallengeDetailAsync(id, userId.Value, cancellationToken);
        return Ok(ApiResponse<ChallengeDetailResponseDto>.Ok(challengeDetail));
    }

    /// <summary>
    /// Desbloquea la siguiente pista disponible para un desafío.
    /// </summary>
    [HttpPost("{id:guid}/hints/unlock")]
    [ProducesResponseType(typeof(ApiResponse<UnlockHintResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnlockHint(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
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

        var result = await _hintService.UnlockNextHintAsync(id, userId.Value, cancellationToken);
        return Ok(ApiResponse<UnlockHintResponseDto>.Ok(result));
    }

    /// <summary>
    /// Evalúa la solución arquitectónica enviada por el usuario para un desafío.
    /// </summary>
    [HttpPost("{id:guid}/evaluate")]
    [ProducesResponseType(typeof(ApiResponse<EvaluateArchitectureResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EvaluateChallenge(
        [FromRoute] Guid id,
        [FromBody] EvaluateArchitectureRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            _logger.LogWarning("[ChallengesController] Intento de evaluación no autorizado (sin UserId).");
            return Unauthorized(new ApiErrorResponse
            {
                Error = new ApiErrorDetails
                {
                    Code = ErrorCodes.Unauthorized,
                    Message = "Usuario no autenticado o token inválido."
                }
            });
        }

        _logger.LogInformation(
            "[ChallengesController] POST /api/v1/challenges/{Id}/evaluate recibido. User={UserId}, Componentes={ComponentCount}, Conexiones={ConnCount}",
            id,
            userId.Value,
            request.Graph.Components.Count,
            request.Graph.Connections.Count);

        var result = await _evaluationService.EvaluateArchitectureAsync(id, userId.Value, request, cancellationToken);
        return Ok(ApiResponse<EvaluateArchitectureResponseDto>.Ok(result));
    }

    /// <summary>
    /// Obtiene el historial de envíos e intentos del usuario para un desafío.
    /// </summary>
    [HttpGet("{id:guid}/attempts")]
    [ProducesResponseType(typeof(ApiResponse<List<ChallengeAttemptHistoryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAttempts(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
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

        var attempts = await _evaluationService.GetChallengeAttemptsHistoryAsync(id, userId.Value, cancellationToken);
        return Ok(ApiResponse<List<ChallengeAttemptHistoryDto>>.Ok(attempts));
    }

    /// <summary>
    /// Valida la respuesta del usuario para el checkpoint de reflexión activa y otorga bonus de XP.
    /// </summary>
    [HttpPost("{id:guid}/reflection")]
    [ProducesResponseType(typeof(ApiResponse<SubmitReflectionAnswerResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitReflection(
        [FromRoute] Guid id,
        [FromBody] SubmitReflectionAnswerRequestDto request,
        CancellationToken cancellationToken)
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

        var result = await _challengeService.SubmitReflectionAnswerAsync(id, userId.Value, request, cancellationToken);
        return Ok(ApiResponse<SubmitReflectionAnswerResponseDto>.Ok(result));
    }
}
