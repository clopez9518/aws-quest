# Especificación Técnica: Modelado y Mapeo EF Core 10 (Fase 1 - Hito 1.3)

## 1. Introducción y Objetivos

Esta especificación detalla el diseño, modelado, configuración Fluent API y estrategia de migración para la persistencia del sistema **AWS Architecture Quest** utilizando **Entity Framework Core 10 (EF Core 10 + Npgsql)** sobre **PostgreSQL 15.3**, en estricto cumplimiento del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)) y el modelo de datos formal ([`docs/07-data-model.md`](file:///c:/workspace/aws/aws-game/docs/07-data-model.md)).

### Objetivos Clave:
1. Definir los **Enums** y **Entidades de Dominio** en `AwsQuest.Domain` con tipado estricto en C# 14 / .NET 10.
2. Establecer la abstracción de persistencia **`IAppDbContext`** en `AwsQuest.Application.Common.Interfaces`.
3. Implementar **`AppDbContext`** y configuraciones Fluent API modulares (`IEntityTypeConfiguration<T>`) en `AwsQuest.Infrastructure.Persistence`.
4. Mapear de forma nativa columnas **`jsonb`** para reglas de evaluación, pistas, grafos de arquitectura y resultados.
5. Configurar el **índice condicional único** para el campo `Email` (`HasFilter("\"email\" IS NOT NULL")`) permitiendo soportar usuarios en **Modo Invitado** (`isGuest: true`) sin colisiones de unicidad.
6. Generar y aplicar la migración inicial de base de datos (`InitialCreate`) contra el contenedor PostgreSQL.

---

## 2. Definición de Enums de Dominio (`AwsQuest.Domain.Enums`)

Los enums representan valores discretos del negocio y se persisten en PostgreSQL como cadenas descriptivas (`varchar`) para facilitar la legibilidad e interoperabilidad.

### 2.1. `AccessMode.cs`
Rige la política de accesibilidad de desafíos en la plataforma (**RN-01**).
```csharp
namespace AwsQuest.Domain.Enums;

public enum AccessMode
{
    OpenAccess = 1,
    Progressive = 2
}
```

### 2.2. `DifficultyLevel.cs`
Categoriza la complejidad técnica y pedagógica del desafío.
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

### 2.3. `ProgressStatus.cs`
Indica el estado de avance del aprendiz en un desafío específico (**RN-02**).
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

## 3. Definición de Entidades de Dominio (`AwsQuest.Domain.Entities`)

Todas las entidades residen en `AwsQuest.Domain.Entities` y no contienen dependencias de infraestructura ni anotaciones de atributos de EF Core (Data Annotations), manteniendo el dominio limpio y desacoplado.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ENTIDADES DE DOMINIO                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. SystemConfig      : Configuración global del modo de acceso              │
│ 2. User              : Usuario registrado o anónimo en Modo Invitado         │
│ 3. Unit              : Unidad temática de aprendizaje                        │
│ 4. AwsService        : Catálogo maestro de servicios AWS disponibles        │
│ 5. Challenge         : Definición del problema, reglas y pistas (JSONB)      │
│ 6. ChallengeService  : Catálogo de servicios permitidos por desafío         │
│ 7. UserProgress      : Estado, récord (HighScore) y XP por usuario/desafío   │
│ 8. ChallengeAttempt  : Historial de auditoría de soluciones evaluadas        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. `SystemConfig.cs`
```csharp
namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class SystemConfig
{
    public string Id { get; set; } = "global_config";
    public AccessMode AccessMode { get; set; } = AccessMode.OpenAccess;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

### 3.2. `User.cs`
```csharp
namespace AwsQuest.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Email { get; set; } // Nullable para Modo Invitado
    public string Name { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // Nullable para invitados
    public bool IsGuest { get; set; } = false;
    public int TotalXP { get; set; } = 0;
    public int Level { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
}
```

### 3.3. `Unit.cs`
```csharp
namespace AwsQuest.Domain.Entities;

public class Unit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Challenge> Challenges { get; set; } = new List<Challenge>();
}
```

### 3.4. `AwsService.cs`
```csharp
namespace AwsQuest.Domain.Entities;

public class AwsService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // Ej: "AWS_EC2", "AWS_RDS"
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Ej: "Compute", "Database"
    public string ShortDescription { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChallengeService> ChallengeServices { get; set; } = new List<ChallengeService>();
}
```

### 3.5. `Challenge.cs`
```csharp
namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class Challenge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UnitId { get; set; }
    public Guid? PrerequisiteChallengeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; }
    public string Mode { get; set; } = "BUILDER";
    public int RequiredXP { get; set; } = 0;
    public string EvaluationRulesJson { get; set; } = "{}"; // JSONB
    public string HintsJson { get; set; } = "[]";           // JSONB
    public int BaseXP { get; set; } = 100;
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Unit Unit { get; set; } = null!;
    public Challenge? Prerequisite { get; set; }
    public ICollection<Challenge> DependentChallenges { get; set; } = new List<Challenge>();
    public ICollection<ChallengeService> AllowedServices { get; set; } = new List<ChallengeService>();
    public ICollection<UserProgress> ProgressRecords { get; set; } = new List<UserProgress>();
}
```

### 3.6. `ChallengeService.cs`
```csharp
namespace AwsQuest.Domain.Entities;

public class ChallengeService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChallengeId { get; set; }
    public Guid ServiceId { get; set; }
    public int? MaxInstances { get; set; }
    public bool IsDistractor { get; set; } = false;

    public Challenge Challenge { get; set; } = null!;
    public AwsService Service { get; set; } = null!;
}
```

### 3.7. `UserProgress.cs`
```csharp
namespace AwsQuest.Domain.Entities;

using AwsQuest.Domain.Enums;

public class UserProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public ProgressStatus Status { get; set; } = ProgressStatus.NotStarted;
    public int HighScore { get; set; } = 0;
    public int HintsUsed { get; set; } = 0;
    public string? LastAttemptGraphJson { get; set; } // JSONB
    public DateTime? FirstCompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Challenge Challenge { get; set; } = null!;
    public ICollection<ChallengeAttempt> Attempts { get; set; } = new List<ChallengeAttempt>();
}
```

### 3.8. `ChallengeAttempt.cs`
```csharp
namespace AwsQuest.Domain.Entities;

public class ChallengeAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProgressId { get; set; }
    public int Score { get; set; }
    public bool Passed { get; set; }
    public int HintsUsed { get; set; } = 0;
    public string GraphSubmittedJson { get; set; } = "{}";   // JSONB
    public string EvaluationResultJson { get; set; } = "{}"; // JSONB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProgress Progress { get; set; } = null!;
}
```

---

## 4. Abstracción de Persistencia (`IAppDbContext`)

Ubicada en `AwsQuest.Application.Common.Interfaces/IAppDbContext.cs` para permitir que la capa de aplicación interactúe con la persistencia sin acoplarse a `Microsoft.EntityFrameworkCore`:

```csharp
namespace AwsQuest.Application.Common.Interfaces;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using AwsQuest.Domain.Entities;

public interface IAppDbContext
{
    DbSet<SystemConfig> SystemConfigs { get; }
    DbSet<User> Users { get; }
    DbSet<Unit> Units { get; }
    DbSet<AwsService> AwsServices { get; }
    DbSet<Challenge> Challenges { get; }
    DbSet<ChallengeService> ChallengeServices { get; }
    DbSet<UserProgress> UserProgresses { get; }
    DbSet<ChallengeAttempt> ChallengeAttempts { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

---

## 5. Configuraciones Fluent API (`AwsQuest.Infrastructure.Persistence.Configurations`)

Cada entidad posee su propia clase de configuración implementando `IEntityTypeConfiguration<T>` en archivos separados, logrando un diseño altamente modular y mantenible.

### 5.1. `SystemConfigConfiguration.cs`
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class SystemConfigConfiguration : IEntityTypeConfiguration<SystemConfig>
{
    public void Configure(EntityTypeBuilder<SystemConfig> builder)
    {
        builder.ToTable("system_configs");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(50);
        builder.Property(e => e.AccessMode)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
    }
}
```

### 5.2. `UserConfiguration.cs`
Configura el **índice condicional único** sobre `Email` para soportar usuarios registrados e invitados anónimos simultáneamente.
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Email)
            .HasMaxLength(255)
            .IsRequired(false);
            
        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasFilter("\"email\" IS NOT NULL");

        builder.Property(e => e.Name).HasMaxLength(120).IsRequired();
        builder.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired(false);
        builder.Property(e => e.IsGuest).IsRequired();
        builder.Property(e => e.TotalXP).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.Level).HasDefaultValue(1).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
    }
}
```

### 5.3. `UnitConfiguration.cs`
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.OrderIndex).IsRequired();
        builder.HasIndex(e => e.OrderIndex).IsUnique();
        builder.Property(e => e.CreatedAt).IsRequired();
    }
}
```

### 5.4. `AwsServiceConfiguration.cs`
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

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
    }
}
```

### 5.5. `ChallengeConfiguration.cs`
Configura columnas nativas `jsonb` para reglas de evaluación y pistas pedagógicas.
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeConfiguration : IEntityTypeConfiguration<Challenge>
{
    public void Configure(EntityTypeBuilder<Challenge> builder)
    {
        builder.ToTable("challenges");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Description).IsRequired();
        builder.Property(e => e.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(e => e.Mode).HasMaxLength(50).HasDefaultValue("BUILDER").IsRequired();
        builder.Property(e => e.RequiredXP).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.BaseXP).HasDefaultValue(100).IsRequired();
        builder.Property(e => e.OrderIndex).IsRequired();
        
        // Columnas JSONB
        builder.Property(e => e.EvaluationRulesJson)
            .HasColumnName("evaluation_rules_json")
            .HasColumnType("jsonb")
            .IsRequired();
            
        builder.Property(e => e.HintsJson)
            .HasColumnName("hints_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.CreatedAt).IsRequired();

        // Índices
        builder.HasIndex(e => new { e.UnitId, e.OrderIndex }).IsUnique();
        builder.HasIndex(e => e.UnitId);
        builder.HasIndex(e => e.PrerequisiteChallengeId);

        // Relaciones
        builder.HasOne(e => e.Unit)
            .WithMany(u => u.Challenges)
            .HasForeignKey(e => e.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Prerequisite)
            .WithMany(c => c.DependentChallenges)
            .HasForeignKey(e => e.PrerequisiteChallengeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
```

### 5.6. `ChallengeServiceConfiguration.cs`
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeServiceConfiguration : IEntityTypeConfiguration<ChallengeService>
{
    public void Configure(EntityTypeBuilder<ChallengeService> builder)
    {
        builder.ToTable("challenge_services");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.MaxInstances).IsRequired(false);
        builder.Property(e => e.IsDistractor).HasDefaultValue(false).IsRequired();

        builder.HasIndex(e => new { e.ChallengeId, e.ServiceId }).IsUnique();
        builder.HasIndex(e => e.ChallengeId);
        builder.HasIndex(e => e.ServiceId);

        builder.HasOne(e => e.Challenge)
            .WithMany(c => c.AllowedServices)
            .HasForeignKey(e => e.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Service)
            .WithMany(s => s.ChallengeServices)
            .HasForeignKey(e => e.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### 5.7. `UserProgressConfiguration.cs`
Configura el almacenamiento `jsonb` del último intento y restricción de unicidad por usuario y desafío.
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.ToTable("user_progress");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
            
        builder.Property(e => e.HighScore).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.HintsUsed).HasDefaultValue(0).IsRequired();
        
        // Columna JSONB
        builder.Property(e => e.LastAttemptGraphJson)
            .HasColumnName("last_attempt_graph_json")
            .HasColumnType("jsonb")
            .IsRequired(false);

        builder.Property(e => e.FirstCompletedAt).IsRequired(false);
        builder.Property(e => e.UpdatedAt).IsRequired();

        // Índices
        builder.HasIndex(e => new { e.UserId, e.ChallengeId }).IsUnique();
        builder.HasIndex(e => new { e.UserId, e.Status });
        builder.HasIndex(e => e.ChallengeId);

        // Relaciones
        builder.HasOne(e => e.User)
            .WithMany(u => u.Progress)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Challenge)
            .WithMany(c => c.ProgressRecords)
            .HasForeignKey(e => e.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### 5.8. `ChallengeAttemptConfiguration.cs`
Configura el registro de intentos con almacenamiento estructurado `jsonb` para la arquitectura enviada y el desglose de resultados.
```csharp
namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeAttemptConfiguration : IEntityTypeConfiguration<ChallengeAttempt>
{
    public void Configure(EntityTypeBuilder<ChallengeAttempt> builder)
    {
        builder.ToTable("challenge_attempts");
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Score).IsRequired();
        builder.Property(e => e.Passed).IsRequired();
        builder.Property(e => e.HintsUsed).HasDefaultValue(0).IsRequired();
        
        // Columnas JSONB
        builder.Property(e => e.GraphSubmittedJson)
            .HasColumnName("graph_submitted_json")
            .HasColumnType("jsonb")
            .IsRequired();
            
        builder.Property(e => e.EvaluationResultJson)
            .HasColumnName("evaluation_result_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.CreatedAt).IsRequired();

        // Índices
        builder.HasIndex(e => new { e.ProgressId, e.CreatedAt });
        builder.HasIndex(e => e.ProgressId);

        // Relaciones
        builder.HasOne(e => e.Progress)
            .WithMany(p => p.Attempts)
            .HasForeignKey(e => e.ProgressId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

---

## 6. Implementación de `AppDbContext` (`AwsQuest.Infrastructure.Persistence`)

`AppDbContext` registra todos los `DbSet<T>` y aplica automáticamente las configuraciones modulares desde el ensamblado de infraestructura:

```csharp
namespace AwsQuest.Infrastructure.Persistence;

using System.Reflection;
using Microsoft.EntityFrameworkCore;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Domain.Entities;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<AwsService> AwsServices => Set<AwsService>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeService> ChallengeServices => Set<ChallengeService>();
    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();
    public DbSet<ChallengeAttempt> ChallengeAttempts => Set<ChallengeAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Aplica todas las clases que implementan IEntityTypeConfiguration<T> en este ensamblado
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

---

## 7. Registro de Inyección de Dependencias (`DependencyInjection.cs`)

En `AwsQuest.Infrastructure/DependencyInjection.cs`:
```csharp
namespace AwsQuest.Infrastructure;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Infrastructure.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        return services;
    }
}
```

---

## 8. Flujo de Ejecución y Generación de Migraciones

Para generar y aplicar la migración inicial de base de datos contra el contenedor de desarrollo:

```bash
# 1. Asegurar que el contenedor PostgreSQL esté corriendo
docker compose ps

# 2. Generar la migración inicial desde la carpeta apps/api
cd apps/api
dotnet ef migrations add InitialCreate --project src/AwsQuest.Infrastructure --startup-project src/AwsQuest.Api --output-dir Persistence/Migrations

# 3. Aplicar la migración a la base de datos PostgreSQL
dotnet ef database update --project src/AwsQuest.Infrastructure --startup-project src/AwsQuest.Api
```

---

## 9. Matriz de Verificación del Esquema

Tras la ejecución de la migración, se debe validar:

| Criterio de Verificación | Comando de Comprobación | Resultado Esperado |
| :--- | :--- | :--- |
| **8 Tablas creadas** | `docker exec awsquest-postgres psql -U postgres -d awsquest_db -c "\dt"` | `system_configs`, `users`, `units`, `aws_services`, `challenges`, `challenge_services`, `user_progress`, `challenge_attempts`, `__EFMigrationsHistory`. |
| **Tipos JSONB** | `docker exec awsquest-postgres psql -U postgres -d awsquest_db -c "\d challenges"` | Columnas `evaluation_rules_json` y `hints_json` con tipo `jsonb`. |
| **Índice Filtrado de Email** | `docker exec awsquest-postgres psql -U postgres -d awsquest_db -c "\d users"` | Índice único `IX_users_email` con cláusula `WHERE email IS NOT NULL`. |
| **Integridad Referencial** | `docker exec awsquest-postgres psql -U postgres -d awsquest_db -c "\d challenge_services"` | FKs a `challenges` (CASCADE) y `aws_services` (RESTRICT). |
| **Compilación y Pruebas** | `dotnet build` y `dotnet test` | 0 advertencias, 0 errores. |
