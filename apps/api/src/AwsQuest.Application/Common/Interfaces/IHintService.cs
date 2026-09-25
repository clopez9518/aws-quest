namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Challenge;

public interface IHintService
{
    /// <summary>
    /// Desbloquea la siguiente pista disponible en orden secuencial para el desafío y usuario especificados.
    /// Acumula la penalización correspondiente y persiste el nuevo contador de pistas usadas.
    /// </summary>
    Task<UnlockHintResponseDto> UnlockNextHintAsync(Guid challengeId, Guid userId, CancellationToken cancellationToken = default);
}
