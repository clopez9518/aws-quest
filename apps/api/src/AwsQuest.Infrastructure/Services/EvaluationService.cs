namespace AwsQuest.Infrastructure.Services;

using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class EvaluationService : IEvaluationService
{
    private readonly IAppDbContext _dbContext;
    private readonly IEvaluationEngine _evaluationEngine;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    private readonly ILogger<EvaluationService> _logger;

    public EvaluationService(
        IAppDbContext dbContext,
        IEvaluationEngine evaluationEngine,
        ILogger<EvaluationService>? logger = null)
    {
        _dbContext = dbContext;
        _evaluationEngine = evaluationEngine;
        _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<EvaluationService>.Instance;
    }

    public async Task<EvaluateArchitectureResponseDto> EvaluateArchitectureAsync(
        Guid challengeId, 
        Guid userId, 
        EvaluateArchitectureRequestDto request, 
        CancellationToken cancellationToken = default)
    {
        // 1. Cargar desafío
        var challenge = await _dbContext.Challenges
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == challengeId, cancellationToken);

        if (challenge == null)
        {
            _logger.LogWarning("[EvaluationService] Desafío no encontrado con ID: {ChallengeId}", challengeId);
            throw new ChallengeNotFoundException(challengeId);
        }

        _logger.LogInformation(
            "[EvaluationService] Evaluando desafío '{Title}' (ID: {ChallengeId}). Longitud de EvaluationRulesJson: {RulesLength}",
            challenge.Title,
            challengeId,
            challenge.EvaluationRulesJson?.Length ?? 0);

        // 2. Validar modo progresivo
        await EnsureChallengeUnlockedAsync(challenge, userId, cancellationToken);

        // 3. Deserializar reglas de evaluación y pistas
        var evaluationRules = !string.IsNullOrWhiteSpace(challenge.EvaluationRulesJson)
            ? JsonSerializer.Deserialize<ChallengeEvaluationRules>(challenge.EvaluationRulesJson, JsonOptions) ?? new()
            : new();

        _logger.LogInformation(
            "[EvaluationService] Reglas deserializadas: RequiredServices=[{RequiredServices}], MinInstances=[{MinInstances}], RequiredConnections={ReqConnCount}, AntiPatterns={AntiPatternCount}, PassingScore={PassingThreshold}",
            string.Join(", ", evaluationRules.RequiredServices),
            string.Join(", ", evaluationRules.MinInstances.Select(kv => $"{kv.Key}:{kv.Value}")),
            evaluationRules.RequiredConnections.Count,
            evaluationRules.AntiPatterns.Count,
            evaluationRules.PassingScoreThreshold);

        _logger.LogInformation(
            "[EvaluationService] Grafo recibido del cliente: Componentes=[{Components}], Conexiones={ConnCount}, Pistas usadas={HintsUsed}",
            string.Join(", ", request.Graph.Components.Select(c => $"{c.ServiceCode}({c.Id})")),
            request.Graph.Connections.Count,
            request.HintsUsed);

        var hintsDefinitions = !string.IsNullOrWhiteSpace(challenge.HintsJson)
            ? JsonSerializer.Deserialize<List<HintDefinition>>(challenge.HintsJson, JsonOptions) ?? []
            : [];

        // 3. Obtener progreso actual para determinar pistas desbloqueadas
        var progress = await _dbContext.UserProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

        var hintsUsedCount = progress?.HintsUsed ?? 0;
        var hintPenalties = hintsDefinitions
            .Where(h => h.OrderIndex <= hintsUsedCount)
            .Sum(h => h.PenaltyPoints);

        // 4. Evaluar en memoria con IEvaluationEngine
        var evaluationResult = _evaluationEngine.Evaluate(
            request.Graph, 
            evaluationRules, 
            hintsUsed: hintsUsedCount, 
            hintPenalties: hintPenalties);

        _logger.LogInformation(
            "[EvaluationService] Resultado de evaluación: Score={Score}, Passed={Passed}, TotalPenalties={TotalPenalties}, Summary='{Summary}'",
            evaluationResult.Score,
            evaluationResult.Passed,
            evaluationResult.TotalErrorPenalties,
            evaluationResult.Feedback.Summary);

        foreach (var item in evaluationResult.Feedback.Items)
        {
            _logger.LogInformation(
                "[EvaluationService] -> Feedback Item: [{Status}] {Title} | Penalización: -{Penalty} pts | Categ: {Category}",
                item.Status,
                item.Title,
                item.PenaltyApplied,
                item.Category);
        }

        // 5. Ejecutar persistencia atómica con CreateExecutionStrategy (RNF-13)
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        EvaluateArchitectureResponseDto response = null!;

        await strategy.ExecuteAsync(async () =>
        {
            var isRelational = _dbContext.Database.IsRelational();
            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
            if (isRelational)
            {
                transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            }

            try
            {
                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

                if (user == null)
                {
                    throw new UserNotFoundException(userId);
                }

                if (progress == null)
                {
                    progress = new UserProgress
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        ChallengeId = challengeId,
                        Status = ProgressStatus.InProgress,
                        HighScore = 0,
                        HintsUsed = 0,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _dbContext.UserProgresses.Add(progress);
                }

                var previousHighScore = progress.HighScore;
                var isNewHighScore = evaluationResult.Score > previousHighScore;
                var earnedXp = GameScoringRules.CalculateEarnedXp(evaluationResult.Score, previousHighScore, challenge.BaseXP);

                // Actualizar progreso
                if (isNewHighScore)
                {
                    progress.HighScore = evaluationResult.Score;
                }

                if (evaluationResult.Passed)
                {
                    progress.Status = ProgressStatus.Completed;
                    progress.FirstCompletedAt ??= DateTime.UtcNow;
                }
                else if (progress.Status == ProgressStatus.NotStarted)
                {
                    progress.Status = ProgressStatus.InProgress;
                }

                progress.LastAttemptGraphJson = JsonSerializer.Serialize(request.Graph, JsonOptions);
                progress.UpdatedAt = DateTime.UtcNow;

                // Actualizar usuario XP y Nivel
                user.TotalXP += earnedXp;
                user.Level = GameScoringRules.CalculateLevel(user.TotalXP);
                user.UpdatedAt = DateTime.UtcNow;

                // Registrar intento histórico
                var attempt = new ChallengeAttempt
                {
                    Id = Guid.NewGuid(),
                    ProgressId = progress.Id,
                    Score = evaluationResult.Score,
                    Passed = evaluationResult.Passed,
                    HintsUsed = progress.HintsUsed,
                    GraphSubmittedJson = JsonSerializer.Serialize(request.Graph, JsonOptions),
                    EvaluationResultJson = JsonSerializer.Serialize(evaluationResult, JsonOptions),
                    CreatedAt = DateTime.UtcNow
                };
                _dbContext.ChallengeAttempts.Add(attempt);

                await _dbContext.SaveChangesAsync(cancellationToken);

                if (transaction != null)
                {
                    await transaction.CommitAsync(cancellationToken);
                }

                response = new EvaluateArchitectureResponseDto
                {
                    Score = evaluationResult.Score,
                    Passed = evaluationResult.Passed,
                    IsNewHighScore = isNewHighScore,
                    EarnedXP = earnedXp,
                    CurrentUserXP = user.TotalXP,
                    CurrentUserLevel = user.Level,
                    Feedback = evaluationResult.Feedback,
                    AttemptId = attempt.Id
                };
            }
            catch
            {
                if (transaction != null)
                {
                    await transaction.RollbackAsync(cancellationToken);
                }
                throw;
            }
        });

        return response;
    }

    public async Task<List<ChallengeAttemptHistoryDto>> GetChallengeAttemptsHistoryAsync(
        Guid challengeId, 
        Guid userId, 
        CancellationToken cancellationToken = default)
    {
        var progress = await _dbContext.UserProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

        if (progress == null)
        {
            return [];
        }

        var attempts = await _dbContext.ChallengeAttempts
            .AsNoTracking()
            .Where(a => a.ProgressId == progress.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        return attempts.Select(a =>
        {
            SemanticGraph graph = new();
            if (!string.IsNullOrWhiteSpace(a.GraphSubmittedJson))
            {
                try
                {
                    graph = JsonSerializer.Deserialize<SemanticGraph>(a.GraphSubmittedJson, JsonOptions) ?? new();
                }
                catch
                {
                    graph = new();
                }
            }

            return new ChallengeAttemptHistoryDto
            {
                Id = a.Id,
                Score = a.Score,
                Passed = a.Passed,
                HintsUsed = a.HintsUsed,
                CreatedAt = a.CreatedAt,
                GraphSubmitted = graph
            };
        }).ToList();
    }

    private async Task EnsureChallengeUnlockedAsync(Challenge challenge, Guid userId, CancellationToken cancellationToken)
    {
        var config = await _dbContext.SystemConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);

        var accessMode = config?.AccessMode ?? AccessMode.OpenAccess;
        if (accessMode == AccessMode.Progressive)
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

            var userTotalXp = user?.TotalXP ?? 0;

            if (challenge.PrerequisiteChallengeId.HasValue)
            {
                var prereqCompleted = await _dbContext.UserProgresses
                    .AsNoTracking()
                    .AnyAsync(p => p.UserId == userId 
                                && p.ChallengeId == challenge.PrerequisiteChallengeId.Value 
                                && p.Status == ProgressStatus.Completed, cancellationToken);

                if (!prereqCompleted)
                {
                    var prereqChallenge = await _dbContext.Challenges
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == challenge.PrerequisiteChallengeId.Value, cancellationToken);

                    var prereqTitle = prereqChallenge?.Title ?? "anterior";
                    throw new ChallengeLockedException($"El desafío está bloqueado. Requiere completar el desafío '{prereqTitle}'.");
                }
            }

            if (challenge.RequiredXP > 0 && userTotalXp < challenge.RequiredXP)
            {
                throw new ChallengeLockedException($"El desafío está bloqueado. Requiere {challenge.RequiredXP} XP (Actual: {userTotalXp} XP).");
            }
        }
    }
}
