namespace AwsQuest.Infrastructure.Services;

using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
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
    private readonly IChallengeAccessValidator _accessValidator;
    private readonly IValidator<EvaluateArchitectureRequestDto>? _evaluateValidator;
    private readonly ILogger<EvaluationService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public EvaluationService(
        IAppDbContext dbContext,
        IEvaluationEngine evaluationEngine,
        IChallengeAccessValidator? accessValidator = null,
        IValidator<EvaluateArchitectureRequestDto>? evaluateValidator = null,
        ILogger<EvaluationService>? logger = null)
    {
        _dbContext = dbContext;
        _evaluationEngine = evaluationEngine;
        _accessValidator = accessValidator ?? new ChallengeAccessValidator(dbContext);
        _evaluateValidator = evaluateValidator;
        _logger = logger ?? NullLogger<EvaluationService>.Instance;
    }

    public async Task<EvaluateArchitectureResponseDto> EvaluateArchitectureAsync(
        Guid challengeId, 
        Guid userId, 
        EvaluateArchitectureRequestDto request, 
        CancellationToken cancellationToken = default)
    {
        // 1. Validar integridad de payload y grafo arquitectónico
        if (_evaluateValidator != null)
        {
            await _evaluateValidator.ValidateAndThrowAsync(request, cancellationToken);
        }

        // 2. Cargar desafío
        var challenge = await _dbContext.Challenges
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == challengeId, cancellationToken);

        if (challenge == null)
        {
            _logger.LogWarning("[EvaluationService] Desafío no encontrado con ID: {ChallengeId}", challengeId);
            throw new ChallengeNotFoundException(challengeId);
        }

        // 3. Validar modo progresivo mediante validador centralizado
        await _accessValidator.ValidateAccessAsync(challenge, userId, cancellationToken);

        // 4. Deserializar reglas de evaluación y pistas
        var evaluationRules = !string.IsNullOrWhiteSpace(challenge.EvaluationRulesJson)
            ? JsonSerializer.Deserialize<ChallengeEvaluationRules>(challenge.EvaluationRulesJson, JsonOptions) ?? new()
            : new();

        var hintsDefinitions = !string.IsNullOrWhiteSpace(challenge.HintsJson)
            ? JsonSerializer.Deserialize<List<HintDefinition>>(challenge.HintsJson, JsonOptions) ?? []
            : [];

        // 5. Obtener progreso actual para determinar pistas desbloqueadas
        var progress = await _dbContext.UserProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

        var hintsUsedCount = progress?.HintsUsed ?? 0;
        var hintPenalties = hintsDefinitions
            .Where(h => h.OrderIndex <= hintsUsedCount)
            .Sum(h => h.PenaltyPoints);

        // 6. Evaluar en memoria con IEvaluationEngine
        var evaluationResult = _evaluationEngine.Evaluate(
            request.Graph, 
            evaluationRules, 
            hintsUsed: hintsUsedCount, 
            hintPenalties: hintPenalties);

        _logger.LogInformation(
            "[EvaluationService] Desafío '{Title}' evaluado. User={UserId}, Score={Score}, Passed={Passed}",
            challenge.Title,
            userId,
            evaluationResult.Score,
            evaluationResult.Passed);

        // 7. Ejecutar persistencia atómica con CreateExecutionStrategy (RNF-13)
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

                var currentProgress = await _dbContext.UserProgresses
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.ChallengeId == challengeId, cancellationToken);

                if (currentProgress == null)
                {
                    currentProgress = new UserProgress
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        ChallengeId = challengeId,
                        Status = ProgressStatus.InProgress,
                        HighScore = 0,
                        HintsUsed = 0,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _dbContext.UserProgresses.Add(currentProgress);
                }

                var previousHighScore = currentProgress.HighScore;
                var isNewHighScore = evaluationResult.Score > previousHighScore;
                var earnedXp = GameScoringRules.CalculateEarnedXp(evaluationResult.Score, previousHighScore, challenge.BaseXP);

                // Actualizar progreso
                if (isNewHighScore)
                {
                    currentProgress.HighScore = evaluationResult.Score;
                }

                if (evaluationResult.Passed)
                {
                    currentProgress.Status = ProgressStatus.Completed;
                    currentProgress.FirstCompletedAt ??= DateTime.UtcNow;
                }
                else if (currentProgress.Status == ProgressStatus.NotStarted)
                {
                    currentProgress.Status = ProgressStatus.InProgress;
                }

                currentProgress.LastAttemptGraphJson = JsonSerializer.Serialize(request.Graph, JsonOptions);
                currentProgress.UpdatedAt = DateTime.UtcNow;

                // Actualizar usuario XP y Nivel
                user.TotalXP += earnedXp;
                user.Level = GameScoringRules.CalculateLevel(user.TotalXP);
                user.UpdatedAt = DateTime.UtcNow;

                // Registrar intento histórico
                var attempt = new ChallengeAttempt
                {
                    Id = Guid.NewGuid(),
                    ProgressId = currentProgress.Id,
                    Score = evaluationResult.Score,
                    Passed = evaluationResult.Passed,
                    HintsUsed = currentProgress.HintsUsed,
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

        // Límite de 30 intentos más recientes para optimizar memoria y ancho de banda
        var attempts = await _dbContext.ChallengeAttempts
            .AsNoTracking()
            .Where(a => a.ProgressId == progress.Id)
            .OrderByDescending(a => a.CreatedAt)
            .Take(30)
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
}
