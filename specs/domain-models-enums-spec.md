# Especificación Técnica: Modelos de Dominio, Enums y Grafos Semánticos (Fase 2 - Hito 2.1)

## 1. Introducción y Objetivos

Esta especificación técnica define el diseño, estructura, comportamiento y modelos de datos en memoria para la capa **`AwsQuest.Domain`**, correspondiente a la **Tarea 2.1** de la **Fase 2** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El núcleo de dominio es el corazón de la plataforma y alberga:
1. Los **Enums de Dominio** que tipifican los estados del juego, categorías de feedback, niveles de dificultad y modalidades.
2. Los **Modelos del Grafo Semántico** (`SemanticGraph`, `GraphComponent`, `GraphConnection`, `ComponentConfig`) que representan la arquitectura diseñada por el usuario de forma desacoplada de la UI.
3. Los **Modelos de Reglas Declarativas** (`ChallengeEvaluationRules`, `RequiredConnectionRule`, `ForbiddenConnectionRule`, `AntiPatternRule`, `HintDefinition`) que configuran la lógica pedagógica de cada desafío.
4. Los **Modelos de Salida de Evaluación** (`EvaluationResult`, `EvaluationFeedback`, `FeedbackItem`) que entregan el desglose de retroalimentación formativa y puntuación.
5. Las **Excepciones de Dominio** que capturan y tipifican violaciones de invariantes de negocio.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AwsQuest.Domain (Core)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ├── Entities/             (Persistidas por EF Core 10 en Fase 1)            │
│ ├── Enums/                (Tipos discretos del negocio y evaluación)        │
│ ├── Engine/                                                                 │
│ │   ├── Models/           (Grafo semántico, Reglas declarativas, Feedback)  │
│ │   └── Evaluators/       (Sub-evaluadores y motor en memoria - Tarea 2.2)  │
│ └── Exceptions/           (Invariantes y errores de dominio)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Principios Rectores:
* **Cero Dependencias Externas:** `AwsQuest.Domain` depende exclusivamente del runtime de .NET 10 (`System.*`, `System.Text.Json.Serialization`), manteniendo pureza arquitectónica (**Clean Architecture**).
* **Inmutabilidad y Tipado Fuerte:** Los modelos utilizan propiedades fuertemente tipadas con inicializadores por defecto para prevenir estados nulos inválidos.
* **Desacoplamiento Visual:** El grafo semántico almacena únicamente la topología y configuración lógica (sin coordenadas `x, y`, anchos, altos o librerías de UI como React Flow).

---

## 2. Enums de Dominio (`AwsQuest.Domain.Enums`)

### 2.1. Enums Existentes de Fase 1 (Consolidados)

#### `AccessMode.cs`
Rige la política global de accesibilidad de desafíos (**RN-01 / CU-07**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum AccessMode
{
    OpenAccess = 1,
    Progressive = 2
}
```

#### `DifficultyLevel.cs`
Clasifica la complejidad técnica y pedagógica del desafío.
```csharp
namespace AwsQuest.Domain.Enums;

public enum DifficultyLevel
{
    Easy = 1,
    Intermediate = 2,
    Hard = 3,
    Integrator = 4
}
```

#### `ProgressStatus.cs`
Indica el estado de avance del aprendiz en un desafío (**RN-02**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum ProgressStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3
}
```

---

### 2.2. Nuevos Enums de Fase 2 (Evaluación, Feedback y Modalidades)

#### `ChallengeMode.cs`
Define la mecánica operativa del desafío (**Mecánicas 3.1**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum ChallengeMode
{
    Builder = 1,          // Canvas en blanco: construir desde cero
    FixArchitecture = 2   // Canvas precargado con fallos: diagnosticar y corregir
}
```

#### `FeedbackItemStatus.cs`
Califica el estado de cumplimiento de cada aspecto evaluado en la arquitectura (**RF-15 / RNF-06**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum FeedbackItemStatus
{
    Pass = 1,     // Cumplimiento satisfactorio (verde)
    Fail = 2,     // Incumplimiento o error grave (rojo)
    Warning = 3,  // Recomendación de mejora no bloqueante (amarillo)
    Info = 4      // Mensaje informativo o desglose de deducción de pistas (azul)
}
```

#### `FeedbackCategory.cs`
Categoriza la dimensión técnica o pedagógica de la observación de retroalimentación (**RF-15 / RN-08**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum FeedbackCategory
{
    ServiceSelection = 1,      // Presencia de servicios requeridos, prohibidos o distractores
    Connection = 2,            // Conectividad lógica y flujo de datos
    ArchitecturePattern = 3,   // Patrón estructural general
    Availability = 4,          // Alta disponibilidad, redundancia y Multi-AZ
    Security = 5,              // Aislamiento de capas, acceso público/privado
    Performance = 6,           // Escalabilidad, cómputo dinámico (ASG)
    CostOptimization = 7,      // Eficiencia de recursos
    HintPenalty = 8,           // Deducciones de puntuación por pistas solicitadas
    Configuration = 9          // Parámetros internos de los servicios
}
```

#### `ConnectionType.cs`
Tipifica la naturaleza del enlace entre dos componentes arquitectónicos (**RN-05**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum ConnectionType
{
    HttpHttps = 1,     // Tráfico web/REST (ej. ALB -> EC2)
    Database = 2,      // Conexión SQL/NoSQL (ej. EC2 -> RDS)
    AsyncQueue = 3,    // Encolamiento/mensajería asíncrona (ej. EC2 -> SQS)
    InternalVpc = 4,   // Comunicación privada interna
    Storage = 5,       // Acceso a objetos/bloque (ej. EC2 -> S3)
    SecurityGroup = 6  // Relación de seguridad perimetral
}
```

#### `AntiPatternType.cs`
Identifica patrones arquitectónicos defectuosos detectables por el motor (**RN-08 / Mecánicas 6.2**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum AntiPatternType
{
    SinglePointOfFailure = 1,    // Instancia única sin redundancia
    PublicDatabaseExposure = 2,  // Base de datos accesible desde internet
    MissingMultiAz = 3,          // Base de datos sin réplica en múltiples zonas
    DirectInternetToCompute = 4, // Cómputo sin capa de balanceo
    MissingAutoScaling = 5,      // Carga variable sin grupo de autoescalado
    MissingLoadBalancer = 6,     // Tráfico distribuido manualmente sin ALB
    UnusedService = 7,           // Servicio distractor o aislado en el lienzo
    InvalidDataFlow = 8          // Flujo invertido o topología no permitida
}
```

---

## 3. Modelos del Grafo Semántico (`AwsQuest.Domain.Engine.Models`)

Los modelos del grafo semántico encapsulan la arquitectura creada por el usuario y enviada al backend para evaluación (**RF-13, RF-21, RNF-07**).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SEMANTIC GRAPH                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Components: List<GraphComponent>                                            │
│   ├── Id: "node-1"                                                          │
│   ├── ServiceCode: "AWS_EC2"                                                │
│   └── Config: { AutoScaling: true, InstanceCount: 2, IsMultiAz: false }     │
│                                                                             │
│ Connections: List<GraphConnection>                                         │
│   ├── FromComponentId: "node-alb"                                           │
│   ├── ToComponentId: "node-1"                                               │
│   └── ConnectionType: "HTTP_HTTPS"                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. `ComponentConfig.cs`
Representa los parámetros de configuración lógica asociados a un componente en el lienzo (**Mecánicas 4.3**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class ComponentConfig
{
    public bool? IsMultiAz { get; set; }
    public bool? AutoScaling { get; set; }
    public int? InstanceCount { get; set; }
    public bool? IsPublic { get; set; }
    public string? SubnetType { get; set; } // "Public" | "Private" | "Isolated"
    public string? StorageClass { get; set; }
    public Dictionary<string, object> CustomProperties { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
```

### 3.2. `GraphComponent.cs`
Representa un nodo o servicio instanciado en la arquitectura.

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class GraphComponent
{
    public string Id { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty; // Ej: "AWS_EC2", "AWS_RDS", "AWS_ALB"
    public string? Label { get; set; }
    public ComponentConfig Config { get; set; } = new();

    public override string ToString() => $"{ServiceCode} ({Id})";
}
```

### 3.3. `GraphConnection.cs`
Representa una conexión dirigida o flujo de tráfico entre dos componentes (**RN-05**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class GraphConnection
{
    public string FromComponentId { get; set; } = string.Empty;
    public string ToComponentId { get; set; } = string.Empty;
    public string ConnectionType { get; set; } = "HTTP_HTTPS";

    public override string ToString() => $"{FromComponentId} -> {ToComponentId} [{ConnectionType}]";
}
```

### 3.4. `SemanticGraph.cs`
Contenedor principal del grafo de arquitectura, con métodos de consulta y navegación topológica para facilitar la evaluación en memoria (**RNF-02**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class SemanticGraph
{
    public List<GraphComponent> Components { get; set; } = [];
    public List<GraphConnection> Connections { get; set; } = [];

    // Consultas de Navegación Rápida
    public GraphComponent? GetComponentById(string id) =>
        Components.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphComponent> GetComponentsByServiceCode(string serviceCode) =>
        Components.Where(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public int GetComponentCount(string serviceCode) =>
        Components.Count(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphConnection> GetOutboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.FromComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphConnection> GetInboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.ToComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public bool HasConnectionBetweenServices(string fromServiceCode, string toServiceCode)
    {
        var fromIds = GetComponentsByServiceCode(fromServiceCode).Select(c => c.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var toIds = GetComponentsByServiceCode(toServiceCode).Select(c => c.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);

        return Connections.Any(conn => fromIds.Contains(conn.FromComponentId) && toIds.Contains(conn.ToComponentId));
    }

    public bool IsEmpty => Components.Count == 0;
}
```

---

## 4. Modelos de Reglas Declarativas (`AwsQuest.Domain.Engine.Models`)

Modelan la especificación JSONB declarativa almacenada en `challenges.evaluation_rules_json` y `challenges.hints_json` (**RF-21 / RNF-08**).

### 4.1. `RequiredConnectionRule.cs`
Especifica una conexión obligatoria entre dos tipos de servicios para aprobar la topología (**RN-05**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class RequiredConnectionRule
{
    public string FromServiceCode { get; set; } = string.Empty;
    public string ToServiceCode { get; set; } = string.Empty;
    public string? ConnectionType { get; set; }
    public bool IsBidirectional { get; set; } = false;
    public int PenaltyIfMissing { get; set; } = 15;
    public string Description { get; set; } = string.Empty;
}
```

### 4.2. `ForbiddenConnectionRule.cs`
Especifica enlaces que violan principios de seguridad o arquitectura.

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class ForbiddenConnectionRule
{
    public string FromServiceCode { get; set; } = string.Empty;
    public string ToServiceCode { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Penalty { get; set; } = 20;
}
```

### 4.3. `AntiPatternRule.cs`
Define reglas para la detección de malas prácticas arquitectónicas (**RN-08**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class AntiPatternRule
{
    public string Code { get; set; } = string.Empty; // Ej: "SPOF_SINGLE_EC2"
    public AntiPatternType Type { get; set; } = AntiPatternType.SinglePointOfFailure;
    public string Condition { get; set; } = string.Empty; // Expresión semántica o código evaluador
    public int Penalty { get; set; } = 20;
    public FeedbackCategory Category { get; set; } = FeedbackCategory.Availability;
    public string Title { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
}
```

### 4.4. `HintDefinition.cs`
Modela cada pista pedagógica asociada al desafío (**RN-06 / RN-07 / Mecánicas 5**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class HintDefinition
{
    public int OrderIndex { get; set; }
    public string Text { get; set; } = string.Empty;
    public int PenaltyPoints { get; set; }
}
```

### 4.5. `ChallengeEvaluationRules.cs`
Objeto raíz que consolida todas las reglas de validación declarativa de un desafío (**`docs/07-data-model.md` Secc. 4.2**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class ChallengeEvaluationRules
{
    public List<string> RequiredServices { get; set; } = [];
    public List<string> ForbiddenServices { get; set; } = [];
    public Dictionary<string, int> MinInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, int> MaxInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<RequiredConnectionRule> RequiredConnections { get; set; } = [];
    public List<ForbiddenConnectionRule> ForbiddenConnections { get; set; } = [];
    public List<AntiPatternRule> AntiPatterns { get; set; } = [];
    public int PassingScoreThreshold { get; set; } = 70; // RN-02
}
```

---

## 5. Modelos de Resultado y Feedback Pedagógico (`AwsQuest.Domain.Engine.Models`)

### 5.1. `FeedbackItem.cs`
Representa un ítem individual de retroalimentación explicativa con su estado, categoría y penalización aplicada (**RF-15 / RN-08**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class FeedbackItem
{
    public FeedbackItemStatus Status { get; set; } = FeedbackItemStatus.Pass;
    public FeedbackCategory Category { get; set; } = FeedbackCategory.ServiceSelection;
    public string Title { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int PenaltyApplied { get; set; } = 0;
    public List<string> RelatedComponentIds { get; set; } = [];
}
```

### 5.2. `EvaluationFeedback.cs`
Agrupa la síntesis formativa y la lista detallada de aciertos y errores (**`08-api-spec.md` Secc. 4.4**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class EvaluationFeedback
{
    public string Summary { get; set; } = string.Empty;
    public List<FeedbackItem> Items { get; set; } = [];
}
```

### 5.3. `EvaluationResult.cs`
Resultado inmutable de la evaluación generada por el `EvaluationEngine` (**RN-02, RN-07, RN-08**).

```csharp
namespace AwsQuest.Domain.Engine.Models;

public class EvaluationResult
{
    public int Score { get; set; }
    public bool Passed => Score >= PassingThreshold;
    public int PassingThreshold { get; set; } = 70; // RN-02: Score >= 70
    public EvaluationFeedback Feedback { get; set; } = new();
    public int HintsUsed { get; set; }
    public int TotalHintPenalties { get; set; }
    public int TotalErrorPenalties { get; set; }
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

    public static EvaluationResult Create(
        int rawScore,
        int hintPenalties,
        int errorPenalties,
        EvaluationFeedback feedback,
        int hintsUsed,
        int passingThreshold = 70)
    {
        // RN-07 y RN-08: Score = max(0, 100 - errorPenalties - hintPenalties)
        var finalScore = Math.Clamp(100 - errorPenalties - hintPenalties, 0, 100);

        return new EvaluationResult
        {
            Score = finalScore,
            PassingThreshold = passingThreshold,
            Feedback = feedback,
            HintsUsed = hintsUsed,
            TotalHintPenalties = hintPenalties,
            TotalErrorPenalties = errorPenalties,
            EvaluatedAt = DateTime.UtcNow
        };
    }
}
```

---

## 6. Lógica de Puntuación y Gamificación en Dominio (`AwsQuest.Domain.Engine.Models`)

### 6.1. `GameScoringRules.cs` (Cálculo Puro en Memoria)
Implementa las fórmulas oficiales de gamificación (**RN-02, RN-09, RN-10 / Mecánicas 7 y 8**):

```csharp
namespace AwsQuest.Domain.Engine.Models;

public static class GameScoringRules
{
    public const int DefaultPassingThreshold = 70;
    public const int XpPerLevel = 150;

    /// <summary>
    /// Calcula la experiencia (XP) ganada sin re-farmeo (RN-10).
    /// XP = floor((NewScore - PreviousHighScore) * (BaseXP / 100))
    /// </summary>
    public static int CalculateEarnedXp(int newScore, int previousHighScore, int baseXP)
    {
        if (newScore <= previousHighScore || newScore < DefaultPassingThreshold)
        {
            return 0;
        }

        var scoreDelta = newScore - previousHighScore;
        var earnedXp = (int)Math.Floor(scoreDelta * (baseXP / 100.0));
        return Math.Max(0, earnedXp);
    }

    /// <summary>
    /// Calcula el nivel de usuario a partir del XP total acumulado:
    /// Nivel = 1 + floor(TotalXP / 150)
    /// </summary>
    public static int CalculateLevel(int totalXp)
    {
        if (totalXp <= 0) return 1;
        return 1 + (totalXp / XpPerLevel);
    }
}
```

---

## 7. Excepciones de Dominio (`AwsQuest.Domain.Exceptions`)

Las excepciones de dominio aseguran la integridad semántica y permiten que la capa de aplicación devuelva códigos de error HTTP precisos (**`08-api-spec.md` Secc. 3**).

### 7.1. `DomainException.cs`
Excepción base de la capa de dominio.
```csharp
namespace AwsQuest.Domain.Exceptions;

public abstract class DomainException(string message) : Exception(message);
```

### 7.2. `InvalidGraphException.cs`
Lanzada cuando el grafo posee identificadores duplicados, conexiones a nodos inexistentes o estructura corrupta.
```csharp
namespace AwsQuest.Domain.Exceptions;

public class InvalidGraphException(string message) : DomainException(message);
```

### 7.3. `ServiceLimitExceededException.cs`
Lanzada cuando la arquitectura excede el límite máximo de instancias permitidas para un servicio (**RN-04**).
```csharp
namespace AwsQuest.Domain.Exceptions;

public class ServiceLimitExceededException(string serviceCode, int maxInstances, int currentInstances)
    : DomainException($"El servicio '{serviceCode}' permite como máximo {maxInstances} instancia(s), pero se encontraron {currentInstances}.")
{
    public string ServiceCode { get; } = serviceCode;
    public int MaxInstances { get; } = maxInstances;
    public int CurrentInstances { get; } = currentInstances;
}
```

### 7.4. `InvalidEvaluationRuleException.cs`
Lanzada si las reglas declarativas JSON del desafío contienen sintaxis inválida o inconsistencias semánticas.
```csharp
namespace AwsQuest.Domain.Exceptions;

public class InvalidEvaluationRuleException(string message) : DomainException(message);
```

---

## 8. Serialización y Compatibilidad JSON (`System.Text.Json`)

Para asegurar interoperabilidad nativa entre las columnas `jsonb` de PostgreSQL, las reglas declarativas y los payloads REST del frontend:

1. **CamelCase Naming Policy:** Todos los modelos serializan sus propiedades en `camelCase` de forma consistente (`serviceCode`, `isMultiAz`, `fromComponentId`, `requiredServices`).
2. **String Enum Conversion:** Los enums se serializan como cadenas descriptivas (`"PASS"`, `"FAIL"`, `"HTTP_HTTPS"`, `"SINGLE_POINT_OF_FAILURE"`) mediante `JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseUpper)` o camelCase según corresponda.
3. **Manejo de Diccionarios Insensibles a Mayúsculas:** `MinInstances`, `MaxInstances` y `CustomProperties` usan `StringComparer.OrdinalIgnoreCase` para evitar fallos por diferencias de formato en códigos de servicio (`AWS_EC2` vs `aws_ec2`).

---

## 9. Matriz de Trazabilidad Técnica

Esta especificación cubre integralmente las reglas de negocio, requerimientos y casos de uso pertinentes:

| Requisito / Regla | Concepto en la Spec | Cobertura en Modelos |
| :--- | :--- | :--- |
| **RN-01 (Modo Libre / Progresivo)** | `AccessMode` enum | Tipificación estricta de política de acceso. |
| **RN-02 (Aprobación >= 70)** | `EvaluationResult.Passed` y `PassingThreshold` | Propiedad calculada `Score >= 70` con umbral configurable. |
| **RN-03 (Catálogo Permitido)** | `ChallengeEvaluationRules.Required/Forbidden` | Verificación de servicios requeridos, prohibidos y distractores. |
| **RN-04 (Límites de Instancias)** | `MaxInstances` y `ServiceLimitExceededException` | Invariante de instanciación con excepción dedicada. |
| **RN-05 (Conexiones Válidas)** | `RequiredConnectionRule`, `ForbiddenConnectionRule`, `ConnectionType` | Tipado de enlaces y reglas topológicas dirigidas. |
| **RN-06 / RN-07 (Pistas y Penalización)** | `HintDefinition`, `EvaluationResult.TotalHintPenalties` | Deducción transparente de penalizaciones acumuladas por pistas. |
| **RN-08 (Penalización Errores / Antipatrones)** | `AntiPatternRule`, `AntiPatternType`, `FeedbackItem` | Catálogo de antipatrones con penalización y categoría. |
| **RN-09 / RN-10 (High Score y XP Anti-Farmeo)** | `GameScoringRules.CalculateEarnedXp` | Fórmula pura en memoria para otorgar XP solo en nuevos récords. |
| **RF-13 / RF-21 (Grafo Semántico)** | `SemanticGraph`, `GraphComponent`, `GraphConnection` | Modelo agnóstico de UI para evaluación en memoria. |
| **RNF-02 (Evaluación < 2s)** | Consultas indexadas en `SemanticGraph` | Búsqueda O(1)/O(N) en memoria con `HashSet` y `LINQ` optimizado. |
| **RNF-08 (Contenido Declarativo)** | `ChallengeEvaluationRules`, `System.Text.Json` | Deserialización pura desde JSONB hacia POCOs de dominio. |

---

## 10. Guía de Implementación y Verificación

Cuando se autorice la ejecución de código para la Tarea 2.1:
1. Crear los archivos de enums en `apps/api/src/AwsQuest.Domain/Enums/`.
2. Crear los modelos de grafo y reglas en `apps/api/src/AwsQuest.Domain/Engine/Models/`.
3. Crear las excepciones en `apps/api/src/AwsQuest.Domain/Exceptions/`.
4. Crear la suite de pruebas unitarias en `apps/api/tests/AwsQuest.UnitTests/Engine/DomainModelsTests.cs` validando:
   * Serialización y deserialización bidireccional JSON $\leftrightarrow$ POCO.
   * Navegación y consultas del grafo (`SemanticGraph.HasConnectionBetweenServices`, `GetComponentCount`).
   * Fórmulas de gamificación en `GameScoringRules` (cálculo de XP incremental y niveles).
   * Lanzamiento de excepciones ante grafos o reglas inválidas.
