# Especificación Técnica: Fase 1 — Dominio, Persistencia, Seeder Declarativo y API Endpoints

> **Módulo:** AWS Quest Dictionary (Glosario & Grafo de Conocimiento Arquitectónico)  
> **Fase:** 1 (Backend: Domain, Infrastructure Persistence, Declarative Seeding, Application Layer & API Endpoints)  
> **Ubicación:** `specs/aws-quest-dictionary/phase-1-backend-domain-data-api-spec.md`  
> **Documento de Referencia:** [`docs/22-aws-quest-dictionary-knowledge-base-plan.md`](file:///c:/workspace/aws/aws-game/docs/22-aws-quest-dictionary-knowledge-base-plan.md)  
> **Framework:** .NET 10 (C# 13), EF Core 10, PostgreSQL / In-Memory (Tests), ASP.NET Core Web API  
> **Estado:** Listo para Implementación  

---

## 1. Resumen Ejecutivo y Objetivos

La **Fase 1** establece las bases de datos y la capa de servicios backend para el **AWS Quest Dictionary**. El objetivo es proporcionar un motor de consulta semántica rápido, desacoplado y enriquecido con relaciones topológicas entre servicios AWS, conceptos teóricos de arquitectura cloud, componentes de red y los 6 pilares del *AWS Well-Architected Framework*.

### Objetivos Clave de la Fase:
1. **Modelado de Dominio:** Diseñar la entidad `DictionaryTerm` y objetos de valor asociados para representar conceptos, servicios e infraestructura con sus compensaciones (*Trade-offs*).
2. **Persistencia & EF Core:** Configurar mapeos relacionales, indexación de texto y slugs, y migración idempotente para PostgreSQL.
3. **Carga Declarativa de Contenido (Seeding):** Integrar un subsistema de lectura y sincronización upsert a partir de `content/dictionary/terms.json`.
4. **Capa de Aplicación:** Implementar DTOs de resumen, detalle y categorías, con lógica de resolución del grafo de términos relacionados y desafíos vinculados.
5. **Endpoints RESTful (`DictionaryController`):** Exponer rutas optimizadas para el buscador Spotlight (`Ctrl+K`), el Drawer contextual y la vista de catálogo completa.
6. **Cobertura de Pruebas Automatizadas:** 100% de aserciones unitarias y de integración en `AwsQuest.UnitTests`.

---

## 2. Arquitectura del Módulo y Mapa de Archivos

```text
apps/api/src/
├── AwsQuest.Domain/
│   └── Entities/
│       └── DictionaryTerm.cs                                      [NEW]
│
├── AwsQuest.Application/
│   ├── Common/
│   │   ├── Interfaces/
│   │   │   ├── IAppDbContext.cs                                   [MODIFY] (Añadir DbSet<DictionaryTerm>)
│   │   │   ├── IDictionaryService.cs                              [NEW]
│   │   │   └── IDictionaryContentReader.cs                        [NEW]
│   │   └── Models/
│   │       └── Seeding/
│   │           └── DictionarySeedDtos.cs                          [NEW]
│   ├── Dtos/
│   │   └── Dictionary/
│   │       └── DictionaryDtos.cs                                  [NEW]
│   └── Mappings/
│       └── DictionaryMappingExtensions.cs                         [NEW]
│
├── AwsQuest.Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   │   └── DictionaryTermConfiguration.cs                     [NEW]
│   │   ├── Migrations/
│   │   │   ├── 20260925210000_AddDictionaryTermsTable.cs          [NEW]
│   │   │   ├── 20260925210000_AddDictionaryTermsTable.Designer.cs [NEW]
│   │   │   └── AppDbContextModelSnapshot.cs                       [MODIFY]
│   │   └── Seeding/
│   │       ├── DictionaryContentReader.cs                         [NEW]
│   │       └── ChallengeSeeder.cs                                 [MODIFY] (O DictionarySeeder.cs)
│   └── Services/
│       └── DictionaryService.cs                                   [NEW]
│
├── AwsQuest.Api/
│   └── Controllers/
│       └── DictionaryController.cs                                [NEW]
│
content/
└── dictionary/
    └── terms.json                                                 [NEW] (Dataset declarativo inicial)

apps/api/tests/AwsQuest.UnitTests/
├── Domain/
│   └── DictionaryTermTests.cs                                     [NEW]
├── Services/
│   └── DictionaryServiceTests.cs                                  [NEW]
├── Seeding/
│   └── DictionaryContentReaderTests.cs                            [NEW]
└── Controllers/
    └── DictionaryControllerTests.cs                               [NEW]
```

---

## 3. Especificación Detallada de Dominio y Modelos

### 3.1 Entidad `DictionaryTerm` (`AwsQuest.Domain.Entities.DictionaryTerm`)

Representa una unidad atómica de conocimiento dentro del glosario.

```csharp
namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

/// <summary>
/// Representa un término, concepto, servicio AWS o componente de red en el diccionario arquitectónico.
/// </summary>
public class DictionaryTerm
{
    /// <summary>
    /// Identificador canónico y legible en URL (ej. "amazon-ec2", "escalabilidad-horizontal", "subnet-publica").
    /// Clave primaria.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Título formal del término (ej. "Amazon EC2", "Escalabilidad Horizontal").
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Categoría general del término:
    /// "service" | "concept" | "infrastructure" | "well-architected"
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Código del servicio asociado si corresponde (ej. "AWS_EC2", "AWS_S3", "VPC_SUBNET").
    /// Opcional para conceptos teóricos abstractos.
    /// </summary>
    public string? ServiceCode { get; set; }

    /// <summary>
    /// Pilar del AWS Well-Architected Framework al que pertenece o apoya principalmente.
    /// </summary>
    public WellArchitectedPillar? Pillar { get; set; }

    /// <summary>
    /// Definición concisa (1-2 oraciones) optimizada para el buscador Spotlight / Command Palette.
    /// </summary>
    public string ShortDefinition { get; set; } = string.Empty;

    /// <summary>
    /// Explicación pedagógica y técnica profunda (Markdown soportado).
    /// </summary>
    public string WhatIs { get; set; } = string.Empty;

    /// <summary>
    /// Lista de escenarios y casos de uso recomendados en arquitecturas reales.
    /// </summary>
    public List<string> WhenToUse { get; set; } = [];

    /// <summary>
    /// Análisis de compensaciones de diseño (Pros y Contras / Consideraciones de costo, latencia y complejidad).
    /// </summary>
    public DictionaryTradeOffs TradeOffs { get; set; } = new();

    /// <summary>
    /// Slugs de términos relacionados para la construcción del Grafo de Conocimiento (ej. ["auto-scaling-group", "application-load-balancer"]).
    /// </summary>
    public List<string> RelatedTermSlugs { get; set; } = [];

    /// <summary>
    /// IDs de los desafíos del juego donde este término es aplicado o evaluado directamente.
    /// </summary>
    public List<string> AssociatedChallengeIds { get; set; } = [];

    /// <summary>
    /// Orden de visualización o prioridad opcional.
    /// </summary>
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Marca temporal de creación/actualización UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Objeto de valor que encapsula los pros y contras arquitectónicos de un término.
/// </summary>
public class DictionaryTradeOffs
{
    public string Pros { get; set; } = string.Empty;
    public string Cons { get; set; } = string.Empty;
}
```

---

## 4. Persistencia y Configuración EF Core

### 4.1 Mapeo de Entidad (`DictionaryTermConfiguration.cs`)

```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class DictionaryTermConfiguration : IEntityTypeConfiguration<DictionaryTerm>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public void Configure(EntityTypeBuilder<DictionaryTerm> builder)
    {
        builder.ToTable("DictionaryTerms");

        builder.HasKey(t => t.Slug);

        builder.Property(t => t.Slug)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Category)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(t => t.ServiceCode)
            .HasMaxLength(64)
            .IsRequired(false);

        builder.Property(t => t.Pillar)
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired(false);

        builder.Property(t => t.ShortDefinition)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(t => t.WhatIs)
            .IsRequired();

        // Mapeo JSON para listas y objetos complejos
        builder.Property(t => t.WhenToUse)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.RelatedTermSlugs)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.AssociatedChallengeIds)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.TradeOffs)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<DictionaryTradeOffs>(v, JsonOptions) ?? new DictionaryTradeOffs())
            .HasColumnType("jsonb");

        // Índices para búsquedas de alto rendimiento
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => t.ServiceCode);
        builder.HasIndex(t => t.Pillar);
        builder.HasIndex(t => t.Title);
    }
}
```

### 4.2 Actualización de `IAppDbContext` y `AppDbContext`

Se agrega:
```csharp
DbSet<DictionaryTerm> DictionaryTerms { get; }
```

---

## 5. DTOs y Contratos de Aplicación

En `apps/api/src/AwsQuest.Application/Dtos/Dictionary/DictionaryDtos.cs`:

```csharp
namespace AwsQuest.Application.Dtos.Dictionary;

using AwsQuest.Domain.Enums;

/// <summary>
/// DTO liviano para resultados de búsqueda, listados rápidos y Command Palette Spotlight.
/// </summary>
public record DictionaryTermSummaryDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode,
    WellArchitectedPillar? Pillar,
    string ShortDefinition,
    int AssociatedChallengesCount,
    int RelatedTermsCount
);

/// <summary>
/// DTO completo para la ficha técnica del Drawer lateral y vista individual.
/// </summary>
public record DictionaryTermDetailDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode,
    WellArchitectedPillar? Pillar,
    string ShortDefinition,
    string WhatIs,
    List<string> WhenToUse,
    DictionaryTradeOffsDto TradeOffs,
    List<DictionaryRelatedTermDto> RelatedTerms,
    List<DictionaryAssociatedChallengeDto> AssociatedChallenges
);

public record DictionaryTradeOffsDto(
    string Pros,
    string Cons
);

public record DictionaryRelatedTermDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode
);

public record DictionaryAssociatedChallengeDto(
    string Id,
    string Title,
    DifficultyLevel Difficulty,
    int BaseXP
);

/// <summary>
/// Métricas agregadas por categoría para navegación y badges.
/// </summary>
public record DictionaryCategoryCountDto(
    string Category,
    int Count,
    string Label
);

/// <summary>
/// Parámetros de consulta y filtrado para el endpoint de listado.
/// </summary>
public record DictionaryFilterParams(
    string? Search = null,
    string? Category = null,
    WellArchitectedPillar? Pillar = null,
    int Limit = 50,
    int Offset = 0
);
```

---

## 6. Lógica de Servicio (`DictionaryService`)

### 6.1 Interfaz `IDictionaryService`

```csharp
namespace AwsQuest.Application.Common.Interfaces;

using AwsQuest.Application.Dtos.Dictionary;

public interface IDictionaryService
{
    Task<List<DictionaryTermSummaryDto>> GetTermsAsync(DictionaryFilterParams filter, CancellationToken cancellationToken = default);
    Task<DictionaryTermDetailDto?> GetTermBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<DictionaryCategoryCountDto>> GetCategoriesSummaryAsync(CancellationToken cancellationToken = default);
}
```

### 6.2 Comportamiento Clave de `DictionaryService`:
1. **Búsqueda Case-Insensitive y Parcial:** La búsqueda por `filter.Search` aplica sobre `Title`, `ShortDefinition`, `Slug` y `ServiceCode`.
2. **Filtrado Multidimensional:** Permite combinar simultáneamente `Category` y `Pillar`.
3. **Resolución de Grafo en `GetTermBySlugAsync`:**
   - Para cada `RelatedTermSlug`, busca el `Title`, `Category` y `ServiceCode` correspondientes.
   - Para cada `AssociatedChallengeId`, cruza con `DbSet<Challenge>` para retornar `Title`, `Difficulty` y `BaseXP`.
4. **Resiliencia ante Slugs Huerfanos:** Si un slug relacionado o challenge ID no existe en la base de datos, se descarta silenciosamente o se reporta con un fallback seguro sin romper la ejecución.

---

## 7. Subsistema de Lectura y Seeding Declarativo

### 7.1 Esquema de `content/dictionary/terms.json`

```json
{
  "$schema": "./dictionary.schema.json",
  "terms": [
    {
      "slug": "amazon-ec2",
      "title": "Amazon EC2",
      "category": "service",
      "serviceCode": "AWS_EC2",
      "pillar": "CostOptimization",
      "shortDefinition": "Servicio web que proporciona capacidad informática escalable y redimensionable en la nube.",
      "whatIs": "Amazon Elastic Compute Cloud (Amazon EC2) ofrece servidores virtuales en la nube conocidos como instancias. Permite aprovisionar capacidad bajo demanda, seleccionar sistemas operativos, memoria, CPUs y configurar redes y almacenamiento de manera totalmente flexible.",
      "whenToUse": [
        "Cargas de trabajo monolíticas o basadas en máquinas virtuales estándar.",
        "Aplicaciones que requieren acceso a nivel de sistema operativo o drivers específicos.",
        "Procesamiento por lotes que escala mediante Auto Scaling Groups (ASG)."
      ],
      "tradeOffs": {
        "pros": "Control total del entorno, compatibilidad universal, amplia variedad de familias de instancias optimizadas.",
        "cons": "Mayor sobrecarga de administración operativa (parcheo, actualizaciones de SO) comparado con Serverless/Fargate."
      },
      "relatedTermSlugs": [
        "amazon-ebs",
        "auto-scaling-group",
        "application-load-balancer",
        "escalabilidad-horizontal"
      ],
      "associatedChallengeIds": [
        "ch-ec2-single-instance",
        "ch-ec2-high-availability"
      ],
      "displayOrder": 1
    }
  ]
}
```

### 7.2 Lógica de Seeding en `DictionaryContentReader` y `ChallengeSeeder`
- **Lectura Asíncrona:** Lee el archivo `content/dictionary/terms.json`.
- **Upsert Idempotente:** Sincroniza cada término. Si existe por `Slug`, actualiza sus propiedades; si no existe, lo inserta.
- **Validación de Integridad:** Comprueba que ningún slug esté duplicado y que las categorías pertenezcan a los valores soportados.

---

## 8. Endpoints API (`DictionaryController`)

```csharp
namespace AwsQuest.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Domain.Enums;

[ApiController]
[Route("api/v1/dictionary")]
[Produces("application/json")]
public class DictionaryController : ControllerBase
{
    private readonly IDictionaryService _dictionaryService;

    public DictionaryController(IDictionaryService dictionaryService)
    {
        _dictionaryService = dictionaryService;
    }

    /// <summary>
    /// Consulta el glosario de términos con soporte de búsqueda por texto libre, categoría y pilar Well-Architected.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<DictionaryTermSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTerms(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] WellArchitectedPillar? pillar,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        var filter = new DictionaryFilterParams(search, category, pillar, limit, offset);
        var terms = await _dictionaryService.GetTermsAsync(filter, cancellationToken);
        return Ok(ApiResponse<List<DictionaryTermSummaryDto>>.Ok(terms));
    }

    /// <summary>
    /// Obtiene la ficha técnica detallada de un término por su slug, incluyendo el grafo de relaciones y desafíos asociados.
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ApiResponse<DictionaryTermDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTermBySlug(
        [FromRoute] string slug,
        CancellationToken cancellationToken = default)
    {
        var term = await _dictionaryService.GetTermBySlugAsync(slug, cancellationToken);
        if (term == null)
        {
            return NotFound(ApiResponse<object>.Failure($"El término '{slug}' no fue encontrado en el diccionario."));
        }

        return Ok(ApiResponse<DictionaryTermDetailDto>.Ok(term));
    }

    /// <summary>
    /// Obtiene el resumen de categorías disponibles y el conteo de términos en cada una.
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(ApiResponse<List<DictionaryCategoryCountDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken = default)
    {
        var categories = await _dictionaryService.GetCategoriesSummaryAsync(cancellationToken);
        return Ok(ApiResponse<List<DictionaryCategoryCountDto>>.Ok(categories));
    }
}
```

---

## 9. Plan de Pruebas Automatizadas

### 9.1 Matriz de Pruebas Unitarias e Integración

| Suite de Test | Clase / Archivo | Casos de Prueba |
| :--- | :--- | :--- |
| **Dominio** | `DictionaryTermTests.cs` | - Creación de instancia válida con valores por defecto.<br>- Asignación de TradeOffs y listas de relaciones.<br>- Validación de categorías soportadas. |
| **Seeder Reader** | `DictionaryContentReaderTests.cs` | - Lectura y deserialización correcta de `terms.json`.<br>- Detección de slugs duplicados arrojando excepción descriptiva.<br>- Manejo de archivo JSON inexistente o malformado. |
| **Servicio** | `DictionaryServiceTests.cs` | - Búsqueda por palabra clave parcial en título o definición.<br>- Filtrado exacto por categoría (`service`, `concept`).<br>- Filtrado por pilar Well-Architected (`Security`, `Reliability`).<br>- Resolución exitosa de relaciones cruzadas y desafíos asociados.<br>- Retorno de `null` al buscar un slug inexistente. |
| **API Controller** | `DictionaryControllerTests.cs` | - `GET /api/v1/dictionary` retorna HTTP 200 con payload envuelto en `ApiResponse`.<br>- `GET /api/v1/dictionary/{slug}` retorna 200 para slug existente y 404 para inexistente.<br>- `GET /api/v1/dictionary/categories` retorna lista agregada de categorías con conteos correctos. |

---

## 10. Criterios de Aceptación y Definición de Terminado (DoD)

1. [ ] **Entidad y Persistencia Registradas:** `DictionaryTerm` mapeado en EF Core con índices en `Slug`, `Category`, `Pillar` y `Title`.
2. [ ] **Migración EF Core Generada:** Migración idempotente compatible con PostgreSQL aplicada en el snapshot del modelo.
3. [ ] **Seeder Integrado y Verificado:** El archivo `content/dictionary/terms.json` se sincroniza automáticamente durante el startup de la aplicación.
4. [ ] **Endpoints REST Operativos:** Las rutas `/api/v1/dictionary`, `/api/v1/dictionary/{slug}` y `/api/v1/dictionary/categories` responden con los formatos JSON y códigos de estado estipulados.
5. [ ] **100% de Pruebas en Verde:** Todos los tests de la solución (`dotnet test`) compilan y pasan exitosamente sin advertencias.
