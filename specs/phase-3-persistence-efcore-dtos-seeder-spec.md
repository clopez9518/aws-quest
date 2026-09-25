# Especificación Técnica: Fase 3 — Persistencia, Migraciones EF Core, DTOs y Seeder de Catálogo

> **Documento de Especificación de Implementación**  
> **Fase:** 3 (Persistence, EF Core Migrations, DTOs & Declarative Seeder)  
> **Proyecto:** AWS Architecture Quest (`AwsQuest.Domain`, `AwsQuest.Infrastructure`, `AwsQuest.Application`, `AwsQuest.Api`)  
> **Documento de Referencia:** [`docs/14-aws-network-expansion-plan.md`](file:///c:/workspace/aws/aws-game/docs/14-aws-network-expansion-plan.md)  
> **Dependencias:** Fase 1 (`specs/phase-1-domain-models-network-expansion-spec.md`) y Fase 2 (`specs/phase-2-evaluation-engine-spec.md`) completadas  
> **Estado:** Listo para Implementación

---

## 1. Introducción y Objetivos de la Fase 3

La **Fase 3** traslada las definiciones de dominio y capacidades del motor topológico hacia la capa de persistencia (PostgreSQL + Entity Framework Core), los DTOs de transporte de la API, las validaciones de entrada en FluentValidation y el seeder declarativo del catálogo de servicios.

### 1.1 Objetivos Principales:
1. **Actualización de la Entidad de Dominio `AwsService`:**
   * Incorporar `Kind` (`ResourceKind`), `PlacementScope` (`PlacementScope`) y `DefaultConfigJson` (`string?`).
2. **Configuración EF Core y Migración de Base de Datos:**
   * Actualizar `AwsServiceConfiguration` con conversiones a `string`, valores por defecto e indexación.
   * Generar la migración idempotente `AddNetworkInfrastructureAndPlacementScope` para PostgreSQL.
3. **Actualización de DTOs y Mappings de Aplicación:**
   * Enriquecer `AwsServiceResponseDto`, `ChallengeAllowedServiceDto` y `ServiceSeedDto` con los nuevos metadatos.
   * Actualizar `MasterServicesMappingExtensions` y `CatalogMappingExtensions`.
4. **Validación de Jerarquía y Contención en Request DTOs:**
   * Extender `EvaluateArchitectureRequestDtoValidator` para asegurar que `ParentId` sea válido, no autoreferencial y sin ciclos de contención.
5. **Expansión del Catálogo Declarativo (`aws-services.json`):**
   * Configurar los **20 componentes estándar** (13 Servicios Gestionados y 7 Recursos de Infraestructura de Red) con sus metadatos, iconos y ámbitos de ubicación.
6. **Sincronización del Seeder (`ChallengeSeeder.cs`):**
   * Actualizar la lógica de lectura y sincronización upsert para persistir `Kind`, `PlacementScope` y `DefaultConfigJson`.
7. **Pruebas Automatizadas:**
   * Actualizar y expandir las suites de tests unitarios e integración en `AwsQuest.UnitTests` para validar el seeder, validadores y mapeos.

---

## 2. Mapa de Clases y Estructura de Archivos

```text
apps/api/src/
├── AwsQuest.Domain/
│   └── Entities/
│       └── AwsService.cs                                 [MODIFY] (Nuevas propiedades: Kind, PlacementScope, DefaultConfigJson)
│
├── AwsQuest.Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   │   └── AwsServiceConfiguration.cs                [MODIFY] (Mapeo EF Core con HasConversion<string>)
│   │   ├── Migrations/
│   │   │   ├── 20260921230000_AddNetworkInfrastructureAndPlacementScope.cs          [NEW]
│   │   │   ├── 20260921230000_AddNetworkInfrastructureAndPlacementScope.Designer.cs [NEW]
│   │   │   └── AppDbContextModelSnapshot.cs              [MODIFY] (Actualizar snapshot)
│   │   └── Seeding/
│   │       └── ChallengeSeeder.cs                        [MODIFY] (Persistir Kind, PlacementScope, DefaultConfigJson)
│
├── AwsQuest.Application/
│   ├── Common/
│   │   └── Models/
│   │       └── Seeding/
│   │           └── SeedingDtos.cs                        [MODIFY] (ServiceSeedDto enriquecido)
│   ├── Dtos/
│   │   ├── MasterServices/
│   │   │   └── MasterServicesDtos.cs                     [MODIFY] (AwsServiceResponseDto enriquecido)
│   │   └── Challenge/
│   │       └── ChallengeDtos.cs                          [MODIFY] (ChallengeAllowedServiceDto enriquecido)
│   ├── Mappings/
│   │   ├── MasterServicesMappingExtensions.cs            [MODIFY] (Mapeo de nuevos campos)
│   │   └── CatalogMappingExtensions.cs                   [MODIFY] (Mapeo de nuevos campos)
│   └── Validators/
│       └── EvaluateArchitectureRequestDtoValidator.cs    [MODIFY] (Validación de ParentId y grafos acíclicos)
│
content/
└── services/
    └── aws-services.json                                 [MODIFY] (Catálogo completo de 20 servicios e infraestructura)

apps/api/tests/AwsQuest.UnitTests/
├── Seeding/
│   └── ChallengeSeederTests.cs                           [MODIFY] (Aserción de 20 servicios y nuevas propiedades)
├── Services/
│   ├── MasterServicesServiceTests.cs                     [MODIFY] (Validación de DTOs con Kind y PlacementScope)
│   └── CatalogServiceTests.cs                            [MODIFY]
└── Validators/
    └── EvaluateArchitectureRequestDtoValidatorTests.cs   [MODIFY] (Nuevos tests de ParentId y ciclos de contención)
```

---

## 3. Especificación Detallada de Cambios

### 3.1 Entidad `AwsService` (`AwsQuest.Domain.Entities.AwsService`)

```csharp
namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class AwsService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Nuevas propiedades de Fase 3
    public ResourceKind Kind { get; set; } = ResourceKind.ManagedService;
    public PlacementScope PlacementScope { get; set; } = PlacementScope.RegionalGlobal;
    public string? DefaultConfigJson { get; set; }

    public ICollection<ChallengeService> ChallengeServices { get; set; } = new List<ChallengeService>();
}
```

---

### 3.2 Configuración EF Core (`AwsQuest.Infrastructure.Persistence.Configurations.AwsServiceConfiguration`)

```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class AwsServiceConfiguration : IEntityTypeConfiguration<AwsService>
{
    public void Configure(EntityTypeBuilder<AwsService> builder)
    {
        builder.ToTable("aws_services");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).HasMaxLength(50).IsRequired();
        builder.HasIndex(e => e.Code).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(50).IsRequired();
        builder.Property(e => e.ShortDescription).HasMaxLength(300).IsRequired();
        builder.Property(e => e.IconUrl).HasMaxLength(255).IsRequired();
        builder.Property(e => e.IsActive).HasDefaultValue(true).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();

        // Mapeo de Enums y JSONB
        builder.Property(e => e.Kind)
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(ResourceKind.ManagedService)
            .IsRequired();

        builder.Property(e => e.PlacementScope)
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(PlacementScope.RegionalGlobal)
            .IsRequired();

        builder.Property(e => e.DefaultConfigJson)
            .HasColumnName("default_config_json")
            .HasColumnType("jsonb")
            .IsRequired(false);
    }
}
```

---

### 3.3 DTOs y Mappings de Aplicación

#### `MasterServicesDtos.cs`:
```csharp
public class AwsServiceResponseDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public ResourceKind Kind { get; init; }
    public PlacementScope PlacementScope { get; init; }
    public string? DefaultConfigJson { get; init; }
}
```

#### `ChallengeDtos.cs`:
```csharp
public class ChallengeAllowedServiceDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public int? MaxInstances { get; init; }
    public bool IsDistractor { get; init; }
    public ResourceKind Kind { get; init; }
    public PlacementScope PlacementScope { get; init; }
}
```

#### `SeedingDtos.cs`:
```csharp
public class ServiceSeedDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public ResourceKind Kind { get; set; } = ResourceKind.ManagedService;
    public PlacementScope PlacementScope { get; set; } = PlacementScope.RegionalGlobal;
    public string? DefaultConfigJson { get; set; }
}
```

---

### 3.4 Validaciones en `EvaluateArchitectureRequestDtoValidator`

El validador de `EvaluateArchitectureRequestDto` debe validar la integridad del árbol de contención:
1. **Existencia de Padre:** Si un componente tiene `ParentId != null`, el padre debe existir en `Graph.Components`.
2. **No Autoreferencia:** Un componente no puede tener `ParentId == Id`.
3. **Ausencia de Ciclos Jerárquicos:** Un componente no puede ser ancestro de sí mismo (recorrido sin bucles infinitos).

```csharp
RuleFor(x => x.Graph)
    .Must(HaveValidHierarchy)
    .WithMessage("La jerarquía de contención (VPC / Subred) contiene referencias inválidas o ciclos circulares.");
```

---

### 3.5 Catálogo Completo `content/services/aws-services.json` (20 Recursos)

```json
[
  // ─── COMPUTE ───
  {
    "code": "AWS_EC2",
    "name": "Amazon EC2",
    "category": "Compute",
    "kind": "ManagedService",
    "placementScope": "SubnetRequired",
    "shortDescription": "Instancias de cómputo virtual escalables y seguras en la nube.",
    "iconUrl": "/icons/aws/ec2.svg",
    "isActive": true
  },
  {
    "code": "AWS_LAMBDA",
    "name": "AWS Lambda",
    "category": "Compute",
    "kind": "ManagedService",
    "placementScope": "VpcOptional",
    "shortDescription": "Cómputo serverless basado en eventos sin aprovisionar servidores.",
    "iconUrl": "/icons/aws/lambda.svg",
    "isActive": true
  },

  // ─── DATABASE ───
  {
    "code": "AWS_RDS",
    "name": "Amazon RDS",
    "category": "Database",
    "kind": "ManagedService",
    "placementScope": "SubnetRequired",
    "shortDescription": "Servicio administrado de base de datos relacional con soporte Multi-AZ.",
    "iconUrl": "/icons/aws/rds.svg",
    "isActive": true
  },
  {
    "code": "AWS_DYNAMODB",
    "name": "Amazon DynamoDB",
    "category": "Database",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Base de datos NoSQL de clave-valor totalmente administrada y de alto rendimiento.",
    "iconUrl": "/icons/aws/dynamodb.svg",
    "isActive": true
  },
  {
    "code": "AWS_ELASTICACHE",
    "name": "Amazon ElastiCache",
    "category": "Database",
    "kind": "ManagedService",
    "placementScope": "SubnetRequired",
    "shortDescription": "Almacenamiento en caché en memoria totalmente administrado (Redis / Memcached).",
    "iconUrl": "/icons/aws/elasticache.svg",
    "isActive": true
  },

  // ─── STORAGE ───
  {
    "code": "AWS_S3",
    "name": "Amazon S3",
    "category": "Storage",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Almacenamiento de objetos altamente escalable, duradero y seguro.",
    "iconUrl": "/icons/aws/s3.svg",
    "isActive": true
  },

  // ─── NETWORKING MANAGED ───
  {
    "code": "AWS_ALB",
    "name": "Application Load Balancer",
    "category": "Networking",
    "kind": "ManagedService",
    "placementScope": "SubnetRequired",
    "shortDescription": "Distribución elástica de tráfico HTTP/HTTPS a nivel de capa de aplicación (L7).",
    "iconUrl": "/icons/aws/alb.svg",
    "isActive": true
  },
  {
    "code": "AWS_APIGATEWAY",
    "name": "Amazon API Gateway",
    "category": "Networking",
    "kind": "ManagedService",
    "placementScope": "VpcOptional",
    "shortDescription": "Servicio administrado para crear, publicar y proteger APIs REST y WebSocket.",
    "iconUrl": "/icons/aws/apigateway.svg",
    "isActive": true
  },
  {
    "code": "AWS_ROUTE53",
    "name": "Amazon Route 53",
    "category": "Networking",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Servicio DNS web escalable y de alta disponibilidad.",
    "iconUrl": "/icons/aws/route53.svg",
    "isActive": true
  },

  // ─── CDN / EDGE ───
  {
    "code": "AWS_CLOUDFRONT",
    "name": "Amazon CloudFront",
    "category": "CdnEdge",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Red de entrega de contenido (CDN) global de baja latencia.",
    "iconUrl": "/icons/aws/cloudfront.svg",
    "isActive": true
  },

  // ─── MESSAGING / INTEGRATION ───
  {
    "code": "AWS_SQS",
    "name": "Amazon SQS",
    "category": "MessagingIntegration",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Colas de mensajes completamente administradas para desacoplar microservicios.",
    "iconUrl": "/icons/aws/sqs.svg",
    "isActive": true
  },
  {
    "code": "AWS_SNS",
    "name": "Amazon SNS",
    "category": "MessagingIntegration",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Servicio de mensajería pub/sub de alta disponibilidad.",
    "iconUrl": "/icons/aws/sns.svg",
    "isActive": true
  },
  {
    "code": "AWS_EVENTBRIDGE",
    "name": "Amazon EventBridge",
    "category": "MessagingIntegration",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Bus de eventos serverless para arquitecturas dirigidas por eventos.",
    "iconUrl": "/icons/aws/eventbridge.svg",
    "isActive": true
  },

  // ─── SECURITY ───
  {
    "code": "AWS_IAM",
    "name": "AWS IAM",
    "category": "Security",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Administración segura de identidades y accesos a recursos de AWS.",
    "iconUrl": "/icons/aws/iam.svg",
    "isActive": true
  },
  {
    "code": "AWS_WAF",
    "name": "AWS WAF",
    "category": "Security",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Firewall de aplicaciones web para proteger contra exploits comunes.",
    "iconUrl": "/icons/aws/waf.svg",
    "isActive": true
  },
  {
    "code": "AWS_KMS",
    "name": "AWS KMS",
    "category": "Security",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Administración de claves criptográficas y cifrado de datos.",
    "iconUrl": "/icons/aws/kms.svg",
    "isActive": true
  },

  // ─── MONITORING ───
  {
    "code": "AWS_CLOUDWATCH",
    "name": "Amazon CloudWatch",
    "category": "Monitoring",
    "kind": "ManagedService",
    "placementScope": "RegionalGlobal",
    "shortDescription": "Monitoreo y observabilidad de recursos y aplicaciones de AWS.",
    "iconUrl": "/icons/aws/cloudwatch.svg",
    "isActive": true
  },

  // ─── NETWORK INFRASTRUCTURE ───
  {
    "code": "NET_VPC",
    "name": "Virtual Private Cloud (VPC)",
    "category": "NetworkVpc",
    "kind": "NetworkInfrastructure",
    "placementScope": "VpcRoot",
    "shortDescription": "Red virtual lógicamente aislada para aprovisionar recursos en AWS.",
    "iconUrl": "/icons/aws/vpc.svg",
    "isActive": true
  },
  {
    "code": "NET_SUBNET",
    "name": "Subnet",
    "category": "NetworkVpc",
    "kind": "NetworkInfrastructure",
    "placementScope": "VpcAttached",
    "shortDescription": "Rango de direcciones IP dentro de una VPC para segmentar cargas de trabajo.",
    "iconUrl": "/icons/aws/subnet.svg",
    "isActive": true
  },
  {
    "code": "NET_IGW",
    "name": "Internet Gateway",
    "category": "NetworkVpc",
    "kind": "NetworkInfrastructure",
    "placementScope": "VpcAttached",
    "shortDescription": "Puerta de enlace escalable que permite comunicación entre VPC e Internet.",
    "iconUrl": "/icons/aws/igw.svg",
    "isActive": true
  },
  {
    "code": "NET_NAT_GATEWAY",
    "name": "NAT Gateway",
    "category": "NetworkVpc",
    "kind": "NetworkInfrastructure",
    "placementScope": "SubnetRequired",
    "shortDescription": "Permite salida a Internet para instancias privadas sin exponerlas a tráfico entrante.",
    "iconUrl": "/icons/aws/natgw.svg",
    "isActive": true
  },
  {
    "code": "NET_ROUTE_TABLE",
    "name": "Route Table",
    "category": "NetworkVpc",
    "kind": "NetworkInfrastructure",
    "placementScope": "VpcAttached",
    "shortDescription": "Conjunto de reglas que determinan hacia dónde se dirige el tráfico de red de subredes.",
    "iconUrl": "/icons/aws/routetable.svg",
    "isActive": true
  },
  {
    "code": "NET_SECURITY_GROUP",
    "name": "Security Group",
    "category": "Security",
    "kind": "SecurityPolicy",
    "placementScope": "VpcAttached",
    "shortDescription": "Firewall virtual que controla el tráfico entrante y saliente a nivel de instancia.",
    "iconUrl": "/icons/aws/securitygroup.svg",
    "isActive": true
  },
  {
    "code": "NET_NACL",
    "name": "Network ACL",
    "category": "Security",
    "kind": "SecurityPolicy",
    "placementScope": "VpcAttached",
    "shortDescription": "Capa opcional de seguridad que actúa como firewall a nivel de subred.",
    "iconUrl": "/icons/aws/nacl.svg",
    "isActive": true
  }
]
```

---

## 4. Plan de Verificación y Pruebas Automatizadas

1. **`ChallengeSeederTests.cs`**:
   * Verificar que el seeder inserta/actualiza correctamente los 20 componentes.
   * Verificar que los campos `Kind`, `PlacementScope` y `Category` se persisten con sus valores correctos.
2. **`EvaluateArchitectureRequestDtoValidatorTests.cs`**:
   * Grafo con `ParentId` inexistente $\rightarrow$ Validación Falla.
   * Grafo con autoreferencia `ParentId == Id` $\rightarrow$ Validación Falla.
   * Grafo con ciclo circular `A.Parent = B; B.Parent = A` $\rightarrow$ Validación Falla.
   * Grafo con jerarquía válida `EC2.Parent = Subnet; Subnet.Parent = VPC` $\rightarrow$ Validación Pasa.
3. **`MasterServicesServiceTests.cs` & `CatalogServiceTests.cs`**:
   * Verificar que los endpoints retornan los DTOs enriquecidos con `Kind` y `PlacementScope`.
4. **Ejecución de Suite Completa**:
   * `dotnet build apps/api/src/AwsQuest.Domain/AwsQuest.Domain.csproj`
   * `dotnet build apps/api/src/AwsQuest.Application/AwsQuest.Application.csproj`
   * `dotnet build apps/api/src/AwsQuest.Infrastructure/AwsQuest.Infrastructure.csproj`
   * `dotnet test apps/api/tests/AwsQuest.UnitTests/AwsQuest.UnitTests.csproj /p:BuildProjectReferences=false`
