# Especificación Técnica: Motor de Evaluación y Suite de Pruebas Unitarias (Fase 2 - Hitos 2.2 y 2.3)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura, diseño modular, interfaces, lógica de evaluación en memoria y suite exhaustiva de pruebas unitarias para el **Motor de Evaluación de Arquitecturas (`EvaluationEngine`)** en la capa **`AwsQuest.Domain`**, correspondiente a las **Tareas 2.2 y 2.3** de la **Fase 2** del plan de desarrollo ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El motor de evaluación es el componente computacional central de **AWS Architecture Quest**. Su propósito es analizar en memoria, con tiempos de respuesta ultra rápidos ($< 2$ segundos, **RNF-02**), el grafo semántico de una arquitectura cloud diseñada por el aprendiz en el canvas (`SemanticGraph`) contra un conjunto de reglas declarativas pedagógicas (`ChallengeEvaluationRules`), generando un diagnóstico estructurado, retroalimentación formativa y una calificación cuantitativa (0 a 100 puntos) con apego estricto a las **Reglas de Negocio (RN-02 a RN-12)** y al **AWS Well-Architected Framework**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVALUATION ENGINE PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SemanticGraph ────────► ┌──────────────────────────────────────────────┐  │
│   (Arquitectura Usuario)  │         EvaluationEngine (Orchestrator)      │  │
│                           └──────────────────────┬───────────────────────┘  │
│                                                  │                          │
│   ChallengeEvaluationRules                       ▼                          │
│   (Reglas Declarativas)   ┌──────────────────────────────────────────────┐  │
│                           │ 1. ServicePresenceEvaluator                  │  │
│                           │    - Servicios requeridos / prohibidos       │  │
│   Hints Deductions        │    - Límites de instancias (Min / Max)       │  │
│                           ├──────────────────────────────────────────────┤  │
│                           │ 2. ConnectionEvaluator                       │  │
│                           │    - Conexiones requeridas / prohibidas      │  │
│                           │    - Coherencia topológica y flujos          │  │
│                           ├──────────────────────────────────────────────┤  │
│                           │ 3. AntiPatternEvaluator                      │  │
│                           │    - SPOF (Single Point of Failure)          │  │
│                           │    - Bases de datos públicas / sin Multi-AZ  │  │
│                           │    - Falta de Auto Scaling / Cómputo directo │  │
│                           ├──────────────────────────────────────────────┤  │
│                           │ 4. ScoreCalculator                           │  │
│                           │    - Deducción de errores y pistas           │  │
│                           │    - Clamp [0, 100], Aprobación >= 70 pts    │  │
│                           │    - Generación de resumen formativo         │  │
│                           └──────────────────────┬───────────────────────┘  │
│                                                  │                          │
│                                                  ▼                          │
│                                           EvaluationResult                  │
│                                   (Score, Passed, Feedback, XP)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requerimiento / Regla | Descripción | Aplicación en el Motor de Evaluación |
| :--- | :--- | :--- |
| **RN-02** | Criterio de Aprobación | Un desafío se aprueba si $\text{Score} \ge 70$. El motor establece `Passed = true` únicamente al superar el umbral. |
| **RN-03** | Catálogo Permitido | `ServicePresenceEvaluator` penaliza servicios prohibidos o que no formen parte del catálogo del caso. |
| **RN-04** | Límites de Instanciación | `ServicePresenceEvaluator` valida límites máximos (`MaxInstances`) y mínimos (`MinInstances`). |
| **RN-05** | Coherencia de Conexiones | `ConnectionEvaluator` valida que las relaciones dirigidas existan y correspondan a topologías válidas (ej. ALB $\rightarrow$ EC2 $\rightarrow$ RDS). |
| **RN-06 / RN-07** | Deducción por Pistas | `ScoreCalculator` descuenta exactamente la penalización acumulada por las pistas reveladas sobre la nota base de 100. |
| **RN-08** | Penalización por Errores | Deducción acumulativa de puntos por servicios innecesarios, conexiones faltantes/prohibidas y antipatrones detectados. |
| **RN-09 / RN-10** | Récords y XP sin Re-farmeo | `GameScoringRules` calcula el incremento neto de XP basado en el diferencial frente al récord previo. |
| **RN-11 / RN-12** | Reintentos e Inmutabilidad | La evaluación es pura y sin efectos secundarios en memoria. Se ejecuta únicamente tras el envío explícito del usuario. |
| **RF-13 a RF-15** | Diagnóstico Formativo | Cada aspecto evaluado genera un `FeedbackItem` con categoría (`FeedbackCategory`), estado (`Pass`, `Fail`, `Warning`, `Info`) y explicación. |
| **RNF-02** | Rendimiento ($< 2$ s) | Todo el procesamiento se realiza en memoria sin consultas I/O ni dependencias externas ($O(N)$ sobre componentes y aristas). |

---

## 3. Arquitectura y Diseño de Componentes (`AwsQuest.Domain.Engine`)

### 3.1. Estructura de Clases y Carpetas

```text
apps/api/src/AwsQuest.Domain/
├── Engine/
│   ├── IEvaluationEngine.cs                # Contrato principal del motor de evaluación
│   ├── EvaluationEngine.cs                  # Orquestador del pipeline de evaluación
│   ├── Evaluators/
│   │   ├── IEvaluatorStep.cs               # Interfaz modular para pasos del pipeline
│   │   ├── ServicePresenceEvaluator.cs     # Validación de servicios y conteo de instancias
│   │   ├── ConnectionEvaluator.cs          # Validación de enlaces topológicos y flujos
│   │   ├── AntiPatternEvaluator.cs         # Detección de patrones arquitectónicos defectuosos
│   │   └── ScoreCalculator.cs              # Cálculo cuantitativo de puntaje y resumen
│   └── Context/
│       └── EvaluationExecutionContext.cs   # Contexto mutable interno durante la evaluación
```

---

## 4. Especificación Detallada de Interfaces y Clases

### 4.1. Contexto de Ejecución de la Evaluación (`EvaluationExecutionContext.cs`)

Mantiene el estado intermedio de la evaluación a lo largo de las distintas etapas del pipeline:

```csharp
namespace AwsQuest.Domain.Engine.Context;

using AwsQuest.Domain.Engine.Models;

public class EvaluationExecutionContext
{
    public SemanticGraph Graph { get; }
    public ChallengeEvaluationRules Rules { get; }
    public int HintsUsed { get; }
    public int HintPenalties { get; }
    
    public List<FeedbackItem> FeedbackItems { get; } = [];
    public int TotalErrorPenalties { get; private set; }

    public EvaluationExecutionContext(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0)
    {
        Graph = graph ?? throw new ArgumentNullException(nameof(graph));
        Rules = rules ?? throw new ArgumentNullException(nameof(rules));
        HintsUsed = hintsUsed;
        HintPenalties = hintPenalties;
    }

    public void AddFeedback(FeedbackItem item)
    {
        FeedbackItems.Add(item);
        if (item.PenaltyApplied > 0)
        {
            TotalErrorPenalties += item.PenaltyApplied;
        }
    }
}
```

---

### 4.2. Interfaz de Pasos del Evaluador (`IEvaluatorStep.cs`)

```csharp
namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;

public interface IEvaluatorStep
{
    void Evaluate(EvaluationExecutionContext context);
}
```

---

### 4.3. Evaluador de Presencia de Servicios (`ServicePresenceEvaluator.cs`)

**Responsabilidades:**
1. Validar que todos los servicios obligatorios (`RequiredServices`) estén presentes en el grafo.
2. Validar que no existan servicios explícitamente prohibidos (`ForbiddenServices`).
3. Validar que la cantidad de instancias cumpla con `MinInstances` y no exceda `MaxInstances`.
4. Detectar servicios no requeridos o distractores aislados sin conexión.

```csharp
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
                    Explanation = $"La arquitectura requiere al menos una instancia de '{requiredService}' para cumplir con los requisitos.",
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
                    Explanation = $"El servicio '{forbiddenService}' no debe utilizarse en este escenario.",
                    PenaltyApplied = 25
                });
            }
        }

        // 3. Validar Límites Mínimos de Instancias (MinInstances)
        foreach (var (serviceCode, minCount) in rules.MinInstances)
        {
            var count = graph.GetComponentCount(serviceCode);
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
            var count = graph.GetComponentCount(serviceCode);
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
```

---

### 4.4. Evaluador de Conexiones y Topología (`ConnectionEvaluator.cs`)

**Responsabilidades:**
1. Verificar que existan las conexiones obligatorias (`RequiredConnections`) entre los componentes indicados (respetando si es bidireccional o tipo específico).
2. Detectar y penalizar conexiones prohibidas (`ForbiddenConnections`) que rompan el aislamiento o violen patrones de diseño.
3. Detectar componentes desconectados (nodos huérfanos sin enlaces entrantes ni salientes).

```csharp
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
                    Explanation = reqConn.Description.Length > 0
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
                    Explanation = reqConn.Description.Length > 0
                        ? reqConn.Description
                        : $"Se requiere una conexión activa desde '{reqConn.FromServiceCode}' hacia '{reqConn.ToServiceCode}'.",
                    PenaltyApplied = reqConn.PenaltyIfMissing
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
                    Explanation = forbConn.Reason.Length > 0
                        ? forbConn.Reason
                        : $"No se permite una conexión directa entre '{forbConn.FromServiceCode}' y '{forbConn.ToServiceCode}'.",
                    PenaltyApplied = forbConn.Penalty
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

                if (!hasOut && !hasIn)
                {
                    context.AddFeedback(new FeedbackItem
                    {
                        Status = FeedbackItemStatus.Warning,
                        Category = FeedbackCategory.ArchitecturePattern,
                        Title = $"Componente Aislado: {comp.ServiceCode}",
                        Explanation = $"El componente '{comp.ServiceCode}' ({comp.Id}) no tiene conexiones de entrada ni salida.",
                        PenaltyApplied = 5,
                        RelatedComponentIds = [comp.Id]
                    });
                }
            }
        }
    }
}
```

---

### 4.5. Evaluador de Antipatrones Arquitectónicos (`AntiPatternEvaluator.cs`)

**Responsabilidades:**
Evalúa de manera determinista los antipatrones configurados en `ChallengeEvaluationRules.AntiPatterns`:
1. **`SinglePointOfFailure` (SPOF):**
   * Detecta si una capa de cómputo (EC2) posee una sola instancia o no está configurada con Auto Scaling (`AutoScaling == false`).
   * Detecta si una base de datos carece de Multi-AZ (`IsMultiAz == false`).
2. **`PublicDatabaseExposure`:**
   * Detecta si un nodo RDS posee `IsPublic == true` o `SubnetType == "Public"`.
   * Detecta si existe conexión entrante directa desde Internet/Edge hacia la base de datos sin pasar por la capa de cómputo.
3. **`MissingMultiAz`:**
   * Detecta bases de datos relacionales sin réplica en múltiples zonas de disponibilidad.
4. **`DirectInternetToCompute` / `MissingLoadBalancer`:**
   * Detecta servidores EC2 conectados directamente a internet sin balanceador de carga (ALB).
5. **`MissingAutoScaling`:**
   * Detecta servidores de cómputo sin grupo de autoescalado habilitado en escenarios de tráfico variable.

```csharp
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
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Fail,
                    Category = antiPattern.Category,
                    Title = antiPattern.Title.Length > 0 ? antiPattern.Title : $"Antipatrón Detectado: {antiPattern.Type}",
                    Explanation = antiPattern.Feedback,
                    PenaltyApplied = antiPattern.Penalty
                });
            }
            else
            {
                context.AddFeedback(new FeedbackItem
                {
                    Status = FeedbackItemStatus.Pass,
                    Category = antiPattern.Category,
                    Title = $"Buena Práctica Verificada: {antiPattern.Type}",
                    Explanation = $"La arquitectura no presenta el defecto de {antiPattern.Type}."
                });
            }
        }
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
        // 1. EC2 SPOF: Solo 1 instancia y sin Auto Scaling
        var ec2Components = graph.GetComponentsByServiceCode("AWS_EC2").ToList();
        if (ec2Components.Count == 1)
        {
            var singleEc2 = ec2Components[0];
            var instanceCount = singleEc2.Config.InstanceCount ?? 1;
            var isAsg = singleEc2.Config.AutoScaling ?? false;

            if (instanceCount < 2 && !isAsg) return true;
        }

        // 2. RDS SPOF: RDS sin Multi-AZ
        var rdsComponents = graph.GetComponentsByServiceCode("AWS_RDS").ToList();
        if (rdsComponents.Any(rds => rds.Config.IsMultiAz != true))
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

        // Si hay EC2 pero no hay ALB
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

        // Soporte para condiciones semánticas simples tipo "count(AWS_EC2) < 2"
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
```

---

### 4.6. Calculador de Puntuación y Resumen Formativo (`ScoreCalculator.cs`)

**Responsabilidades:**
1. Aplicar la fórmula oficial de deducción:
   $$\text{Score} = \max\left(0, \; 100 - \sum \text{Penalizaciones por Errores} - \sum \text{Penalizaciones por Pistas}\right)$$
2. Registrar el ítem informativo de deducción por pistas si `HintsUsed > 0` (**RN-07**).
3. Determinar el estado de aprobación (`Passed = Score >= PassingScoreThreshold`, por defecto 70, **RN-02**).
4. Generar el resumen pedagógico formativo (`EvaluationFeedback.Summary`).

```csharp
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

        // 3. Generación del Resumen Pedagógico
        var summary = GeneratePedagogicalSummary(finalScore, passed, context);

        var feedback = new EvaluationFeedback
        {
            Summary = summary,
            Items = context.FeedbackItems
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
```

---

### 4.7. Orquestador del Motor de Evaluación (`EvaluationEngine.cs`)

Implementa `IEvaluationEngine` orquestando la ejecución secuencial de los pasos en memoria:

#### `IEvaluationEngine.cs`
```csharp
namespace AwsQuest.Domain.Engine;

using AwsQuest.Domain.Engine.Models;

public interface IEvaluationEngine
{
    EvaluationResult Evaluate(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0);
}
```

#### `EvaluationEngine.cs`
```csharp
namespace AwsQuest.Domain.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Exceptions;

public class EvaluationEngine : IEvaluationEngine
{
    private readonly List<IEvaluatorStep> _steps;
    private readonly ScoreCalculator _scoreCalculator;

    public EvaluationEngine()
    {
        _steps =
        [
            new ServicePresenceEvaluator(),
            new ConnectionEvaluator(),
            new AntiPatternEvaluator()
        ];
        _scoreCalculator = new ScoreCalculator();
    }

    public EvaluationEngine(IEnumerable<IEvaluatorStep> customSteps, ScoreCalculator? scoreCalculator = null)
    {
        _steps = customSteps.ToList();
        _scoreCalculator = scoreCalculator ?? new ScoreCalculator();
    }

    public EvaluationResult Evaluate(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0)
    {
        ArgumentNullException.ThrowIfNull(graph);
        ArgumentNullException.ThrowIfNull(rules);

        if (graph.IsEmpty)
        {
            throw new InvalidGraphException("No se puede evaluar una arquitectura vacía sin componentes.");
        }

        var context = new EvaluationExecutionContext(graph, rules, hintsUsed, hintPenalties);

        // Ejecución secuencial de los evaluadores especializados
        foreach (var step in _steps)
        {
            step.Evaluate(context);
        }

        // Cálculo de puntaje final, clamp y resumen formativo
        return _scoreCalculator.Calculate(context);
    }
}
```

---

## 5. Especificación de la Suite de Pruebas Unitarias (Hito 2.3)

La suite de pruebas se implementa con **xUnit** y **FluentAssertions** en `apps/api/tests/AwsQuest.UnitTests/Engine/`, asegurando cobertura del 100% en todos los evaluadores y casos de borde.

### 5.1. Matriz de Cobertura de Tests Unitarios

```text
apps/api/tests/AwsQuest.UnitTests/Engine/
├── ServicePresenceEvaluatorTests.cs   # Cobertura de presencia, ausencia y límites
├── ConnectionEvaluatorTests.cs        # Cobertura de conexiones requeridas/prohibidas y huérfanos
├── AntiPatternEvaluatorTests.cs       # Cobertura de SPOF, Multi-AZ, Base de datos pública
├── ScoreCalculatorTests.cs            # Cobertura de fórmulas, clamp [0,100] y pistas
└── EvaluationEngineTests.cs           # Pruebas integrales de flujo completo en memoria
```

---

### 5.2. Escenarios de Prueba Detallados

#### A. `ServicePresenceEvaluatorTests.cs`
1. **`Evaluate_WhenAllRequiredServicesPresent_ShouldAddPassFeedback`:**
   * Grafo con ALB + EC2 + RDS.
   * Reglas exigen ALB + EC2 + RDS.
   * Verifica 3 feedbacks `Pass` con categoría `ServiceSelection` y 0 penalización.
2. **`Evaluate_WhenRequiredServiceMissing_ShouldAddFailFeedbackWithPenalty`:**
   * Grafo con EC2 + RDS (sin ALB).
   * Reglas exigen ALB.
   * Verifica feedback `Fail` para ALB con penalización de 20 pts.
3. **`Evaluate_WhenForbiddenServicePresent_ShouldAddFailFeedbackWithPenalty`:**
   * Grafo incluye `AWS_S3` cuando las reglas lo prohíben explícitamente.
   * Verifica feedback `Fail` para S3 con penalización de 25 pts.
4. **`Evaluate_WhenMinInstancesNotMet_ShouldAddFailFeedback`:**
   * Grafo con 1 instancia EC2, pero `MinInstances["AWS_EC2"] = 2`.
   * Verifica feedback `Fail` con penalización de 15 pts.
5. **`Evaluate_WhenMaxInstancesExceeded_ShouldAddFailFeedback`:**
   * Grafo con 3 instancias ALB, pero `MaxInstances["AWS_ALB"] = 1`.
   * Verifica feedback `Fail` con categoría `CostOptimization` y penalización de 15 pts.

---

#### B. `ConnectionEvaluatorTests.cs`
1. **`Evaluate_WhenRequiredConnectionsPresent_ShouldAddPassFeedback`:**
   * Grafo con conexiones `ALB -> EC2` y `EC2 -> RDS`.
   * Reglas exigen ambas conexiones.
   * Verifica feedbacks `Pass` con categoría `Connection`.
2. **`Evaluate_WhenRequiredConnectionMissing_ShouldAddFailFeedbackWithPenalty`:**
   * Grafo con `ALB` y `EC2` sin conexión entre ellos.
   * Verifica feedback `Fail` con penalización de 15 pts.
3. **`Evaluate_WhenForbiddenConnectionExists_ShouldAddFailFeedbackWithPenalty`:**
   * Grafo con conexión directa `ALB -> RDS` o `Internet -> RDS`.
   * Reglas prohíben `ALB -> RDS`.
   * Verifica feedback `Fail` con categoría `Security` y penalización de 20 pts.
4. **`Evaluate_WhenOrphanComponentExists_ShouldAddWarningFeedback`:**
   * Grafo con `ALB -> EC2 -> RDS` y un nodo `AWS_S3` suelto sin enlaces.
   * Verifica feedback `Warning` con categoría `ArchitecturePattern` identificando el componente huérfano.

---

#### C. `AntiPatternEvaluatorTests.cs`
1. **`Evaluate_WhenSingleEc2WithoutAsg_ShouldDetectSpof`:**
   * Grafo con 1 sola EC2 con `AutoScaling = false` e `InstanceCount = 1`.
   * Regla de antipatrón `SinglePointOfFailure`.
   * Verifica detección de SPOF, categoría `Availability` y penalización de 20 pts.
2. **`Evaluate_WhenRdsWithoutMultiAz_ShouldDetectMissingMultiAz`:**
   * Grafo con RDS con `IsMultiAz = false`.
   * Regla de antipatrón `MissingMultiAz`.
   * Verifica detección de falta de redundancia en BD y penalización de 20 pts.
3. **`Evaluate_WhenPublicDatabaseConfigured_ShouldDetectPublicDatabaseExposure`:**
   * Grafo con RDS con `IsPublic = true` o `SubnetType = "Public"`.
   * Verifica detección de vulnerabilidad de seguridad y penalización correspondiente.
4. **`Evaluate_WhenMultipleEc2WithAsgAndMultiAzRds_ShouldPassAllAntiPatterns`:**
   * Grafo con 2 EC2 con ASG + RDS Multi-AZ.
   * Verifica feedbacks `Pass` para todas las reglas de antipatrones.

---

#### D. `ScoreCalculatorTests.cs`
1. **`Calculate_WhenZeroErrorsAndZeroHints_ShouldReturnScore100AndPass`:**
   * 0 errores, 0 pistas $\rightarrow$ Score 100, `Passed = true`.
2. **`Calculate_WhenPenaltyCausesScoreAboveThreshold_ShouldPass`:**
   * Error penalty de 20 pts, 0 pistas $\rightarrow$ Score 80, `Passed = true`.
3. **`Calculate_WhenPenaltiesAndHintsReduceScoreBelow70_ShouldFail`:**
   * Error penalty de 20 pts, Hint penalty de 15 pts $\rightarrow$ Score 65 ($100 - 35$), `Passed = false`.
4. **`Calculate_WhenScoreExactlyAtPassingThreshold_ShouldPass`:**
   * Error penalty de 30 pts $\rightarrow$ Score 70, `Passed = true` (**RN-02** límite).
5. **`Calculate_WhenTotalPenaltiesExceed100_ShouldClampToZero`:**
   * Error penalties 120 pts $\rightarrow$ Score 0 (no números negativos).
6. **`Calculate_WhenHintsUsed_ShouldIncludeInfoFeedbackItem`:**
   * Verifica que se agregue un `FeedbackItem` informativo con categoría `HintPenalty`.

---

#### E. `EvaluationEngineTests.cs` (Pruebas de Integración In-Memory)
1. **`Evaluate_PerfectThreeTierArchitecture_ShouldReturn100Score`:**
   * **Arquitectura:** ALB $\rightarrow$ EC2 (AutoScaling, 2 instancias) $\rightarrow$ RDS (Multi-AZ, privado).
   * **Reglas:** Desafío estándar de 3 capas.
   * **Resultado esperado:** Score: 100, Passed: true, 0 penalizaciones, resumen de felicitaciones.
2. **`Evaluate_FlawedArchitectureWithSpofAndMissingConnection_ShouldEvaluateAccurately`:**
   * **Arquitectura:** 1 EC2 (sin ASG) + RDS (sin Multi-AZ) + sin ALB.
   * **Resultado esperado:** Múltiples fallos detectados, deducciones acumuladas, Score $< 70$, Passed: false.
3. **`Evaluate_WhenGraphIsEmpty_ShouldThrowInvalidGraphException`:**
   * Grafo sin componentes $\rightarrow$ Lanza `InvalidGraphException`.

---

## 6. Verificación de Rendimiento ($< 2$ Segundos - RNF-02)

Para validar el requisito no funcional de evaluación ultra rápida:
* Cada prueba unitaria de evaluación en `EvaluationEngineTests` debe completarse en $< 50$ milisegundos en entorno local.
* Se incluirá una prueba de benchmark con un grafo complejo de 20 componentes y 30 conexiones validando que el tiempo total sea inferior a 100 ms.

---

## 7. Matriz de Trazabilidad Técnica

| Componente | Requisito / Regla | Estado |
| :--- | :--- | :--- |
| `ServicePresenceEvaluator` | RN-03, RN-04, RF-08 | Diseñado y especificado |
| `ConnectionEvaluator` | RN-05, RF-10 | Diseñado y especificado |
| `AntiPatternEvaluator` | RN-08, RF-11, RF-12 | Diseñado y especificado |
| `ScoreCalculator` | RN-02, RN-06, RN-07, RN-08 | Diseñado y especificado |
| `EvaluationEngine` | RF-13, RF-14, RF-15, RNF-02 | Diseñado y especificado |
| Suite xUnit (5 clases de test) | Hito 2.3, RN-02 a RN-12 | Diseñado y especificado |
