namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Challenge;

public interface IChallengeService
{
    /// <summary>
    /// Obtiene la información detallada del desafío y su contexto de workspace para el usuario.
    /// Verifica si el desafío está bloqueado en modo progresivo y sanitiza las pistas no reveladas.
    /// </summary>
    Task<ChallengeDetailResponseDto> GetChallengeDetailAsync(Guid challengeId, Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Valida la respuesta enviada para el checkpoint de reflexión activa, otorga bonus de XP (idempotente)
    /// y retorna la retroalimentación formativa y explicaciones.
    /// </summary>
    Task<SubmitReflectionAnswerResponseDto> SubmitReflectionAnswerAsync(
        Guid challengeId, 
        Guid userId, 
        SubmitReflectionAnswerRequestDto request, 
        CancellationToken cancellationToken = default);
}
