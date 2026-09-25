namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Evaluation;

public interface IEvaluationService
{
    /// <summary>
    /// Evalúa la arquitectura enviada contra las reglas declarativas del desafío en memoria,
    /// actualiza atómicamente el progreso, récords de puntuación y XP anti-farmeo, y registra el intento histórico.
    /// </summary>
    Task<EvaluateArchitectureResponseDto> EvaluateArchitectureAsync(
        Guid challengeId, 
        Guid userId, 
        EvaluateArchitectureRequestDto request, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Obtiene el historial de envíos de intentos realizados por el usuario para este desafío.
    /// </summary>
    Task<List<ChallengeAttemptHistoryDto>> GetChallengeAttemptsHistoryAsync(
        Guid challengeId, 
        Guid userId, 
        CancellationToken cancellationToken = default);
}
