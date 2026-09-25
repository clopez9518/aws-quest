namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ConnectionEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        // 1. Validar Conexiones Requeridas
        foreach (var reqConn in rules.RequiredConnections)
        {
            var hasDirectConnection = graph.HasConnectionBetweenServices(reqConn.FromServiceCode, reqConn.ToServiceCode);
            var hasReverseConnection = reqConn.IsBidirectional &&
                graph.HasConnectionBetweenServices(reqConn.ToServiceCode, reqConn.FromServiceCode);

            if (hasDirectConnection || hasReverseConnection)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Pass,
                    Category = FeedbackCategory.Connection,
                    Title = $"Conexión Válida: {reqConn.FromServiceCode} -> {reqConn.ToServiceCode}",
                    Explanation = !string.IsNullOrWhiteSpace(reqConn.Description)
                        ? reqConn.Description
                        : $"Flujo de comunicación correcto establecido entre '{reqConn.FromServiceCode}' y '{reqConn.ToServiceCode}'."
                });
            }
            else
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.Connection,
                    Title = $"Conexión Faltante: {reqConn.FromServiceCode} -> {reqConn.ToServiceCode}",
                    Explanation = !string.IsNullOrWhiteSpace(reqConn.Description)
                        ? reqConn.Description
                        : $"Se requiere una conexión activa desde '{reqConn.FromServiceCode}' hacia '{reqConn.ToServiceCode}'.",
                    PenaltyApplied = reqConn.PenaltyIfMissing,
                    WellArchitectedPillar = "Operational Excellence",
                    ProductionRisk = "Los servicios no podrán comunicarse ni transferir cargas de trabajo entre sí, provocando fallas funcionales en la aplicación.",
                    FormativeRecommendation = $"Establece una conexión lógica y de red entre '{reqConn.FromServiceCode}' y '{reqConn.ToServiceCode}'."
                });
            }
        }

        // 2. Validar Conexiones Prohibidas
        foreach (var forbConn in rules.ForbiddenConnections)
        {
            var hasForbidden = graph.HasConnectionBetweenServices(forbConn.FromServiceCode, forbConn.ToServiceCode);
            if (hasForbidden)
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = FeedbackCategory.Security,
                    Title = $"Conexión Insegura o Inválida: {forbConn.FromServiceCode} -> {forbConn.ToServiceCode}",
                    Explanation = !string.IsNullOrWhiteSpace(forbConn.Reason)
                        ? forbConn.Reason
                        : $"No se permite una conexión directa entre '{forbConn.FromServiceCode}' y '{forbConn.ToServiceCode}'.",
                    PenaltyApplied = forbConn.Penalty,
                    WellArchitectedPillar = "Security (Seguridad)",
                    ProductionRisk = "Puentear capas de seguridad expone recursos privados a vectores de ataque innecesarios o viola la separación de responsabilidades.",
                    FormativeRecommendation = $"Elimina el enlace directo entre '{forbConn.FromServiceCode}' y '{forbConn.ToServiceCode}' y canaliza las peticiones a través de la capa intermedia correspondiente."
                });
            }
        }

        // 3. Detectar Nodos Aislados / Huérfanos
        if (graph.Components.Count > 1)
        {
            foreach (var comp in graph.Components)
            {
                var hasOut = graph.GetOutboundConnections(comp.Id).Any();
                var hasIn = graph.GetInboundConnections(comp.Id).Any();
                var hasParent = !string.IsNullOrWhiteSpace(comp.ParentId);
                var hasChildren = graph.Components.Any(c => string.Equals(c.ParentId, comp.Id, StringComparison.OrdinalIgnoreCase));
                var isContainerOrInfra = comp.ServiceCode is "NET_VPC" or "NET_SUBNET" or "NET_ROUTE_TABLE" or "NET_SECURITY_GROUP" or "NET_IGW" or "NET_NAT_GATEWAY";
                var isReferencedInConfig = graph.Components.Any(c =>
                    string.Equals(c.Config.RouteTableId, comp.Id, StringComparison.OrdinalIgnoreCase) ||
                    c.Config.SecurityGroupIds.Contains(comp.Id, StringComparer.OrdinalIgnoreCase) ||
                    c.Config.Routes.Any(r => string.Equals(r.TargetId, comp.Id, StringComparison.OrdinalIgnoreCase)));

                if (!hasOut && !hasIn && !hasParent && !hasChildren && !isContainerOrInfra && !isReferencedInConfig)
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Warning,
                        Category = FeedbackCategory.ArchitecturePattern,
                        Title = $"Componente Aislado: {comp.ServiceCode}",
                        Explanation = $"El componente '{comp.ServiceCode}' ({comp.Id}) no tiene conexiones de entrada ni salida.",
                        PenaltyApplied = 0,
                        RelatedComponentIds = [comp.Id]
                    });
                }
            }
        }
    }
}
