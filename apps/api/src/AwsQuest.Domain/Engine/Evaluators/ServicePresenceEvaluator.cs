namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ServicePresenceEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        // 1. Validar Servicios Requeridos
        foreach (var requiredService in rules.RequiredServices)
        {
            var count = graph.GetComponentCount(requiredService);
            if (count == 0)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.ServiceSelection,
                    Title = $"Servicio Requerido Faltante: {requiredService}",
                    Explanation = $"La arquitectura requiere al menos una instancia de '{requiredService}' para cumplir con los requisitos del desafío.",
                    PenaltyApplied = 20
                });
            }
            else
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Pass,
                    Category = FeedbackCategory.ServiceSelection,
                    Title = $"Servicio Incluido: {requiredService}",
                    Explanation = $"Se ha incluido correctamente el servicio '{requiredService}' en la arquitectura."
                });
            }
        }

        // 2. Validar Servicios Prohibidos
        foreach (var forbiddenService in rules.ForbiddenServices)
        {
            var count = graph.GetComponentCount(forbiddenService);
            if (count > 0)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.ServiceSelection,
                    Title = $"Servicio No Permitido: {forbiddenService}",
                    Explanation = $"El servicio '{forbiddenService}' no debe utilizarse en este escenario arquitectónico.",
                    PenaltyApplied = 25
                });
            }
        }

        // 3. Validar Límites Mínimos de Instancias (MinInstances)
        foreach (var (serviceCode, minCount) in rules.MinInstances)
        {
            var count = graph.GetEffectiveInstanceCount(serviceCode);
            if (count < minCount)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.Availability,
                    Title = $"Instancias Insuficientes de {serviceCode}",
                    Explanation = $"Se requieren al menos {minCount} instancia(s) de '{serviceCode}', pero se encontraron {count}.",
                    PenaltyApplied = 15
                });
            }
        }

        // 4. Validar Límites Máximos de Instancias (MaxInstances)
        foreach (var (serviceCode, maxCount) in rules.MaxInstances)
        {
            var count = graph.GetEffectiveInstanceCount(serviceCode);
            if (count > maxCount)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.CostOptimization,
                    Title = $"Exceso de Instancias de {serviceCode}",
                    Explanation = $"El límite máximo para '{serviceCode}' es {maxCount} instancia(s), pero se configuraron {count}.",
                    PenaltyApplied = 15
                });
            }
        }
    }
}
