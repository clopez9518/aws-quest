namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class SecurityGroupEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        if (rules.SecurityGroupRules.Count == 0)
        {
            return; // Retrocompatibilidad: Si no hay reglas de Security Group, No-Op
        }

        foreach (var sgRule in rules.SecurityGroupRules)
        {
            var targets = graph.GetComponentsByServiceCode(sgRule.TargetServiceCode).ToList();
            if (targets.Count == 0)
            {
                continue; // Ausencia evaluada por ServicePresenceEvaluator
            }

            foreach (var target in targets)
            {
                var attachedSgs = graph.GetAttachedSecurityGroups(target.Id).ToList();

                // 1. Si no tiene Security Groups vinculados
                if (attachedSgs.Count == 0 && target.Config.SecurityGroupRules.Count == 0)
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Fail,
                        Category = FeedbackCategory.SecurityGroup,
                        Title = $"Security Group Faltante en {target.ServiceCode}",
                        Explanation = !string.IsNullOrWhiteSpace(sgRule.Description)
                            ? sgRule.Description
                            : $"El recurso '{target.ServiceCode}' ({target.Id}) no tiene ningún Security Group asociado para regular el tráfico entrante.",
                        PenaltyApplied = sgRule.PenaltyIfViolated,
                        RelatedComponentIds = [target.Id]
                    });
                    continue;
                }

                // Recopilar todas las reglas de SG (asociadas vía componente o configuradas localmente)
                var allRules = attachedSgs.SelectMany(sg => sg.Config.SecurityGroupRules)
                    .Concat(target.Config.SecurityGroupRules)
                    .ToList();

                // 2. Validar Prohibición de Acceso Público Abierto (0.0.0.0/0)
                if (sgRule.ProhibitPublicAccess)
                {
                    var hasOpenPublicAccess = allRules.Any(r =>
                        r.Direction == RuleDirection.Ingress &&
                        r.MatchesPort(sgRule.Port) &&
                        (string.Equals(r.Source, "0.0.0.0/0", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(r.Source, "internet", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(r.Source, "*", StringComparison.OrdinalIgnoreCase)));

                    if (hasOpenPublicAccess)
                    {
                        context.AddFeedback(new FeedbackItem
                        {
                            Status = FeedbackItemStatus.Fail,
                            Category = FeedbackCategory.Security,
                            Title = $"Exposición Pública Insegura en {target.ServiceCode}",
                            Explanation = $"El Security Group de '{target.ServiceCode}' ({target.Id}) tiene el puerto {sgRule.Port} abierto a 0.0.0.0/0 (Internet abierto). Debe restringirse a la capa de cómputo autorizada.",
                            PenaltyApplied = sgRule.PenaltyIfViolated,
                            RelatedComponentIds = [target.Id]
                        });
                        continue;
                    }
                }

                // 3. Validar Regla de Ingress Autorizada desde Origen Requerido
                var hasValidIngressRule = allRules.Any(r =>
                    r.Direction == RuleDirection.Ingress &&
                    r.MatchesPort(sgRule.Port) &&
                    MatchesSource(r.Source, sgRule.AllowedSourceServiceCode, graph));

                if (hasValidIngressRule)
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Pass,
                        Category = FeedbackCategory.SecurityGroup,
                        Title = $"Security Group Configurado: {target.ServiceCode}",
                        Explanation = $"El Security Group de '{target.ServiceCode}' ({target.Id}) autoriza correctamente el tráfico entrante en puerto {sgRule.Port}/{sgRule.Protocol} desde '{sgRule.AllowedSourceServiceCode}'.",
                        RelatedComponentIds = [target.Id]
                    });
                }
                else
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Fail,
                        Category = FeedbackCategory.SecurityGroup,
                        Title = $"Regla Ingress Faltante en Security Group de {target.ServiceCode}",
                        Explanation = !string.IsNullOrWhiteSpace(sgRule.Description)
                            ? sgRule.Description
                            : $"El Security Group de '{target.ServiceCode}' ({target.Id}) debe tener una regla Ingress para el puerto {sgRule.Port}/{sgRule.Protocol} originada en '{sgRule.AllowedSourceServiceCode}'.",
                        PenaltyApplied = sgRule.PenaltyIfViolated,
                        RelatedComponentIds = [target.Id]
                    });
                }
            }
        }
    }

    private static bool MatchesSource(string source, string allowedSourceServiceCode, SemanticGraph graph)
    {
        if (string.IsNullOrWhiteSpace(source)) return false;

        // Si la regla indica el código directo del servicio (ej. "AWS_EC2" o "EC2")
        if (string.Equals(source, allowedSourceServiceCode, StringComparison.OrdinalIgnoreCase))
            return true;

        if (string.Equals(source.Replace("AWS_", ""), allowedSourceServiceCode.Replace("AWS_", ""), StringComparison.OrdinalIgnoreCase))
            return true;

        // Si la regla indica el ID de un componente o Security Group asociado a componentes del servicio permitido
        var allowedSourceComponents = graph.GetComponentsByServiceCode(allowedSourceServiceCode).ToList();
        foreach (var comp in allowedSourceComponents)
        {
            if (string.Equals(comp.Id, source, StringComparison.OrdinalIgnoreCase))
                return true;

            if (comp.Config.SecurityGroupIds.Any(sgId => string.Equals(sgId, source, StringComparison.OrdinalIgnoreCase)))
                return true;

            var attachedSgs = graph.GetAttachedSecurityGroups(comp.Id);
            if (attachedSgs.Any(sg => string.Equals(sg.Id, source, StringComparison.OrdinalIgnoreCase)))
                return true;
        }

        return false;
    }
}
