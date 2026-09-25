# Especificación Técnica: Contenido Declarativo y Seeder (Fase 2 - Hito 2.4)

## 1. Introducción y Objetivos

Esta especificación técnica define el diseño, estructura de archivos, contratos, interfaces y estrategia de inicialización e idempotencia para el **Contenido Declarativo y Seeder de Datos (`content/challenges/` & `ChallengeSeeder`)**, correspondiente a la **Tarea 2.4** de la **Fase 2** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

### Objetivos Clave:
1. **Contenido como Código (GitOps):** Permitir que el catálogo maestro de servicios AWS, las unidades temáticas y los desafíos educativos se redacten, mantengan y versionen en archivos JSON declarativos dentro del repositorio (`content/`).
2. **Abstracción de Lectura:** Definir la interfaz `IChallengeContentReader` y su implementación `JsonChallengeContentReader` para escanear, validar y deserializar los archivos de contenido.
3. **Sincronización Idempotente en PostgreSQL:** Implementar `ChallengeSeeder` en `AwsQuest.Infrastructure` para sincronizar de forma atómica e idempotente el catálogo de servicios, unidades, desafíos y servicios permitidos en PostgreSQL mediante EF Core 10 (`IAppDbContext`).
4. **Almacenamiento Estructurado JSONB:** Garantizar que las reglas de evaluación (`evaluation_rules_json`) y pistas (`hints_json`) se serialicen en formato `JSONB` canónico según [`specs/domain-models-enums-spec.md`](file:///c:/workspace/aws/aws-game/specs/domain-models-enums-spec.md).
5. **Conjunto Inicial de Contenido MVP:** Proveer las definiciones declarativas completas para los servicios clave de AWS (ALB, EC2, RDS, S3) y los desafíos iniciales (Fácil e Intermedio de 3 capas).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUJO DEL SEEDER DECLARATIVO                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Archivos Declarativos JSON (content/)                                      │
│  ├── services/aws-services.json                                             │
│  └── challenges/                                                            │
│      ├── unit-1/ (unit.json, challenge-101.json)                            │
│      └── unit-2/ (unit.json, challenge-201.json)                            │
│                         │                                                   │
│                         ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ JsonChallengeContentReader (Application / Infrastructure)             │  │
│  │ - Escaneo de directorio y deserialización System.Text.Json            │  │
│  │ - Validación de integridad referencial de contenido                   │  │
│  └──────────────────────┬────────────────────────────────────────────────┘  │
│                         │ SeedingDataPackage                                │
│                         ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ChallengeSeeder (Infrastructure.Persistence.Seeding)                  │  │
│  │ - Transacción Atómica (IDbContextTransaction)                         │  │
│  │ - Upsert Idempotente (SystemConfig -> AwsServices -> Units ->         │  │
│  │                       Challenges -> ChallengeServices)                │  │
│  └──────────────────────┬────────────────────────────────────────────────┘  │
│                         │ EF Core 10 (Npgsql)                               │
│                         ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL 15.3 (awsquest_db)                                         │  │
│  │ - Tablas relacionales con columnas JSONB para reglas y pistas         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en el Seeder |
| :--- | :--- | :--- |
| **RF-01 / RF-02** | Catálogo de Unidades y Desafíos | Inicialización de unidades temáticas ordenadas con sus desafíos asociados. |
| **RF-03 / RF-04** | Catálogo de Servicios y Distractores | Vinculación de servicios permitidos (`ChallengeService`) con `MaxInstances` e `IsDistractor`. |
| **RF-21 / RF-22** | Contenido Declarativo y GitOps | Todo el contenido reside en archivos JSON estructurados versionables mediante Pull Requests. |
| **RN-01** | Política de Accesibilidad | Inicialización del registro singleton `system_configs` (`Id = "global_config"`) con `AccessMode.OpenAccess`. |
| **RN-03 / RN-04** | Restricciones de Servicios y Límites | Configuración de reglas `RequiredServices`, `ForbiddenServices`, `MinInstances` y `MaxInstances`. |
| **RN-06 / RN-07** | Pistas Secuenciales y Penalizaciones | Población de la columna `hints_json` con array de objetos `HintDefinition`. |
| **RN-08** | Reglas de Antipatrones | Población de la columna `evaluation_rules_json` con reglas `AntiPatternRule`. |
| **RNF-08** | Extensibilidad del Sistema | Capacidad de agregar nuevos desafíos y unidades agregando archivos JSON sin recompilar código. |

---

## 3. Estructura del Directorio de Contenido (`content/`)

El contenido educativo se organiza en la raíz del repositorio en la carpeta `content/`:

```text
content/
├── services/
│   └── aws-services.json          # Catálogo maestro de servicios AWS
├── challenges/
│   ├── unit-1/
│   │   ├── unit.json              # Metadatos de la Unidad 1
│   │   └── challenge-101.json     # Desafío 1: Servidor Web Básico (Fácil)
│   └── unit-2/
│       ├── unit.json              # Metadatos de la Unidad 2
│       └── challenge-201.json     # Desafío 2: Arquitectura Web 3 Capas Resiliente (Intermedio)
└── system-config.json             # Configuración inicial del sistema
```

---

## 4. Esquemas JSON Declarativos

### 4.1. Catálogo Maestro de Servicios (`content/services/aws-services.json`)
Define los servicios AWS disponibles para ser habilitados en los desafíos:

```json
[
  {
    "code": "AWS_ALB",
    "name": "Application Load Balancer",
    "category": "Networking",
    "shortDescription": "Distribución elástica de tráfico HTTP/HTTPS a nivel de capa de aplicación (L7).",
    "iconUrl": "/icons/aws/alb.svg",
    "isActive": true
  },
  {
    "code": "AWS_EC2",
    "name": "Amazon EC2",
    "category": "Compute",
    "shortDescription": "Instancias de cómputo virtual escalables y seguras en la nube.",
    "iconUrl": "/icons/aws/ec2.svg",
    "isActive": true
  },
  {
    "code": "AWS_RDS",
    "name": "Amazon RDS",
    "category": "Database",
    "shortDescription": "Servicio administrado de base de datos relacional con soporte Multi-AZ.",
    "iconUrl": "/icons/aws/rds.svg",
    "isActive": true
  },
  {
    "code": "AWS_S3",
    "name": "Amazon S3",
    "category": "Storage",
    "shortDescription": "Almacenamiento de objetos altamente escalable, duradero y seguro.",
    "iconUrl": "/icons/aws/s3.svg",
    "isActive": true
  }
]
```

---

### 4.2. Metadatos de Unidad (`content/challenges/unit-X/unit.json`)

```json
{
  "title": "Alta Disponibilidad y Balanceo",
  "description": "Aprende a diseñar infraestructuras redundantes con balanceadores de carga y grupos de autoescalado.",
  "orderIndex": 2
}
```

---

### 4.3. Desafío Declarativo (`content/challenges/unit-2/challenge-201.json`)

```json
{
  "title": "Arquitectura Web de 3 Capas Resiliente",
  "description": "Diseña una arquitectura altamente disponible con balanceo de carga (ALB), escalado automático de servidores web (EC2) y base de datos relacional redundante (RDS Multi-AZ).",
  "difficulty": "Intermediate",
  "mode": "BUILDER",
  "baseXP": 150,
  "orderIndex": 1,
  "requiredXP": 0,
  "allowedServices": [
    { "serviceCode": "AWS_ALB", "maxInstances": 1, "isDistractor": false },
    { "serviceCode": "AWS_EC2", "maxInstances": 4, "isDistractor": false },
    { "serviceCode": "AWS_RDS", "maxInstances": 1, "isDistractor": false },
    { "serviceCode": "AWS_S3", "maxInstances": null, "isDistractor": true }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Piensa en cómo balancear el tráfico web entrante antes de que llegue a las instancias de cómputo.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Conecta el Application Load Balancer hacia las instancias EC2 configuradas con Auto Scaling.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Configura Amazon RDS con la opción Multi-AZ habilitada y enlaza las EC2 a la base de datos.",
      "penaltyPoints": 15
    }
  ],
  "evaluationRules": {
    "requiredServices": ["AWS_ALB", "AWS_EC2", "AWS_RDS"],
    "forbiddenServices": [],
    "minInstances": { "AWS_EC2": 2 },
    "maxInstances": { "AWS_ALB": 1, "AWS_RDS": 1 },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP_HTTPS",
        "penaltyIfMissing": 15,
        "description": "El Application Load Balancer debe distribuir el tráfico hacia las instancias EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben conectarse a la base de datos relacional RDS."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_RDS",
        "reason": "Un balanceador de carga web no debe conectarse directamente a la base de datos.",
        "penalty": 25
      }
    ],
    "antiPatterns": [
      {
        "code": "SPOF_EC2",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Availability",
        "title": "Punto Único de Fallo en Cómputo",
        "feedback": "Una sola instancia EC2 sin Auto Scaling representa un Single Point of Failure. Agrega al menos 2 instancias o habilita Auto Scaling."
      },
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "Amazon RDS debe permanecer en subnets privadas y no ser pública."
      },
      {
        "code": "MISSING_MULTI_AZ",
        "type": "MissingMultiAz",
        "penalty": 20,
        "category": "Availability",
        "title": "Falta de Redundancia Multi-AZ en Base de Datos",
        "feedback": "Habilita Multi-AZ en RDS para tolerar caídas de una zona de disponibilidad sin pérdida de datos."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

## 5. Abstracciones y Modelos de Seeding (`AwsQuest.Application`)

### 5.1. Modelos DTO de Seeding (`AwsQuest.Application.Common.Models.Seeding`)

```csharp
namespace AwsQuest.Application.Common.Models.Seeding;

using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ServiceSeedDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UnitSeedDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<ChallengeSeedDto> Challenges { get; set; } = [];
}

public class AllowedServiceSeedDto
{
    public string ServiceCode { get; set; } = string.Empty;
    public int? MaxInstances { get; set; }
    public bool IsDistractor { get; set; } = false;
}

public class ChallengeSeedDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Easy;
    public string Mode { get; set; } = "BUILDER";
    public int BaseXP { get; set; } = 100;
    public int RequiredXP { get; set; } = 0;
    public int OrderIndex { get; set; }
    public List<AllowedServiceSeedDto> AllowedServices { get; set; } = [];
    public List<HintDefinition> Hints { get; set; } = [];
    public ChallengeEvaluationRules EvaluationRules { get; set; } = new();
}

public class SystemConfigSeedDto
{
    public AccessMode AccessMode { get; set; } = AccessMode.OpenAccess;
}

public class SeedingDataPackage
{
    public SystemConfigSeedDto SystemConfig { get; set; } = new();
    public List<ServiceSeedDto> Services { get; set; } = [];
    public List<UnitSeedDto> Units { get; set; } = [];
}
```

---

### 5.2. Interfaces de Abstracción (`AwsQuest.Application.Common.Interfaces`)

#### `IChallengeContentReader.cs`
```csharp
namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Common.Models.Seeding;

public interface IChallengeContentReader
{
    Task<SeedingDataPackage> ReadContentAsync(string contentRootPath, CancellationToken cancellationToken = default);
}
```

#### `IChallengeSeeder.cs`
```csharp
namespace AwsQuest.Application.Common.Interfaces;

public interface IChallengeSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
```

---

## 6. Implementaciones de Infraestructura (`AwsQuest.Infrastructure`)

### 6.1. Lector de Contenido JSON (`JsonChallengeContentReader.cs`)

**Ubicación:** `AwsQuest.Infrastructure.Persistence.Seeding.JsonChallengeContentReader`

**Lógica de Operación:**
1. Escanea `content/services/aws-services.json` y deserializa la lista de servicios.
2. Escanea `content/system-config.json` si existe (o usa defaults).
3. Busca carpetas `content/challenges/unit-*` ordenadas numéricamente.
4. Para cada unidad, lee `unit.json` y los archivos `challenge-*.json`.
5. Valida integridad referencial:
   * Cada `serviceCode` en `allowedServices`, `requiredServices` o reglas debe existir en el catálogo maestro.
   * `orderIndex` de unidades y desafíos debe ser mayor o igual a 1.
6. Retorna el objeto consolidado `SeedingDataPackage`.

```csharp
namespace AwsQuest.Infrastructure.Persistence.Seeding;

using System.Text.Json;
using System.Text.Json.Serialization;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models.Seeding;

public class JsonChallengeContentReader : IChallengeContentReader
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public async Task<SeedingDataPackage> ReadContentAsync(string contentRootPath, CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(contentRootPath))
        {
            throw new DirectoryNotFoundException($"El directorio de contenido no fue encontrado: {contentRootPath}");
        }

        var package = new SeedingDataPackage();

        // 1. Leer Configuración Global
        var configPath = Path.Combine(contentRootPath, "system-config.json");
        if (File.Exists(configPath))
        {
            var configJson = await File.ReadAllTextAsync(configPath, cancellationToken);
            package.SystemConfig = JsonSerializer.Deserialize<SystemConfigSeedDto>(configJson, JsonOptions) ?? new();
        }

        // 2. Leer Catálogo Maestro de Servicios
        var servicesPath = Path.Combine(contentRootPath, "services", "aws-services.json");
        if (File.Exists(servicesPath))
        {
            var servicesJson = await File.ReadAllTextAsync(servicesPath, cancellationToken);
            package.Services = JsonSerializer.Deserialize<List<ServiceSeedDto>>(servicesJson, JsonOptions) ?? [];
        }

        // 3. Leer Unidades y Desafíos
        var challengesDir = Path.Combine(contentRootPath, "challenges");
        if (Directory.Exists(challengesDir))
        {
            var unitDirs = Directory.GetDirectories(challengesDir)
                .OrderBy(d => d)
                .ToList();

            foreach (var unitDir in unitDirs)
            {
                var unitJsonPath = Path.Combine(unitDir, "unit.json");
                if (!File.Exists(unitJsonPath)) continue;

                var unitJson = await File.ReadAllTextAsync(unitJsonPath, cancellationToken);
                var unitDto = JsonSerializer.Deserialize<UnitSeedDto>(unitJson, JsonOptions);
                if (unitDto == null) continue;

                var challengeFiles = Directory.GetFiles(unitDir, "challenge-*.json")
                    .OrderBy(f => f)
                    .ToList();

                foreach (var challengeFile in challengeFiles)
                {
                    var challengeJson = await File.ReadAllTextAsync(challengeFile, cancellationToken);
                    var challengeDto = JsonSerializer.Deserialize<ChallengeSeedDto>(challengeJson, JsonOptions);
                    if (challengeDto != null)
                    {
                        unitDto.Challenges.Add(challengeDto);
                    }
                }

                package.Units.Add(unitDto);
            }
        }

        return package;
    }
}
```

---

### 6.2. Sincronizador en Base de Datos (`ChallengeSeeder.cs`)

**Ubicación:** `AwsQuest.Infrastructure.Persistence.Seeding.ChallengeSeeder`

**Estrategia de Idempotencia y Sincronización:**
1. **Transaccional:** Envuelve la operación en `IDbContextTransaction`.
2. **SystemConfig:** Inserta `global_config` si no existe; si existe, preserva o actualiza según directiva.
3. **AwsServices:** Actualiza o inserta entidades `AwsService` basándose en la clave única `Code`.
4. **Units:** Busca por `OrderIndex` o `Title`. Si existe, actualiza título y descripción; si no, inserta una nueva `Unit`.
5. **Challenges:** Busca por `(UnitId, OrderIndex)` o `Title`.
   * Serializa `EvaluationRules` a cadena `evaluation_rules_json` (JSONB).
   * Serializa `Hints` a cadena `hints_json` (JSONB).
   * Actualiza o inserta el `Challenge`.
6. **ChallengeServices:** Elimina y recrea o actualiza las tuplas `(ChallengeId, ServiceId)` asociadas, asegurando consistencia con los servicios permitidos y distractores.

```csharp
namespace AwsQuest.Infrastructure.Persistence.Seeding;

using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models.Seeding;
using AwsQuest.Domain.Entities;

public class ChallengeSeeder(
    IAppDbContext context,
    IChallengeContentReader contentReader,
    IConfiguration configuration,
    ILogger<ChallengeSeeder> logger) : IChallengeSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var contentPath = configuration["Content:Path"] 
            ?? Path.Combine(AppContext.BaseDirectory, "content");

        // Si la ruta relativa en desarrollo no existe, buscar en la raíz del workspace
        if (!Directory.Exists(contentPath))
        {
            var fallback = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../content"));
            if (Directory.Exists(fallback))
            {
                contentPath = fallback;
            }
        }

        logger.LogInformation("Iniciando Seeding de contenido declarativo desde: {Path}", contentPath);

        var package = await contentReader.ReadContentAsync(contentPath, cancellationToken);

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // 1. Sincronizar SystemConfig
            var existingConfig = await context.SystemConfigs.FirstOrDefaultAsync(c => c.Id == "global_config", cancellationToken);
            if (existingConfig == null)
            {
                context.SystemConfigs.Add(new SystemConfig
                {
                    Id = "global_config",
                    AccessMode = package.SystemConfig.AccessMode,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            // 2. Sincronizar AwsServices
            var serviceMap = new Dictionary<string, AwsService>(StringComparer.OrdinalIgnoreCase);
            foreach (var sDto in package.Services)
            {
                var service = await context.AwsServices.FirstOrDefaultAsync(s => s.Code == sDto.Code, cancellationToken);
                if (service == null)
                {
                    service = new AwsService
                    {
                        Code = sDto.Code,
                        Name = sDto.Name,
                        Category = sDto.Category,
                        ShortDescription = sDto.ShortDescription,
                        IconUrl = sDto.IconUrl,
                        IsActive = sDto.IsActive,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.AwsServices.Add(service);
                }
                else
                {
                    service.Name = sDto.Name;
                    service.Category = sDto.Category;
                    service.ShortDescription = sDto.ShortDescription;
                    service.IconUrl = sDto.IconUrl;
                    service.IsActive = sDto.IsActive;
                }
                serviceMap[sDto.Code] = service;
            }
            await context.SaveChangesAsync(cancellationToken);

            // 3. Sincronizar Unidades y Desafíos
            foreach (var uDto in package.Units)
            {
                var unit = await context.Units.FirstOrDefaultAsync(u => u.OrderIndex == uDto.OrderIndex, cancellationToken);
                if (unit == null)
                {
                    unit = new Unit
                    {
                        Title = uDto.Title,
                        Description = uDto.Description,
                        OrderIndex = uDto.OrderIndex,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Units.Add(unit);
                    await context.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    unit.Title = uDto.Title;
                    unit.Description = uDto.Description;
                }

                foreach (var cDto in uDto.Challenges)
                {
                    var evalRulesJson = JsonSerializer.Serialize(cDto.EvaluationRules, JsonOptions);
                    var hintsJson = JsonSerializer.Serialize(cDto.Hints, JsonOptions);

                    var challenge = await context.Challenges
                        .Include(c => c.AllowedServices)
                        .FirstOrDefaultAsync(c => c.UnitId == unit.Id && c.OrderIndex == cDto.OrderIndex, cancellationToken);

                    if (challenge == null)
                    {
                        challenge = new Challenge
                        {
                            UnitId = unit.Id,
                            Title = cDto.Title,
                            Description = cDto.Description,
                            Difficulty = cDto.Difficulty,
                            Mode = cDto.Mode,
                            BaseXP = cDto.BaseXP,
                            RequiredXP = cDto.RequiredXP,
                            OrderIndex = cDto.OrderIndex,
                            EvaluationRulesJson = evalRulesJson,
                            HintsJson = hintsJson,
                            CreatedAt = DateTime.UtcNow
                        };
                        context.Challenges.Add(challenge);
                        await context.SaveChangesAsync(cancellationToken);
                    }
                    else
                    {
                        challenge.Title = cDto.Title;
                        challenge.Description = cDto.Description;
                        challenge.Difficulty = cDto.Difficulty;
                        challenge.Mode = cDto.Mode;
                        challenge.BaseXP = cDto.BaseXP;
                        challenge.RequiredXP = cDto.RequiredXP;
                        challenge.EvaluationRulesJson = evalRulesJson;
                        challenge.HintsJson = hintsJson;
                    }

                    // Sincronizar ChallengeServices
                    context.ChallengeServices.RemoveRange(challenge.AllowedServices);
                    foreach (var asDto in cDto.AllowedServices)
                    {
                        if (serviceMap.TryGetValue(asDto.ServiceCode, out var awsService))
                        {
                            context.ChallengeServices.Add(new ChallengeService
                            {
                                ChallengeId = challenge.Id,
                                ServiceId = awsService.Id,
                                MaxInstances = asDto.MaxInstances,
                                IsDistractor = asDto.IsDistractor
                            });
                        }
                    }
                }
            }

            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            logger.LogInformation("Seeding de contenido declarativo completado exitosamente.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Error durante la ejecución del Seeding de contenido.");
            throw;
        }
    }
}
```

---

### 6.3. Registro en Contenedor de Dependencias (`DependencyInjection.cs`)

En `AwsQuest.Infrastructure/DependencyInjection.cs`:
```csharp
services.AddScoped<IChallengeContentReader, JsonChallengeContentReader>();
services.AddScoped<IChallengeSeeder, ChallengeSeeder>();
```

---

## 7. Pruebas Unitarias del Seeder (`AwsQuest.UnitTests/Seeding`)

### 7.1. Casos de Prueba en `JsonChallengeContentReaderTests.cs`
1. **`ReadContentAsync_WhenValidDirectory_ShouldParseServicesUnitsAndChallenges`:**
   * Crea una estructura temporal con JSONs válidos.
   * Verifica que se deserialicen 4 servicios, 2 unidades y los desafíos con sus reglas y pistas.
2. **`ReadContentAsync_WhenDirectoryDoesNotExist_ShouldThrowDirectoryNotFoundException`:**
   * Verifica manejo de ruta inválida.
3. **`ReadContentAsync_ShouldDeserializeJsonbRulesAccurately`:**
   * Verifica que las propiedades `RequiredServices`, `AntiPatterns` y `PassingScoreThreshold` mantengan sus valores tipados.

### 7.2. Casos de Prueba en `ChallengeSeederTests.cs`
1. **`SeedAsync_WhenCalledFirstTime_ShouldPopulateAllEntities`:**
   * Utiliza SQLite in-memory o DbContext simulado.
   * Verifica que se inserten `SystemConfig`, `AwsServices`, `Units`, `Challenges` y `ChallengeServices`.
2. **`SeedAsync_WhenCalledMultipleTimes_ShouldBeIdempotent`:**
   * Ejecuta `SeedAsync()` dos veces consecutivas.
   * Verifica que el recuento de entidades no se duplique ni existan violaciones de unicidad.

---

## 8. Matriz de Trazabilidad Técnica

| Requisito / Componente | Artefacto en la Spec | Estado |
| :--- | :--- | :--- |
| **RF-21 / RF-22 (GitOps)** | `content/services/`, `content/challenges/` | Totalmente especificado |
| **RN-01 (Open Access)** | `SystemConfigSeedDto`, `SystemConfig` | Totalmente especificado |
| **RN-03 / RN-04 (Restricciones)** | `AllowedServices` en JSON y `ChallengeService` | Totalmente especificado |
| **RN-06 a RN-08 (Reglas / Pistas)** | `EvaluationRulesJson`, `HintsJson` (JSONB) | Totalmente especificado |
| **RNF-08 (Extensibilidad)** | `IChallengeContentReader`, `JsonChallengeContentReader` | Totalmente especificado |
| **Idempotencia / Transacciones** | `ChallengeSeeder`, `IDbContextTransaction` | Totalmente especificado |
