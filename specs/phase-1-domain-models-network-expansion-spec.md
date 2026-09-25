# Especificación Técnica: Fase 1 — Modelo de Dominio, Enums y Reglas Declarativas de Red

> **Documento de Especificación de Implementación**  
> **Fase:** 1 (Domain Models, Enums & Declarative Network Rules)  
> **Proyecto:** AWS Architecture Quest (`AwsQuest.Domain`)  
> **Documento de Referencia:** [`docs/14-aws-network-expansion-plan.md`](file:///c:/workspace/aws/aws-game/docs/14-aws-network-expansion-plan.md)  
> **Estado:** Listo para Implementación

---

## 1. Introducción y Objetivos de la Fase 1

La **Fase 1** establece los cimientos del modelo de dominio para la expansión de servicios AWS e infraestructura de red dentro del proyecto `AwsQuest.Domain`.

### 1.1 Objetivos Principales:
1. **Tipificación Discreta y Clasificación Polimórfica:**
   * Definir los enums `ResourceKind`, `ResourceCategory`, `PlacementScope`, `SubnetTier` y `RuleDirection`.
   * Ampliar `FeedbackCategory` para contemplar auditorías de colocación (`Placement`), topología de red (`NetworkTopology`) y grupos de seguridad (`SecurityGroup`).
2. **Jerarquía y Contención en el Grafo Semántico:**
   * Incorporar la propiedad `ParentId` en `GraphComponent` para modelar contención física/visual (`Subnet ∈ VPC`, `EC2/RDS/ALB ∈ Subnet`) de forma desacoplada de las coordenadas de UI.
3. **Estructuras de Configuración de Red y Seguridad (`ComponentConfig`):**
   * Ampliar `ComponentConfig` con campos tipados para bloques CIDR, tier de subred, listas de Security Groups asociados (`SecurityGroupIds`), tabla de ruteo asociada (`RouteTableId`), reglas de firewall (`SecurityGroupRules`) y entradas de enrutamiento (`Routes`).
4. **Modelos de Reglas Declarativas para Desafíos:**
   * Implementar `PlacementRule`, `RoutingRule`, `SecurityGroupRuleModel`, `SecurityGroupRule` y `RouteEntry`.
   * Extender `ChallengeEvaluationRules` con colecciones opcionales (`PlacementRules`, `RoutingRules`, `SecurityGroupRules`) garantizando 100% de compatibilidad hacia atrás con los 8 desafíos MVP existentes.
5. **Capacidades de Consulta Topológica en `SemanticGraph`:**
   * Dotar a `SemanticGraph` de métodos de consulta de alto nivel (`GetParent`, `GetChildren`, `GetComponentSubnet`, `GetComponentVpc`, `IsLocatedInPublicSubnet`, `IsLocatedInPrivateSubnet`, `HasRouteToInternet`, `HasOutboundRouteViaNat`, `GetAttachedSecurityGroups`).
6. **Verificación Automatizada con Pruebas Unitarias:**
   * Crear y validar la suite de pruebas unitarias en `tests/AwsQuest.UnitTests`.

---

## 2. Mapa de Tipos y Estructura de Carpetas

```text
apps/api/src/AwsQuest.Domain/
├── Enums/
│   ├── ResourceKind.cs               [NEW]
│   ├── ResourceCategory.cs           [NEW]
│   ├── PlacementScope.cs             [NEW]
│   ├── SubnetTier.cs                 [NEW]
│   ├── RuleDirection.cs              [NEW]
│   └── FeedbackCategory.cs           [MODIFY] (Agregar Placement, NetworkTopology, SecurityGroup)
└── Engine/
    └── Models/
        ├── RouteEntry.cs             [NEW]
        ├── SecurityGroupRule.cs      [NEW]
        ├── PlacementRule.cs          [NEW]
        ├── RoutingRule.cs            [NEW]
        ├── SecurityGroupRuleModel.cs [NEW]
        ├── ComponentConfig.cs        [MODIFY]
        ├── GraphComponent.cs         [MODIFY]
        ├── SemanticGraph.cs          [MODIFY]
        └── ChallengeEvaluationRules.cs [MODIFY]
```

---

## 3. Especificación Detallada de Enums (`AwsQuest.Domain.Enums`)

### 3.1 `ResourceKind.cs`
Diferencia el tipo estructural de recurso en el ecosistema AWS.
```csharp
namespace AwsQuest.Domain.Enums;

public enum ResourceKind
{
    ManagedService = 1,       // Servicios gestionados (EC2, RDS, S3, DynamoDB, Lambda, ALB, etc.)
    NetworkInfrastructure = 2, // Recursos de red (VPC, Subnet, IGW, NAT GW, Route Table)
    SecurityPolicy = 3         // Políticas de seguridad y firewalls (Security Group, NACL)
}
```

### 3.2 `ResourceCategory.cs`
Categorización taxonómica para la paleta de componentes y feedback educativo.
```csharp
namespace AwsQuest.Domain.Enums;

public enum ResourceCategory
{
    Compute = 1,              // EC2, Lambda, ECS, EKS
    Database = 2,             // RDS, DynamoDB, ElastiCache
    Storage = 3,              // S3, EFS
    Networking = 4,           // ALB, API Gateway, Route 53
    CdnEdge = 5,              // CloudFront
    MessagingIntegration = 6, // SQS, SNS, EventBridge
    Security = 7,             // IAM, WAF, KMS, Security Group, NACL
    Monitoring = 8,           // CloudWatch
    NetworkVpc = 9            // VPC, Subnet, IGW, NAT Gateway, Route Table
}
```

### 3.3 `PlacementScope.cs`
Define la capacidad y restricción de despliegue de un recurso.
```csharp
namespace AwsQuest.Domain.Enums;

public enum PlacementScope
{
    RegionalGlobal = 1,   // Serverless o Global: No reside dentro de una VPC (S3, DynamoDB, CloudFront, etc.)
    SubnetRequired = 2,   // Requiere estar ubicado obligatoriamente dentro de una Subnet (EC2, RDS, ALB, NAT GW)
    VpcOptional = 3,      // Puede ejecutarse Serverless o integrarse a una Subnet (Lambda, API Gateway)
    VpcRoot = 4,          // Contenedor raíz de red (VPC)
    VpcAttached = 5       // Vinculado directamente a la VPC (Subnet, IGW, Route Table, Security Group, NACL)
}
```

### 3.4 `SubnetTier.cs`
Clasifica el nivel de aislamiento y enrutamiento de una subred `NET_SUBNET`.
```csharp
namespace AwsQuest.Domain.Enums;

public enum SubnetTier
{
    Public = 1,   // Asociada a tabla de ruteo con destino hacia Internet Gateway
    Private = 2,  // Sin ruta directa a IGW; puede usar NAT Gateway para tráfico saliente
    Isolated = 3  // Sin salida a Internet ni NAT Gateway (aislamiento total para bases de datos)
}
```

### 3.5 `RuleDirection.cs`
Dirección del flujo de tráfico para reglas de Security Group.
```csharp
namespace AwsQuest.Domain.Enums;

public enum RuleDirection
{
    Ingress = 1,  // Tráfico entrante
    Egress = 2    // Tráfico saliente
}
```

### 3.6 `FeedbackCategory.cs` (Ampliación)
Se incorporan nuevas categorías de feedback pedagógico:
```csharp
namespace AwsQuest.Domain.Enums;

public enum FeedbackCategory
{
    General = 0,
    ServiceSelection = 1,
    Connection = 2,
    Availability = 3,
    Security = 4,
    CostOptimization = 5,
    Performance = 6,
    HintPenalty = 7,
    ArchitecturePattern = 8,
    Placement = 9,          // [NEW] Validaciones de contención (Subnet, VPC)
    NetworkTopology = 10,   // [NEW] Validaciones de enrutamiento e Internet Gateway
    SecurityGroup = 11      // [NEW] Validaciones de firewalls y reglas de puertos
}
```

---

## 4. Especificación de Modelos de Reglas y Configuración (`AwsQuest.Domain.Engine.Models`)

### 4.1 `RouteEntry.cs`
Entrada de enrutamiento dentro de una tabla de ruteo (`NET_ROUTE_TABLE`).
```csharp
namespace AwsQuest.Domain.Engine.Models;

public class RouteEntry
{
    public string DestinationCidr { get; set; } = "0.0.0.0/0";
    public string TargetId { get; set; } = string.Empty; // ID del Gateway (ej. igw-1, nat-1) o "local"
    public string? Description { get; set; }

    public override string ToString() => $"{DestinationCidr} -> {TargetId}";
}
```

### 4.2 `SecurityGroupRule.cs`
Regla granular de control de tráfico en un `NET_SECURITY_GROUP`.
```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class SecurityGroupRule
{
    public RuleDirection Direction { get; set; } = RuleDirection.Ingress;
    public string Protocol { get; set; } = "TCP"; // "TCP", "UDP", "ICMP", "ALL"
    public int? FromPort { get; set; }            // ej. 80, 443, 5432
    public int? ToPort { get; set; }              // ej. 80, 443, 5432
    public string Source { get; set; } = string.Empty; // "0.0.0.0/0", ID/Code de SG (ej. "sg-web", "AWS_EC2")
    public string? Description { get; set; }

    public bool MatchesPort(int port)
    {
        if (string.Equals(Protocol, "ALL", StringComparison.OrdinalIgnoreCase)) return true;
        var from = FromPort ?? 0;
        var to = ToPort ?? FromPort ?? 65535;
        return port >= from && port <= to;
    }
}
```

### 4.3 `PlacementRule.cs`
Regla declarativa para exigir que un servicio resida en un tipo específico de contenedor.
```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class PlacementRule
{
    public string ServiceCode { get; set; } = string.Empty;           // ej. "AWS_RDS", "AWS_EC2"
    public string RequiredContainerCode { get; set; } = "NET_SUBNET"; // ej. "NET_SUBNET", "NET_VPC"
    public SubnetTier? RequiredSubnetTier { get; set; }                // ej. SubnetTier.Private
    public int PenaltyIfViolated { get; set; } = 25;
    public string? Description { get; set; }
}
```

### 4.4 `RoutingRule.cs`
Regla declarativa para validar que las subredes posean las rutas adecuadas.
```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class RoutingRule
{
    public SubnetTier SubnetTier { get; set; } = SubnetTier.Public;
    public string? RequiresRouteTo { get; set; }      // ej. "NET_IGW" o "NET_NAT_GATEWAY"
    public string? ForbiddenRouteTo { get; set; }     // ej. "NET_IGW" (para subredes privadas)
    public int PenaltyIfMissing { get; set; } = 20;
    public string? Description { get; set; }
}
```

### 4.5 `SecurityGroupRuleModel.cs`
Regla declarativa de evaluación para verificar aislamiento entre componentes.
```csharp
namespace AwsQuest.Domain.Engine.Models;

public class SecurityGroupRuleModel
{
    public string TargetServiceCode { get; set; } = string.Empty;       // ej. "AWS_RDS"
    public string AllowedSourceServiceCode { get; set; } = string.Empty; // ej. "AWS_EC2"
    public string Protocol { get; set; } = "TCP";                       // "TCP"
    public int Port { get; set; } = 5432;                               // ej. 5432, 3306, 80
    public bool ProhibitPublicAccess { get; set; } = true;              // No permitir 0.0.0.0/0
    public int PenaltyIfViolated { get; set; } = 20;
    public string? Description { get; set; }
}
```

### 4.6 `ComponentConfig.cs` (Actualizado)
```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class ComponentConfig
{
    // Propiedades Legadas (Preservadas para 100% de compatibilidad)
    public bool? IsMultiAz { get; set; }
    public bool? AutoScaling { get; set; }
    public int? InstanceCount { get; set; }
    public bool? IsPublic { get; set; }
    public string? SubnetType { get; set; } // Legado ("Public", "Private")
    public string? StorageClass { get; set; }

    // Nuevas Propiedades de Infraestructura de Red
    public SubnetTier? SubnetTier { get; set; }
    public string? CidrBlock { get; set; } // ej. "10.0.0.0/16", "10.0.1.0/24"
    public string? RouteTableId { get; set; }
    public string? AttachedVpcId { get; set; }
    public List<string> SecurityGroupIds { get; set; } = [];
    public List<RouteEntry> Routes { get; set; } = [];
    public List<SecurityGroupRule> SecurityGroupRules { get; set; } = [];

    public Dictionary<string, object> CustomProperties { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
```

### 4.7 `GraphComponent.cs` (Actualizado)
```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class GraphComponent
{
    public string Id { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty;
    public string? Label { get; set; }
    public string? ParentId { get; set; } // Contención jerárquica (Subnet -> VPC, EC2 -> Subnet)
    public ResourceKind? Kind { get; set; }
    public ResourceCategory? Category { get; set; }
    public ComponentConfig Config { get; set; } = new();

    public override string ToString() => $"{ServiceCode} ({Id}) [Parent: {ParentId ?? "none"}]";
}
```

### 4.8 `ChallengeEvaluationRules.cs` (Actualizado)
```csharp
namespace AwsQuest.Domain.Engine.Models;

public class ChallengeEvaluationRules
{
    // Reglas Existentes (Compatibilidad total)
    public List<string> RequiredServices { get; set; } = [];
    public List<string> ForbiddenServices { get; set; } = [];
    public Dictionary<string, int> MinInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public Dictionary<string, int> MaxInstances { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<RequiredConnectionRule> RequiredConnections { get; set; } = [];
    public List<ForbiddenConnectionRule> ForbiddenConnections { get; set; } = [];
    public List<AntiPatternRule> AntiPatterns { get; set; } = [];
    public int PassingScoreThreshold { get; set; } = 70;

    // Nuevas Reglas de Infraestructura y Topología
    public List<PlacementRule> PlacementRules { get; set; } = [];
    public List<RoutingRule> RoutingRules { get; set; } = [];
    public List<SecurityGroupRuleModel> SecurityGroupRules { get; set; } = [];
}
```

---

## 5. Especificación de Métodos Topológicos en `SemanticGraph.cs`

`SemanticGraph.cs` debe incluir métodos de consulta robustos y no nulos:

```csharp
namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class SemanticGraph
{
    public List<GraphComponent> Components { get; set; } = [];
    public List<GraphConnection> Connections { get; set; } = [];

    // ─── Consultas Básicas Existentes ───
    public GraphComponent? GetComponentById(string id) =>
        Components.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphComponent> GetComponentsByServiceCode(string serviceCode) =>
        Components.Where(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public int GetComponentCount(string serviceCode) =>
        Components.Count(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public int GetEffectiveInstanceCount(string serviceCode)
    {
        var matching = GetComponentsByServiceCode(serviceCode).ToList();
        if (matching.Count == 0) return 0;
        return matching.Sum(c => Math.Max(1, c.Config.InstanceCount ?? 1));
    }

    public IEnumerable<GraphConnection> GetOutboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.FromComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphConnection> GetInboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.ToComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public bool HasConnectionBetweenServices(string fromServiceCode, string toServiceCode)
    {
        var fromIds = GetComponentsByServiceCode(fromServiceCode)
            .Select(c => c.Id)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toIds = GetComponentsByServiceCode(toServiceCode)
            .Select(c => c.Id)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return Connections.Any(conn => fromIds.Contains(conn.FromComponentId) && toIds.Contains(conn.ToComponentId));
    }

    public bool IsEmpty => Components.Count == 0;

    // ─── Nuevas Consultas Topológicas de Contención ───
    public GraphComponent? GetParent(string componentId)
    {
        var comp = GetComponentById(componentId);
        if (comp == null || string.IsNullOrWhiteSpace(comp.ParentId)) return null;
        return GetComponentById(comp.ParentId);
    }

    public IEnumerable<GraphComponent> GetChildren(string containerId) =>
        Components.Where(c => string.Equals(c.ParentId, containerId, StringComparison.OrdinalIgnoreCase));

    public GraphComponent? GetComponentSubnet(string componentId)
    {
        var parent = GetParent(componentId);
        if (parent == null) return null;
        if (string.Equals(parent.ServiceCode, "NET_SUBNET", StringComparison.OrdinalIgnoreCase))
            return parent;
        return null;
    }

    public GraphComponent? GetComponentVpc(string componentId)
    {
        var current = GetComponentById(componentId);
        while (current != null && !string.IsNullOrWhiteSpace(current.ParentId))
        {
            var parent = GetComponentById(current.ParentId);
            if (parent == null) break;
            if (string.Equals(parent.ServiceCode, "NET_VPC", StringComparison.OrdinalIgnoreCase))
                return parent;
            current = parent;
        }
        return null;
    }

    public bool IsLocatedInPublicSubnet(string componentId)
    {
        var subnet = GetComponentSubnet(componentId);
        if (subnet == null) return false;
        if (subnet.Config.SubnetTier == SubnetTier.Public) return true;
        if (string.Equals(subnet.Config.SubnetType, "Public", StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    public bool IsLocatedInPrivateSubnet(string componentId)
    {
        var subnet = GetComponentSubnet(componentId);
        if (subnet == null) return false;
        if (subnet.Config.SubnetTier == SubnetTier.Private || subnet.Config.SubnetTier == SubnetTier.Isolated) return true;
        if (string.Equals(subnet.Config.SubnetType, "Private", StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    // ─── Consultas de Ruteo y Accesibilidad ───
    public bool HasRouteToGateway(string subnetId, string gatewayServiceCode)
    {
        var subnet = GetComponentById(subnetId);
        if (subnet == null) return false;

        // 1. Revisar si la subred apunta a una RouteTable explícita
        if (!string.IsNullOrWhiteSpace(subnet.Config.RouteTableId))
        {
            var routeTable = GetComponentById(subnet.Config.RouteTableId);
            if (routeTable != null)
            {
                var targetIds = routeTable.Config.Routes.Select(r => r.TargetId).ToHashSet(StringComparer.OrdinalIgnoreCase);
                var gatewayComponents = GetComponentsByServiceCode(gatewayServiceCode);
                if (gatewayComponents.Any(gw => targetIds.Contains(gw.Id)))
                {
                    return true;
                }
            }
        }

        // 2. Revisar si hay conexión dirigida directa o implícita en la configuración de rutas
        var gwIds = GetComponentsByServiceCode(gatewayServiceCode).Select(g => g.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (subnet.Config.Routes.Any(r => gwIds.Contains(r.TargetId)))
        {
            return true;
        }

        // 3. Revisar si hay una arista de conexión hacia el Gateway
        return Connections.Any(c => string.Equals(c.FromComponentId, subnetId, StringComparison.OrdinalIgnoreCase) && gwIds.Contains(c.ToComponentId));
    }

    public bool HasRouteToInternet(string subnetId) => HasRouteToGateway(subnetId, "NET_IGW");

    public bool HasOutboundRouteViaNat(string subnetId) => HasRouteToGateway(subnetId, "NET_NAT_GATEWAY");

    // ─── Consultas de Security Groups ───
    public IEnumerable<GraphComponent> GetAttachedSecurityGroups(string componentId)
    {
        var comp = GetComponentById(componentId);
        if (comp == null || comp.Config.SecurityGroupIds.Count == 0) return [];

        var sgIds = comp.Config.SecurityGroupIds.ToHashSet(StringComparer.OrdinalIgnoreCase);
        return Components.Where(c => string.Equals(c.ServiceCode, "NET_SECURITY_GROUP", StringComparison.OrdinalIgnoreCase) && sgIds.Contains(c.Id));
    }
}
```

---

## 6. Plan de Pruebas Unitarias de Fase 1 (`AwsQuest.UnitTests`)

Se creará una suite de pruebas unitarias dedicada para verificar la integridad de los nuevos modelos y consultas topológicas:

### 6.1 `tests/AwsQuest.UnitTests/Engine/DomainModelsTests.cs` (Ampliación)
* Verificar serialización y deserialización JSON sin pérdida de datos para:
  * `PlacementRule`
  * `RoutingRule`
  * `SecurityGroupRuleModel`
  * `ComponentConfig` con `SubnetTier`, `CidrBlock`, `SecurityGroupRules`, `Routes`.
* Verificar valores por defecto de `ChallengeEvaluationRules` (listas no nulas).

### 6.2 `tests/AwsQuest.UnitTests/Engine/TopologicalGraphQueriesTests.cs` [NEW]
* **`GetParent_WhenComponentHasParent_ReturnsCorrectContainer`**:
  * Dado un `GraphComponent` EC2 con `ParentId = "sub-1"` y una Subnet con `Id = "sub-1"`.
  * `graph.GetParent("ec2-1")` retorna el objeto de la Subnet.
* **`GetComponentVpc_WhenNestedInSubnet_ResolvesRootVpc`**:
  * Dado `EC2 -> Subnet -> VPC`.
  * `graph.GetComponentVpc("ec2-1")` retorna el componente VPC.
* **`IsLocatedInPublicSubnet_WhenTierIsPublic_ReturnsTrue`**:
  * Dado `EC2` en Subnet con `SubnetTier.Public`.
  * `graph.IsLocatedInPublicSubnet("ec2-1")` retorna `true`.
* **`HasRouteToInternet_WhenRouteTableContainsIgw_ReturnsTrue`**:
  * Dada una Subnet con `RouteTableId = "rt-1"` y `rt-1` ruteando a `igw-1`.
  * `graph.HasRouteToInternet("sub-1")` retorna `true`.
* **`GetAttachedSecurityGroups_ReturnsMatchingSecurityGroupComponents`**:
  * Dado `EC2` con `SecurityGroupIds = ["sg-web"]` y un componente `NET_SECURITY_GROUP` con `Id = "sg-web"`.
  * `graph.GetAttachedSecurityGroups("ec2-1")` retorna la lista con `sg-web`.

---

## 7. Criterios de Aceptación de la Fase 1

- [ ] Todos los nuevos enums (`ResourceKind`, `ResourceCategory`, `PlacementScope`, `SubnetTier`, `RuleDirection`) y los valores extendidos de `FeedbackCategory` están definidos y compilan con `net10.0`.
- [ ] `ComponentConfig.cs` y `GraphComponent.cs` incluyen soporte para `ParentId`, `SubnetTier`, `SecurityGroupIds`, `RouteTableId`, `SecurityGroupRules` y `Routes`.
- [ ] `ChallengeEvaluationRules.cs` contiene las listas `PlacementRules`, `RoutingRules` y `SecurityGroupRules` inicializadas en `[]` por defecto.
- [ ] `SemanticGraph.cs` implementa y expone los métodos topológicos de contención, ruteo y grupos de seguridad.
- [ ] Todos los tests unitarios existentes en `AwsQuest.UnitTests` y tests nuevos en `TopologicalGraphQueriesTests.cs` pasan con 100% de éxito.
- [ ] No existen referencias a clases o enums obsoletos como `NET_SUBNET_PUBLIC` o `NET_SUBNET_PRIVATE`.
