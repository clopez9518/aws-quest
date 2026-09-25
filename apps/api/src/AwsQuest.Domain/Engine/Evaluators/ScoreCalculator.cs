namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ScoreCalculator
{
    public EvaluationResult Calculate(EvaluationExecutionContext context)
    {
        // 1. Agregar Feedback informativo si se utilizaron pistas (RN-07)
        if (context.HintsUsed > 0 && context.HintPenalties > 0)
        {
            context.FeedbackItems.Add(new FeedbackItem
            {
                Status = FeedbackItemStatus.Info,
                Category = FeedbackCategory.HintPenalty,
                Title = "Penalización por Pistas Desbloqueadas",
                Explanation = $"Se aplicó un descuento acumulado de {context.HintPenalties} puntos por haber consultado {context.HintsUsed} pista(s) pedagógica(s).",
                PenaltyApplied = context.HintPenalties
            });
        }

        // 2. Cálculo cuantitativo con clamp [0, 100]
        var rawScore = 100 - context.TotalErrorPenalties - context.HintPenalties;
        var finalScore = Math.Clamp(rawScore, 0, 100);
        var threshold = context.Rules.PassingScoreThreshold > 0 ? context.Rules.PassingScoreThreshold : 70;
        var passed = finalScore >= threshold;

        // 3. Generación del Resumen Pedagógico y Consolidación
        var summary = GeneratePedagogicalSummary(finalScore, passed, context);
        var keyConcepts = context.FeedbackItems
            .Where(i => i.Status == FeedbackItemStatus.Pass && !string.IsNullOrWhiteSpace(i.Title))
            .Select(i => i.Title
                .Replace("Buena Práctica Verificada: ", "")
                .Replace("Servicio Incluido: ", "")
                .Replace("Conexión Válida: ", "")
                .Replace("Ubicación Correcta: ", "")
                .Replace("Ruta de Red Verificada: ", "")
                .Replace("Regla de Seguridad Verificada: ", ""))
            .Distinct()
            .ToList();

        var feedback = new EvaluationFeedback
        {
            Summary = summary,
            Items = context.FeedbackItems,
            KeyConceptsLearned = keyConcepts,
            ArchitecturalTradeoffs = passed
                ? "Has diseñado una solución alineada con los pilares del AWS Well-Architected Framework. Para escalar a millones de usuarios, evalúa desacoplamiento con colas (SQS), caching con ElastiCache o migración a arquitecturas serverless."
                : null
        };

        return new EvaluationResult
        {
            Score = finalScore,
            PassingThreshold = threshold,
            Feedback = feedback,
            HintsUsed = context.HintsUsed,
            TotalHintPenalties = context.HintPenalties,
            TotalErrorPenalties = context.TotalErrorPenalties,
            EvaluatedAt = DateTime.UtcNow
        };
    }

    private static string GeneratePedagogicalSummary(int score, bool passed, EvaluationExecutionContext context)
    {
        var errorCount = context.FeedbackItems.Count(i => i.Status == FeedbackItemStatus.Fail);

        if (score == 100)
        {
            return "¡Excelente trabajo! Tu arquitectura cumple con todos los principios del AWS Well-Architected Framework: alta disponibilidad, seguridad y resiliencia sin defectos.";
        }

        if (passed)
        {
            return $"¡Desafío aprobado con {score}/100 puntos! Tu diseño es funcional y resiliente, aunque existen {errorCount} oportunidad(es) de optimización para alcanzar una solución perfecta.";
        }

        return $"La arquitectura enviada obtuvo {score}/100 puntos (mínimo requerido: {context.Rules.PassingScoreThreshold}). Revisa el desglose de retroalimentación para corregir los fallos estructurales y vuelve a intentarlo.";
    }
}
