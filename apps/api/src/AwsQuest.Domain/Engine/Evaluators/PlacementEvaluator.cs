namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class PlacementEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        // 1. Evaluar Reglas Explícitas de Ubicación (PlacementRules)
        foreach (var rule in rules.PlacementRules)
        {
            var components = graph.GetComponentsByServiceCode(rule.ServiceCode).ToList();
            if (components.Count == 0)
            {
                continue; // La ausencia del servicio ya es evaluada por ServicePresenceEvaluator
            }

            foreach (var comp in components)
            {
                var isPlacementValid = ValidateComponentPlacement(comp, rule, graph, out var failureReason);

                if (isPlacementValid)
                {
                    var tierLabel = rule.RequiredSubnetTier.HasValue ? $" ({rule.RequiredSubnetTier.Value})" : string.Empty;
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Pass,
                        Category = FeedbackCategory.Placement,
                        Title = $"Ubicación Correcta: {comp.ServiceCode}",
                        Explanation = $"El recurso '{comp.ServiceCode}' ({comp.Id}) está correctamente ubicado dentro de '{rule.RequiredContainerCode}'{tierLabel}.",
                        RelatedComponentIds = [comp.Id]
                    });
                }
                else
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Fail,
                        Category = FeedbackCategory.Placement,
                        Title = $"Ubicación Inválida: {comp.ServiceCode}",
                        Explanation = !string.IsNullOrWhiteSpace(rule.Description)
                            ? rule.Description
                            : failureReason,
                        PenaltyApplied = rule.PenaltyIfViolated,
                        RelatedComponentIds = [comp.Id]
                    });
                }
            }
        }

        // 2. Validación de Jerarquía de Red: Subnets deben pertenecer a una VPC
        var subnets = graph.GetComponentsByServiceCode("NET_SUBNET").ToList();
        if (subnets.Count > 0 && rules.PlacementRules.Count > 0)
        {
            foreach (var subnet in subnets)
            {
                var parentVpc = graph.GetComponentVpc(subnet.Id);
                if (parentVpc == null)
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Fail,
                        Category = FeedbackCategory.Placement,
                        Title = $"Subred Huérfana de VPC: {subnet.Id}",
                        Explanation = $"La subred '{subnet.Id}' debe estar contenida dentro de una Virtual Private Cloud (NET_VPC).",
                        PenaltyApplied = 15,
                        RelatedComponentIds = [subnet.Id]
                    });
                }
            }
        }
    }

    private static bool ValidateComponentPlacement(
        GraphComponent comp,
        PlacementRule rule,
        SemanticGraph graph,
        out string failureReason)
    {
        failureReason = string.Empty;

        // 1. Si no tiene contenedor padre
        if (string.IsNullOrWhiteSpace(comp.ParentId))
        {
            failureReason = $"El recurso '{comp.ServiceCode}' ({comp.Id}) no está asignado a ningún contenedor '{rule.RequiredContainerCode}'.";
            return false;
        }

        var parent = graph.GetParent(comp.Id);
        if (parent == null)
        {
            failureReason = $"El contenedor padre con ID '{comp.ParentId}' no existe en la arquitectura.";
            return false;
        }

        // 2. Validar tipo de contenedor requerido
        if (!string.Equals(parent.ServiceCode, rule.RequiredContainerCode, StringComparison.OrdinalIgnoreCase))
        {
            failureReason = $"El recurso '{comp.ServiceCode}' está dentro de '{parent.ServiceCode}', pero se requiere '{rule.RequiredContainerCode}'.";
            return false;
        }

        // 3. Validar SubnetTier si aplica
        if (rule.RequiredSubnetTier.HasValue && string.Equals(rule.RequiredContainerCode, "NET_SUBNET", StringComparison.OrdinalIgnoreCase))
        {
            var actualTier = parent.Config.SubnetTier;
            var legacyType = parent.Config.SubnetType;

            var matchesTier = actualTier == rule.RequiredSubnetTier.Value ||
                (rule.RequiredSubnetTier.Value == SubnetTier.Public && string.Equals(legacyType, "Public", StringComparison.OrdinalIgnoreCase)) ||
                (rule.RequiredSubnetTier.Value == SubnetTier.Private && string.Equals(legacyType, "Private", StringComparison.OrdinalIgnoreCase)) ||
                (rule.RequiredSubnetTier.Value == SubnetTier.Isolated && string.Equals(legacyType, "Isolated", StringComparison.OrdinalIgnoreCase));

            if (!matchesTier)
            {
                var tierName = actualTier?.ToString() ?? legacyType ?? "desconocido";
                failureReason = $"El recurso '{comp.ServiceCode}' reside en una subred de tipo '{tierName}', pero se requiere una subred '{rule.RequiredSubnetTier.Value}'.";
                return false;
            }
        }

        return true;
    }
}
