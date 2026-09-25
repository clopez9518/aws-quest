# Especificación Técnica: DTOs, Envelopes y Validadores (Fase 3 - Hito 3.1)

## 1. Introducción y Objetivos

Esta especificación técnica define el diseño exhaustivo, estructura de tipos, contratos de solicitud/respuesta, envelopes estándar y reglas de validación con **FluentValidation** para la capa **`AwsQuest.Application`**, correspondiente a la **Tarea 3.1** de la **Fase 3** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)) y conforme a la especificación de API REST ([`docs/08-api-spec.md`](file:///c:/workspace/aws/aws-game/docs/08-api-spec.md)).

### Objetivos Clave:
1. **Contratos Fuertemente Tipados:** Definir todos los DTOs de petición (*Request*) y respuesta (*Response*) para los módulos de Autenticación, Catálogo, Desafíos, Pistas, Evaluación, Servicios Maestros y Configuración del Sistema.
2. **Envelopes Estándar de API:** Implementar las estructuras genéricas unificadas `ApiResponse<T>` y `ApiErrorResponse` con soporte para metadatos y paginación.
3. **Validación Declarativa con FluentValidation:** Implementar validadores para garantizar la integridad y sanitización de todas las entradas del usuario antes de ingresar a la lógica de casos de uso.
4. **Catálogo Unificado de Errores:** Establecer las constantes de códigos de error (`ErrorCodes`) y estructuras de desglose para errores de validación de campos (`ValidationFailureDetails`).
5. **Mapeo Limpio de Dominio:** Diseñar extensiones de mapeo puras y desacopladas entre entidades de dominio (`AwsQuest.Domain`) y DTOs de transporte.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ESTRUCTURA DE AwsQuest.Application                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ├── Common/                                                                 │
│ │   ├── Models/                                                             │
│ │   │   ├── ApiResponse.cs            (Envelope exitoso genérico)           │
│ │   │   ├── ApiErrorResponse.cs       (Envelope de error estandarizado)     │
│ │   │   ├── ApiMetaDto.cs             (Metadatos y paginación)              │
│ │   │   ├── ErrorCodes.cs             (Constantes de códigos de error)      │
│ │   │   └── Seeding/                  (DTOs existentes de Seeding)          │
│ │   └── Interfaces/                   (Contratos de persistencia y servicios│
│ ├── Dtos/                                                                   │
│ │   ├── Auth/                         (Guest, Register, Login, Me, Profile) │
│ │   ├── Catalog/                      (Units, CatalogChallenge, Progress)  │
│ │   ├── Challenge/                    (Detail, AllowedServices, Hints)      │
│ │   ├── Evaluation/                   (EvaluateRequest, Result, Attempts)   │
│ │   ├── MasterServices/               (AwsServiceResponseDto)               │
│ │   └── SystemConfig/                 (SystemConfigResponse, UpdateRequest) │
│ ├── Mappings/                         (Extensiones de mapeo Entidad -> DTO) │
│ └── Validators/                       (Reglas de validación FluentValidation│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en DTOs y Validadores |
| :--- | :--- | :--- |
| **RF-01 / RF-02** | Catálogo y Detalle de Desafíos | `UnitResponseDto`, `CatalogChallengeDto`, `ChallengeDetailResponseDto`. |
| **RF-03 / RF-04** | Servicios y Distractores | `ChallengeAllowedServiceDto` con `MaxInstances` e `IsDistractor`. |
| **RF-13 a RF-19** | Evaluación y Feedback | `EvaluateArchitectureRequestDto` y `EvaluateArchitectureResponseDto`. |
| **RF-20 / CU-08** | Modo Invitado y Migración | `GuestSessionResponseDto`, `RegisterRequestDto`, `RegisterResponseDto` con `MigratedProgressCount`. |
| **RN-01** | Política de Accesibilidad | `SystemConfigResponseDto` y `UpdateSystemConfigRequestDto` (`AccessMode`). |
| **RN-02** | Umbral de Aprobación | `Passed` ($\ge 70$ pts) y `HighScore` en DTOs de progreso y resultado. |
| **RN-06 / RN-07** | Pistas y Penalizaciones | `HintsSummaryDto`, `UnlockedHintDto`, `UnlockHintResponseDto`. |
| **RN-10** | XP Incremental Anti-Farmeo | `EarnedXP`, `CurrentUserXP`, `CurrentUserLevel` en `EvaluateArchitectureResponseDto`. |
| **RN-13** | Migración Atómica de Progreso | Validación de `RegisterRequestDto` y estructura de migración. |

---

## 3. Envelopes Estándar de Comunicación (`Common/Models/`)

### 3.1. Envelope de Éxito (`ApiResponse<T>`)

```csharp
namespace AwsQuest.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; init; } = true;
    public T Data { get; init; } = default!;
    public ApiMetaDto? Meta { get; init; }

    public static ApiResponse<T> Ok(T data, ApiMetaDto? meta = null) => new()
    {
        Success = true,
        Data = data,
        Meta = meta
    };
}

public class ApiMetaDto
{
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public PaginationMetadataDto? Pagination { get; init; }
}

public class PaginationMetadataDto
{
    public int Total { get; init; }
    public int Page { get; init; }
    public int Limit { get; init; }
    public int TotalPages => Limit > 0 ? (int)Math.Ceiling((double)Total / Limit) : 0;
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
```

### 3.2. Envelope de Error (`ApiErrorResponse`)

```csharp
namespace AwsQuest.Application.Common.Models;

public class ApiErrorResponse
{
    public bool Success { get; init; } = false;
    public ApiErrorDetails Error { get; init; } = new();

    public static ApiErrorResponse Create(string code, string message, object? details = null) => new()
    {
        Success = false,
        Error = new ApiErrorDetails
        {
            Code = code,
            Message = message,
            Details = details
        }
    };
}

public class ApiErrorDetails
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public object? Details { get; init; }
}

public class ValidationErrorDetail
{
    public string Field { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public object? AttemptedValue { get; init; }
}
```

### 3.3. Catálogo de Códigos de Error (`ErrorCodes.cs`)

```csharp
namespace AwsQuest.Application.Common.Models;

public static class ErrorCodes
{
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string ChallengeNotFound = "CHALLENGE_NOT_FOUND";
    public const string ChallengeLocked = "CHALLENGE_LOCKED";
    public const string InvalidGraphPayload = "INVALID_GRAPH_PAYLOAD";
    public const string ServiceLimitExceeded = "SERVICE_LIMIT_EXCEEDED";
    public const string AllHintsUnlocked = "ALL_HINTS_UNLOCKED";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
}
```

---

## 4. Definición de DTOs por Módulo (`Dtos/`)

### 4.1. Módulo de Autenticación (`Dtos/Auth/`)

```csharp
namespace AwsQuest.Application.Dtos.Auth;

public class UserDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public bool IsGuest { get; init; }
    public int TotalXP { get; init; }
    public int Level { get; init; }
}

public class GuestSessionResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}

public class RegisterRequestDto
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public class RegisterResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
    public int MigratedProgressCount { get; init; }
}

public class LoginRequestDto
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}

public class LoginResponseDto
{
    public string AccessToken { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}

public class UserProfileDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Email { get; init; }
    public bool IsGuest { get; init; }
    public int TotalXP { get; init; }
    public int Level { get; init; }
    public int CompletedChallengesCount { get; init; }
    public DateTime CreatedAt { get; init; }
}
```

---

### 4.2. Módulo de Catálogo (`Dtos/Catalog/`)

```csharp
namespace AwsQuest.Application.Dtos.Catalog;

using AwsQuest.Domain.Enums;

public class UnitResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int OrderIndex { get; init; }
    public List<CatalogChallengeDto> Challenges { get; init; } = [];
}

public class CatalogChallengeDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public DifficultyLevel Difficulty { get; init; }
    public ChallengeMode Mode { get; init; }
    public int BaseXP { get; init; }
    public int RequiredXP { get; init; }
    public int OrderIndex { get; init; }
    public bool IsLocked { get; init; }
    public string? LockReason { get; init; }
    public ChallengeProgressSummaryDto? UserProgress { get; init; }
}

public class ChallengeProgressSummaryDto
{
    public ProgressStatus Status { get; init; } = ProgressStatus.NotStarted;
    public int HighScore { get; init; }
    public int HintsUsed { get; init; }
    public DateTime? CompletedAt { get; init; }
}
```

---

### 4.3. Módulo de Desafío y Pistas (`Dtos/Challenge/`)

```csharp
namespace AwsQuest.Application.Dtos.Challenge;

using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;

public class ChallengeDetailResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public DifficultyLevel Difficulty { get; init; }
    public ChallengeMode Mode { get; init; }
    public int BaseXP { get; init; }
    public List<ChallengeAllowedServiceDto> AllowedServices { get; init; } = [];
    public HintsSummaryDto HintsSummary { get; init; } = new();
    public SemanticGraph? LastAttemptGraph { get; init; }
}

public class ChallengeAllowedServiceDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public int? MaxInstances { get; init; }
    public bool IsDistractor { get; init; }
}

public class HintsSummaryDto
{
    public int TotalHints { get; init; }
    public int UnlockedCount { get; init; }
    public List<UnlockedHintDto> UnlockedHints { get; init; } = [];
}

public class UnlockedHintDto
{
    public int OrderIndex { get; init; }
    public string Text { get; init; } = string.Empty;
    public int PenaltyApplied { get; init; }
}

public class UnlockHintResponseDto
{
    public UnlockedHintDto UnlockedHint { get; init; } = new();
    public int TotalHintsUnlocked { get; init; }
    public int TotalPenaltyAccumulated { get; init; }
}
```

---

### 4.4. Módulo de Evaluación e Historial (`Dtos/Evaluation/`)

```csharp
namespace AwsQuest.Application.Dtos.Evaluation;

using AwsQuest.Domain.Engine.Models;

public class EvaluateArchitectureRequestDto
{
    public SemanticGraph Graph { get; init; } = new();
    public int HintsUsed { get; init; }
}

public class EvaluateArchitectureResponseDto
{
    public int Score { get; init; }
    public bool Passed { get; init; }
    public bool IsNewHighScore { get; init; }
    public int EarnedXP { get; init; }
    public int CurrentUserXP { get; init; }
    public int CurrentUserLevel { get; init; }
    public EvaluationFeedback Feedback { get; init; } = new();
    public Guid AttemptId { get; init; }
}

public class ChallengeAttemptHistoryDto
{
    public Guid Id { get; init; }
    public int Score { get; init; }
    public bool Passed { get; init; }
    public int HintsUsed { get; init; }
    public DateTime CreatedAt { get; init; }
    public SemanticGraph GraphSubmitted { get; init; } = new();
}
```

---

### 4.5. Módulo de Servicios Maestros (`Dtos/MasterServices/`)

```csharp
namespace AwsQuest.Application.Dtos.MasterServices;

public class AwsServiceResponseDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string ShortDescription { get; init; } = string.Empty;
    public string IconUrl { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
```

---

### 4.6. Módulo de Configuración del Sistema (`Dtos/SystemConfig/`)

```csharp
namespace AwsQuest.Application.Dtos.SystemConfig;

using AwsQuest.Domain.Enums;

public class SystemConfigResponseDto
{
    public AccessMode AccessMode { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class UpdateSystemConfigRequestDto
{
    public AccessMode AccessMode { get; init; }
}
```

---

## 5. Validadores Declarativos con FluentValidation (`Validators/`)

### 5.1. `RegisterRequestDtoValidator.cs`

**Reglas de Validación:**
* **`Email`:**
  * Requerido (no nulo ni vacío).
  * Formato de email válido (`EmailAddress()`).
  * Longitud máxima de 256 caracteres.
* **`Password`:**
  * Requerido (no nulo ni vacío).
  * Longitud mínima de 8 caracteres y máxima de 128 caracteres.
  * Debe contener al menos una letra mayúscula, una letra minúscula y un número o símbolo especial.
* **`Name`:**
  * Requerido (no nulo ni vacío).
  * Longitud mínima de 2 caracteres y máxima de 100 caracteres.

```csharp
namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.Auth;

public class RegisterRequestDtoValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.")
            .MaximumLength(256).WithMessage("El correo electrónico no puede exceder 256 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
            .MaximumLength(128).WithMessage("La contraseña no puede exceder 128 caracteres.")
            .Matches(@"[A-Z]").WithMessage("La contraseña debe contener al menos una letra mayúscula.")
            .Matches(@"[a-z]").WithMessage("La contraseña debe contener al menos una letra minúscula.")
            .Matches(@"[0-9]|[^a-zA-Z0-9]").WithMessage("La contraseña debe contener al menos un número o símbolo especial.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres.");
    }
}
```

---

### 5.2. `LoginRequestDtoValidator.cs`

**Reglas de Validación:**
* **`Email`:** Requerido y formato de email válido.
* **`Password`:** Requerido.

```csharp
namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.Auth;

public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo electrónico es obligatorio.")
            .EmailAddress().WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria.");
    }
}
```

---

### 5.3. `UpdateSystemConfigRequestDtoValidator.cs`

**Reglas de Validación:**
* **`AccessMode`:** Debe ser un valor válido del enum `AccessMode` (`OpenAccess` = 1 o `Progressive` = 2).

```csharp
namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Domain.Enums;

public class UpdateSystemConfigRequestDtoValidator : AbstractValidator<UpdateSystemConfigRequestDto>
{
    public UpdateSystemConfigRequestDtoValidator()
    {
        RuleFor(x => x.AccessMode)
            .IsInEnum().WithMessage("El modo de acceso especificado no es válido.");
    }
}
```

---

### 5.4. `EvaluateArchitectureRequestDtoValidator.cs`

**Reglas de Validación:**
* **`Graph`:** No nulo.
* **`Graph.Components`:** Debe contener al menos 1 componente arquitectónico.
* **`GraphComponent`:** Cada componente debe tener `Id` no vacío y `ServiceCode` no vacío.
* **`GraphConnection`:** Cada conexión debe referenciar `FromComponentId` y `ToComponentId` válidos que existan dentro de la lista `Components` del grafo.
* **`HintsUsed`:** Mayor o igual a 0.

```csharp
namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine.Models;

public class EvaluateArchitectureRequestDtoValidator : AbstractValidator<EvaluateArchitectureRequestDto>
{
    public EvaluateArchitectureRequestDtoValidator()
    {
        RuleFor(x => x.Graph)
            .NotNull().WithMessage("El grafo semántico de arquitectura no puede ser nulo.");

        RuleFor(x => x.Graph.Components)
            .NotEmpty().WithMessage("La arquitectura debe contener al menos un servicio colocado en el canvas.");

        RuleForEach(x => x.Graph.Components).SetValidator(new GraphComponentValidator());

        RuleForEach(x => x.Graph.Connections).SetValidator(new GraphConnectionValidator());

        RuleFor(x => x.Graph)
            .Must(HaveValidConnectionEndpoints)
            .WithMessage("Todas las conexiones deben enlazar componentes existentes dentro de la arquitectura.");

        RuleFor(x => x.HintsUsed)
            .GreaterThanOrEqualTo(0).WithMessage("El número de pistas utilizadas no puede ser negativo.");
    }

    private bool HaveValidConnectionEndpoints(SemanticGraph graph)
    {
        if (graph.Connections.Count == 0) return true;
        var componentIds = graph.Components.Select(c => c.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        return graph.Connections.All(conn => 
            componentIds.Contains(conn.FromComponentId) && 
            componentIds.Contains(conn.ToComponentId));
    }
}

public class GraphComponentValidator : AbstractValidator<GraphComponent>
{
    public GraphComponentValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El identificador del componente de arquitectura no puede estar vacío.");

        RuleFor(x => x.ServiceCode)
            .NotEmpty().WithMessage("El código del servicio AWS asociado al componente no puede estar vacío.");
    }
}

public class GraphConnectionValidator : AbstractValidator<GraphConnection>
{
    public GraphConnectionValidator()
    {
        RuleFor(x => x.FromComponentId)
            .NotEmpty().WithMessage("El identificador del nodo de origen no puede estar vacío.");

        RuleFor(x => x.ToComponentId)
            .NotEmpty().WithMessage("El identificador del nodo de destino no puede estar vacío.");

        RuleFor(x => x)
            .Must(x => !string.Equals(x.FromComponentId, x.ToComponentId, StringComparison.OrdinalIgnoreCase))
            .WithMessage("Un componente no puede conectarse a sí mismo.");
    }
}
```

---

## 6. Registro de Servicios de Validación (`DependencyInjection.cs`)

En `AwsQuest.Application/DependencyInjection.cs`:

```csharp
namespace AwsQuest.Application;

using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
```

---

## 7. Suite de Pruebas Unitarias (`AwsQuest.UnitTests/Validators/`)

Se desarrollará una suite completa de pruebas unitarias xUnit utilizando `FluentValidation.TestHelper` y `FluentAssertions` para verificar todas las ramas y condiciones de frontera:

### 7.1. Casos de Prueba Previstos:
1. **`RegisterRequestDtoValidatorTests`:**
   * Email válido / Email inválido (sin `@`, sin dominio, nulo).
   * Password débil (menos de 8 caracteres, sin mayúscula, sin minúscula, sin dígito/símbolo).
   * Password válido y robusto.
   * Name vacío / Name con menos de 2 caracteres / Name con más de 100 caracteres.
2. **`LoginRequestDtoValidatorTests`:**
   * Credenciales completas válidas.
   * Email ausente o con formato inválido.
   * Password ausente.
3. **`UpdateSystemConfigRequestDtoValidatorTests`:**
   * Modo de acceso válido (`OpenAccess`, `Progressive`).
   * Valor numérico fuera de rango del enum.
4. **`EvaluateArchitectureRequestDtoValidatorTests`:**
   * Grafo con componentes válidos y conexiones consistentes.
   * Grafo vacío (sin componentes).
   * Conexión con componente de origen inexistente en la lista de nodos.
   * Conexión autorreferencial (`FromComponentId == ToComponentId`).
   * `HintsUsed` negativo.

---

## 8. Matriz de Trazabilidad Técnica

| Requisito / Contrato | DTO / Validador en la Spec | Estado |
| :--- | :--- | :--- |
| **Envelope Estándar** | `ApiResponse<T>`, `ApiErrorResponse`, `ApiMetaDto`, `ErrorCodes` | Totalmente especificado |
| **Autenticación (CU-08 / RF-20)** | `GuestSessionResponseDto`, `RegisterRequestDto`, `LoginRequestDto`, `UserProfileDto`, `RegisterRequestDtoValidator`, `LoginRequestDtoValidator` | Totalmente especificado |
| **Catálogo (CU-01 / RF-01)** | `UnitResponseDto`, `CatalogChallengeDto`, `ChallengeProgressSummaryDto` | Totalmente especificado |
| **Workspace y Pistas (CU-02, CU-04)** | `ChallengeDetailResponseDto`, `ChallengeAllowedServiceDto`, `HintsSummaryDto`, `UnlockedHintDto`, `UnlockHintResponseDto` | Totalmente especificado |
| **Evaluación (CU-05 / RF-13 a RF-19)** | `EvaluateArchitectureRequestDto`, `EvaluateArchitectureResponseDto`, `ChallengeAttemptHistoryDto`, `EvaluateArchitectureRequestDtoValidator` | Totalmente especificado |
| **Servicios Maestros y Config** | `AwsServiceResponseDto`, `SystemConfigResponseDto`, `UpdateSystemConfigRequestDto`, `UpdateSystemConfigRequestDtoValidator` | Totalmente especificado |
