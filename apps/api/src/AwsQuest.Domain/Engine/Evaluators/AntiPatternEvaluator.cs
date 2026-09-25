namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class AntiPatternEvaluator : IEvaluatorStep
{
    public void Evaluate(EvaluationExecutionContext context)
    {
        var graph = context.Graph;
        var rules = context.Rules;

        foreach (var antiPattern in rules.AntiPatterns)
        {
            var isDetected = EvaluateAntiPatternCondition(antiPattern, graph);

            if (isDetected)
            {
                var (pillar, risk, recommendation) = GetAntiPatternEducationalMetadata(antiPattern.Type);
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = antiPattern.Category,
                    Title = !string.IsNullOrWhiteSpace(antiPattern.Title) ? antiPattern.Title : $"Antipatrón Detectado: {antiPattern.Type}",
                    Explanation = antiPattern.Feedback,
                    PenaltyApplied = antiPattern.Penalty,
                    WellArchitectedPillar = pillar,
                    ProductionRisk = risk,
                    FormativeRecommendation = recommendation
                });
            }
            else
            {
                var (pillar, _, _) = GetAntiPatternEducationalMetadata(antiPattern.Type);
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Pass,
                    Category = antiPattern.Category,
                    Title = $"Buena Práctica Verificada: {antiPattern.Type}",
                    Explanation = $"La arquitectura no presenta el defecto de {antiPattern.Type}.",
                    WellArchitectedPillar = pillar
                });
            }
        }
    }

    private static (string Pillar, string Risk, string Recommendation) GetAntiPatternEducationalMetadata(AntiPatternType type)
    {
        return type switch
        {
            AntiPatternType.SinglePointOfFailure => (
                "Reliability (Confiabilidad)",
                "Si el nodo primario sufre una caída de hardware o la zona de disponibilidad colapsa, toda la aplicación quedará indisponible para los usuarios.",
                "Agrega redundancia horizontal mediante múltiples instancias detrás de un Load Balancer o activa Multi-AZ / Auto Scaling."
            ),
            AntiPatternType.PublicDatabaseExposure => (
                "Security (Seguridad)",
                "La base de datos queda expuesta a escaneos de puertos y ataques de fuerza bruta directos desde Internet, arriesgando robo de datos.",
                "Aloja la base de datos en una Subred Privada y permite tráfico únicamente desde el Security Group de la capa de cómputo."
            ),
            AntiPatternType.MissingMultiAz => (
                "Reliability (Confiabilidad)",
                "Ante un desastre a nivel de Data Center o Zona de Disponibilidad de AWS, no habrá réplica en standby para conmutación automática.",
                "Habilita la replicación síncrona Multi-AZ en Amazon RDS para garantizar continuidad operativa y failover automático."
            ),
            AntiPatternType.DirectInternetToCompute => (
                "Security & Reliability",
                "El tráfico web entrante llega directamente a las máquinas virtuales sin amortiguación ni balanceo, saturando la capacidad de cómputo.",
                "Interpón un Application Load Balancer (ALB) en la subred pública que distribuya el tráfico HTTP hacia los servidores web."
            ),
            AntiPatternType.MissingAutoScaling => (
                "Reliability & Cost Optimization",
                "Durante picos repentinos de tráfico el sistema arrojará errores 504 Gateway Timeout por falta de capacidad de cómputo elástica.",
                "Configura un Auto Scaling Group que aumente o disminuya automáticamente las instancias EC2 en función de la demanda."
            ),
            AntiPatternType.MissingLoadBalancer => (
                "Reliability & Performance",
                "Tener múltiples servidores sin un balanceador de carga impide la distribución equitativa de las solicitudes de los usuarios.",
                "Agrega un Application Load Balancer (ALB) y conéctalo hacia tu grupo de instancias de cómputo."
            ),
            _ => (
                "Well-Architected Framework",
                "La configuración arquitectónica presenta un riesgo de disponibilidad, seguridad o rendimiento en producción.",
                "Revisa las mejores prácticas recomendadas en los pilares del AWS Well-Architected Framework."
            )
        };
    }

    private static bool EvaluateAntiPatternCondition(AntiPatternRule rule, SemanticGraph graph)
    {
        return rule.Type switch
        {
            AntiPatternType.SinglePointOfFailure => EvaluateSpof(graph, rule),
            AntiPatternType.PublicDatabaseExposure => EvaluatePublicDatabase(graph),
            AntiPatternType.MissingMultiAz => EvaluateMissingMultiAz(graph),
            AntiPatternType.DirectInternetToCompute => EvaluateDirectInternetToCompute(graph),
            AntiPatternType.MissingAutoScaling => EvaluateMissingAutoScaling(graph),
            AntiPatternType.MissingLoadBalancer => EvaluateMissingLoadBalancer(graph),
            _ => EvaluateGenericCondition(rule.Condition, graph)
        };
    }

    private static bool EvaluateSpof(SemanticGraph graph, AntiPatternRule rule)
    {
        var code = (rule.Code ?? string.Empty).ToUpperInvariant();

        // 1. Caso específico de ALB / Load Balancer
        if (code.Contains("ALB") || code.Contains("LOAD_BALANCER"))
        {
            return graph.GetComponentCount("AWS_ALB") == 0;
        }

        // 2. Caso específico de Cómputo / EC2
        if (code.Contains("EC2") || code.Contains("COMPUTE") || rule.Title.Contains("Cómputo", StringComparison.OrdinalIgnoreCase))
        {
            var ec2Components = graph.GetComponentsByServiceCode("AWS_EC2").ToList();
            if (ec2Components.Count == 0) return false;

            var effectiveCount = graph.GetEffectiveInstanceCount("AWS_EC2");
            var hasAsg = ec2Components.Any(c => c.Config.AutoScaling == true);

            // Si tiene al menos 2 instancias o tiene Auto Scaling habilitado, NO hay SPOF en cómputo
            return effectiveCount < 2 && !hasAsg;
        }

        // 3. Caso específico de Base de Datos / RDS
        if (code.Contains("RDS") || code.Contains("DATABASE") || code.Contains("DB") || rule.Title.Contains("Base de Datos", StringComparison.OrdinalIgnoreCase))
        {
            var rdsComponents = graph.GetComponentsByServiceCode("AWS_RDS").ToList();
            return rdsComponents.Count > 0 && rdsComponents.Any(rds => rds.Config.IsMultiAz != true);
        }

        // 4. SPOF Genérico: Evaluar si cómputo o base de datos presentan punto único de fallo
        var ec2s = graph.GetComponentsByServiceCode("AWS_EC2").ToList();
        if (ec2s.Count > 0)
        {
            var effectiveCount = graph.GetEffectiveInstanceCount("AWS_EC2");
            var hasAsg = ec2s.Any(c => c.Config.AutoScaling == true);
            if (effectiveCount < 2 && !hasAsg) return true;
        }

        var rdss = graph.GetComponentsByServiceCode("AWS_RDS").ToList();
        if (rdss.Count > 0 && rdss.Any(rds => rds.Config.IsMultiAz != true))
        {
            return true;
        }

        return false;
    }

    private static bool EvaluatePublicDatabase(SemanticGraph graph)
    {
        var rdsComponents = graph.GetComponentsByServiceCode("AWS_RDS").ToList();
        return rdsComponents.Any(rds =>
            rds.Config.IsPublic == true ||
            graph.IsLocatedInPublicSubnet(rds.Id) ||
            string.Equals(rds.Config.SubnetType, "Public", StringComparison.OrdinalIgnoreCase));
    }

    private static bool EvaluateMissingMultiAz(SemanticGraph graph)
    {
        var rdsComponents = graph.GetComponentsByServiceCode("AWS_RDS").ToList();
        return rdsComponents.Count > 0 && rdsComponents.All(rds => rds.Config.IsMultiAz != true);
    }

    private static bool EvaluateDirectInternetToCompute(SemanticGraph graph)
    {
        var ec2Components = graph.GetComponentsByServiceCode("AWS_EC2").ToList();
        var albComponents = graph.GetComponentsByServiceCode("AWS_ALB").ToList();

        // Si hay cómputo EC2 pero no hay ALB
        return ec2Components.Count > 0 && albComponents.Count == 0;
    }

    private static bool EvaluateMissingAutoScaling(SemanticGraph graph)
    {
        var ec2Components = graph.GetComponentsByServiceCode("AWS_EC2").ToList();
        return ec2Components.Count > 0 && ec2Components.All(c => c.Config.AutoScaling != true);
    }

    private static bool EvaluateMissingLoadBalancer(SemanticGraph graph)
    {
        var albCount = graph.GetComponentCount("AWS_ALB");
        var ec2Count = graph.GetComponentCount("AWS_EC2");
        return ec2Count >= 2 && albCount == 0;
    }

    private static bool EvaluateGenericCondition(string condition, SemanticGraph graph)
    {
        if (string.IsNullOrWhiteSpace(condition)) return false;

        if (condition.StartsWith("count(", StringComparison.OrdinalIgnoreCase))
        {
            var start = condition.IndexOf('(') + 1;
            var end = condition.IndexOf(')');
            if (start > 0 && end > start)
            {
                var serviceCode = condition[start..end].Trim();
                var opAndValue = condition[(end + 1)..].Trim();
                var currentCount = graph.GetComponentCount(serviceCode);

                if (opAndValue.StartsWith("<", StringComparison.Ordinal))
                {
                    if (int.TryParse(opAndValue[1..].Trim(), out var target) && currentCount < target)
                        return true;
                }
                else if (opAndValue.StartsWith("==", StringComparison.Ordinal))
                {
                    if (int.TryParse(opAndValue[2..].Trim(), out var target) && currentCount == target)
                        return true;
                }
            }
        }

        return false;
    }
}
