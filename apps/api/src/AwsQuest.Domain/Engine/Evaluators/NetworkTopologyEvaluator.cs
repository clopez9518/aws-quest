namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class NetworkTopologyEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        if (rules.RoutingRules.Count == 0)
        {
            return; // Retrocompatibilidad: Si no hay reglas de ruteo, No-Op
        }

        var allSubnets = graph.GetComponentsByServiceCode("NET_SUBNET").ToList();

        foreach (var routingRule in rules.RoutingRules)
        {
            var matchingSubnets = allSubnets.Where(s => MatchesSubnetTier(s, routingRule.SubnetTier)).ToList();

            if (matchingSubnets.Count == 0)
            {
                if (!string.IsNullOrWhiteSpace(routingRule.RequiresRouteTo))
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Fail,
                        Category = FeedbackCategory.NetworkTopology,
                        Title = $"Subred {routingRule.SubnetTier} No Encontrada",
                        Explanation = $"Se requiere al menos una subred de tipo '{routingRule.SubnetTier}' con enrutamiento configurado hacia '{routingRule.RequiresRouteTo}'.",
                        PenaltyApplied = routingRule.PenaltyIfMissing
                    });
                }
                continue;
            }

            foreach (var subnet in matchingSubnets)
            {
                // 1. Validar Ruta Requerida hacia Gateway
                if (!string.IsNullOrWhiteSpace(routingRule.RequiresRouteTo))
                {
                    var hasRequiredRoute = graph.HasRouteToGateway(subnet.Id, routingRule.RequiresRouteTo);

                    if (hasRequiredRoute)
                    {
                        context.AddFeedback(new FeedbackItem
                        {
                            Status = FeedbackItemStatus.Pass,
                            Category = FeedbackCategory.NetworkTopology,
                            Title = $"Enrutamiento Válido en Subred: {subnet.Id}",
                            Explanation = $"La subred '{subnet.Id}' ({routingRule.SubnetTier}) tiene una ruta correcta hacia '{routingRule.RequiresRouteTo}'.",
                            RelatedComponentIds = [subnet.Id]
                        });
                    }
                    else
                    {
                        context.AddFeedback(new FeedbackItem
                        {
                            Status = FeedbackItemStatus.Fail,
                            Category = FeedbackCategory.NetworkTopology,
                            Title = $"Ruta Faltante en Subred: {subnet.Id}",
                            Explanation = !string.IsNullOrWhiteSpace(routingRule.Description)
                                ? routingRule.Description
                                : $"La subred '{subnet.Id}' ({routingRule.SubnetTier}) no tiene configurada una ruta válida hacia '{routingRule.RequiresRouteTo}'.",
                            PenaltyApplied = routingRule.PenaltyIfMissing,
                            RelatedComponentIds = [subnet.Id]
                        });
                    }
                }

                // 2. Validar Ausencia de Rutas Prohibidas
                if (!string.IsNullOrWhiteSpace(routingRule.ForbiddenRouteTo))
                {
                    var hasForbiddenRoute = graph.HasRouteToGateway(subnet.Id, routingRule.ForbiddenRouteTo);

                    if (hasForbiddenRoute)
                    {
                        context.AddFeedback(new FeedbackItem
                        {
                            Status = FeedbackItemStatus.Fail,
                            Category = FeedbackCategory.Security,
                            Title = $"Ruta Prohibida o Insegura en Subred: {subnet.Id}",
                            Explanation = !string.IsNullOrWhiteSpace(routingRule.Description)
                                ? routingRule.Description
                                : $"La subred privada/aislada '{subnet.Id}' tiene una ruta indebida hacia '{routingRule.ForbiddenRouteTo}', exponiendo la red interna.",
                            PenaltyApplied = routingRule.PenaltyIfMissing,
                            RelatedComponentIds = [subnet.Id]
                        });
                    }
                    else
                    {
                        context.AddFeedback(new FeedbackItem
                        {
                            Status = FeedbackItemStatus.Pass,
                            Category = FeedbackCategory.Security,
                            Title = $"Aislamiento Verificado en Subred: {subnet.Id}",
                            Explanation = $"La subred '{subnet.Id}' ({routingRule.SubnetTier}) no tiene rutas directas hacia '{routingRule.ForbiddenRouteTo}'.",
                            RelatedComponentIds = [subnet.Id]
                        });
                    }
                }
            }
        }
    }

    private static bool MatchesSubnetTier(GraphComponent subnet, SubnetTier targetTier)
    {
        if (subnet.Config.SubnetTier.HasValue)
        {
            return subnet.Config.SubnetTier.Value == targetTier;
        }

        if (string.Equals(subnet.Config.SubnetType, "Public", StringComparison.OrdinalIgnoreCase) && targetTier == SubnetTier.Public) return true;
        if (string.Equals(subnet.Config.SubnetType, "Private", StringComparison.OrdinalIgnoreCase) && targetTier == SubnetTier.Private) return true;
        if (string.Equals(subnet.Config.SubnetType, "Isolated", StringComparison.OrdinalIgnoreCase) && targetTier == SubnetTier.Isolated) return true;

        return false;
    }
}
