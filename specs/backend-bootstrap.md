# Especificación de Backend Bootstrap - AWS Architecture Quest

## 1. Introducción y Propósito

Este documento establece la especificación técnica formal para la inicialización y estructuración base (*bootstrap*) del Backend de la plataforma **AWS Architecture Quest**. 

El backend es responsable de:
1. Exponer la API REST consumida por el cliente web SPA (`apps/web`) y futuros clientes móviles.
2. Ejecutar de forma aislada, determinista y de alto rendimiento el **Motor de Evaluación de Arquitecturas AWS (`EvaluationEngine`)**.
3. Gestionar la persistencia híbrida relacional y documental (`JSONB`) sobre **PostgreSQL** mediante **Entity Framework Core 10**.
4. Administrar la autenticación con JWT, el acceso inmediato en **Modo Invitado (Guest Mode)** y la migración atómica de progreso a cuentas registradas.
5. Garantizar el cálculo transaccional de Puntos de Experiencia (XP), récords (*High Score*) y auditoría de intentos.

---

## 2. Estilo Arquitectónico y Principios Rectores

El backend adopta el patrón **Clean Architecture (Onion / Hexagonal)** sobre **.NET 10 (ASP.NET Core Web API / C#)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        AwsQuest.Api (Presentation)                    │
│    Controllers REST (/api/v1), Swagger/OpenAPI, Middlewares, CORS     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             AwsQuest.Infrastructure (External Concerns)          │  │
│  │    AppDbContext (EF Core 10 + Npgsql), Migrations, JWT, Seeder   │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │             AwsQuest.Application (Use Cases / Ports)       │  │  │
│  │  │    Application Services, DTOs, FluentValidation, Interfaces│  │  │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │  │
│  │  │  │           AwsQuest.Domain (Core Business Rules)      │  │  │  │
│  │  │  │    Entities, Enums, EvaluationEngine, Domain Rules   │  │  │  │
│  │  │  └──────────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Principios Rectores de Diseño
* **Independencia del Dominio:** `AwsQuest.Domain` no tiene dependencias de ningún framework web, ORM, base de datos o paquetes externos. El `EvaluationEngine` opera 100% en memoria recibiendo modelos puros.
* **Inversión de Dependencias (DIP):** Las capas internas definen interfaces (*Ports*) y las capas externas implementan dichas interfaces (*Adapters*).
* **Flujo Unidireccional de Dependencias:** El flujo de referencias del compilador apunta siempre hacia el centro (`Api -> Infrastructure -> Application -> Domain`).
* **Agnóstico de Clientes:** La API entrega contratos JSON normalizados según `08-api-spec.md`, sin acoplamientos a React Flow o librerías de interfaz gráfica.

---

## 3. Módulos Funcionales del Sistema

| Módulo | Responsabilidad Funcional | Reglas / Casos de Uso Vinculados |
| :--- | :--- | :--- |
| **Auth & Session** | Emisión y validación de JWT, generación de sesiones anónimas (Modo Invitado), registro, login y migración atómica de progreso de invitado a cuenta definitiva. | RF-20, RN-13, CU-08 |
| **Catalog & Units** | Consulta de unidades temáticas y desafíos asociados según la política de acceso activa (Open Access vs Progressive) y proyección de progreso del usuario. | RF-01, RF-02, RN-01, CU-01 |
| **Challenge Workspace** | Detalle completo de un desafío, restricciones de servicios permitidos, distractores, límites de instancias y estado de pistas. | RF-03 a RF-06, RN-03, RN-04, CU-02 |
| **Hints** | Desbloqueo secuencial de pistas educativas y cálculo acumulativo de penalizaciones de puntaje. | RF-14, RF-15, RN-06, RN-07, CU-04 |
| **Evaluation Engine** | Motor de evaluación en memoria. Valida grafo semántico, servicios requeridos/prohibidos, conexiones válidas, detección de antipatrones (SPOF, exposición BD) y cálculo de puntaje (0-100). | RF-08 a RF-13, RN-02, RN-05, RN-08, CU-05, RNF-02 |
| **Progress & Attempts** | Registro de intentos de solución, actualización transaccional de High Score y cálculo de XP incremental sin refarmeo. | RF-16 a RF-18, RN-09, RN-10, RN-11, CU-05, CU-06 |
| **Master Services** | Catálogo maestro de servicios AWS (código, nombre, categoría, icono, estado). | RF-04, RNF-09 |
| **System Config** | Consulta y actualización de la política global de accesibilidad (OpenAccess / Progressive). | RF-19, RN-01, CU-07 |
| **Content Seeder** | Carga declarativa e inicialización de unidades y desafíos desde archivos JSON/YAML versionados en Git hacia PostgreSQL. | RNF-08 |

---

## 4. Responsabilidad y Especificación de Capas

### 4.1. Capa de Dominio (`AwsQuest.Domain`)
La capa central y pura de la solución.
* **Contenido:**
  * **Entidades de Negocio:** `SystemConfig`, `User`, `Unit`, `AwsService`, `Challenge`, `ChallengeService`, `UserProgress`, `ChallengeAttempt`.
  * **Enums de Dominio:** `AccessMode`, `DifficultyLevel`, `ProgressStatus`, `FeedbackItemStatus`, `FeedbackCategory`, `ConnectionType`.
  * **Motor de Evaluación (`EvaluationEngine`):**
    * Modelos de entrada del grafo semántico: `SemanticGraph`, `GraphComponent`, `GraphConnection`.
    * Modelos de reglas declarativas: `ChallengeEvaluationRules`, `RequiredConnectionRule`, `AntiPatternRule`.
    * Modelos de salida de evaluación: `EvaluationResult`, `FeedbackItem`.
    * Evaluadores especializados: `ServicePresenceEvaluator`, `ConnectionEvaluator`, `AntiPatternEvaluator`, `ScoreCalculator`.
  * **Excepciones de Dominio:** `DomainException`, `InvalidGraphException`, `ServiceLimitExceededException`.
* **Restricción:** No referencia ningún proyecto ni paquete NuGet de terceros salvo librerías del BCL de .NET.

### 4.2. Capa de Aplicación (`AwsQuest.Application`)
Orquesta la lógica de los casos de uso del sistema.
* **Contenido:**
  * **DTOs de Petición y Respuesta:** Mapeados exactamente según `08-api-spec.md` (`RegisterDto`, `LoginDto`, `AuthResponseDto`, `UnitCatalogDto`, `ChallengeDetailDto`, `EvaluateArchitectureDto`, `EvaluationResponseDto`, `UnlockHintResultDto`, etc.).
  * **Envelopes Estándar:** `ApiResponse<T>`, `ApiErrorResponse`, `ApiErrorDetail`, `PaginationMeta`.
  * **Servicios / Casos de Uso:**
    * `IAuthService` / `AuthService`
    * `ICatalogService` / `CatalogService`
    * `IChallengeService` / `ChallengeService`
    * `IEvaluationService` / `EvaluationService`
    * `IHintService` / `HintService`
    * `ISystemConfigService` / `SystemConfigService`
    * `IAwsMasterService` / `AwsMasterService`
  * **Interfaces de Abstracción de Infraestructura (Ports):**
    * `IAppDbContext` (o Repositorios específicos si aplica)
    * `IJwtService` (Generación y validación de Claims JWT)
    * `IPasswordHasher` (Hashing seguro de contraseñas)
    * `ICurrentUserContext` (Extracción de usuario actual e `isGuest` desde claims)
    * `IChallengeContentReader` (Lectura de archivos declarativos de desafíos)
  * **Validadores FluentValidation:** `RegisterDtoValidator`, `LoginDtoValidator`, `EvaluateArchitectureDtoValidator`, `UpdateSystemConfigDtoValidator`.
  * **Mapeadores:** Funciones de extensión o perfiles de mapeo entre Entidades, DTOs y modelos de Grafo.

### 4.3. Capa de Infraestructura (`AwsQuest.Infrastructure`)
Implementa las interfaces definidas en la capa de aplicación y gestiona el acceso a recursos externos.
* **Contenido:**
  * **Persistencia (EF Core 10 + PostgreSQL):**
    * `AppDbContext` heredando de `DbContext` e implementando `IAppDbContext`.
    * Configuraciones Fluent API (`IEntityTypeConfiguration<T>`) para cada entidad.
    * Mapeo de columnas JSONB (`evaluation_rules_json`, `hints_json`, `graph_submitted_json`, `evaluation_result_json`, `last_attempt_graph_json`).
    * Migraciones automáticas de EF Core (`Migrations/`).
  * **Servicios de Seguridad y Criptografía:**
    * `JwtService` implementando `IJwtService` mediante `Microsoft.IdentityModel.Tokens`.
    * `PasswordHasher` implementando `IPasswordHasher` mediante algoritmo BCrypt o Argon2id.
  * **Gestión de Contenido Declarativo:**
    * `JsonChallengeContentReader` para deserializar archivos de contenido en `content/challenges/`.
    * `ChallengeSeeder` para sincronizar el catálogo de PostgreSQL con los archivos declarativos en arranque o migración.

### 4.4. Capa de Presentación / API (`AwsQuest.Api`)
Punto de entrada HTTP y configuración del host ASP.NET Core.
* **Contenido:**
  * **Controladores REST (`Controllers/`):**
    * `AuthController` (`POST /api/v1/auth/guest`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`)
    * `UnitsController` (`GET /api/v1/units`)
    * `ChallengesController` (`GET /api/v1/challenges/{id}`, `POST /api/v1/challenges/{id}/hints/unlock`, `POST /api/v1/challenges/{id}/evaluate`, `GET /api/v1/challenges/{id}/attempts`)
    * `ServicesController` (`GET /api/v1/services`)
    * `SystemConfigController` (`GET /api/v1/system/config`, `PATCH /api/v1/system/config`)
  * **Middlewares:**
    * `ApiExceptionMiddleware` / `IExceptionHandler`: Captura global de excepciones, transformándolas en `ApiErrorResponse` con los códigos de error unificados (`CHALLENGE_NOT_FOUND`, `INVALID_GRAPH_PAYLOAD`, `EMAIL_ALREADY_EXISTS`, etc.).
  * **Filtros y Configuración:**
    * Configuración de CORS para el Frontend Vite (`http://localhost:5173`).
    * Configuración de Autenticación JWT Bearer en el pipeline (`AddJwtBearer`).
    * Configuración de Swagger / OpenAPI con esquema Bearer Auth.
    * Inicialización en `Program.cs`.

### 4.5. Proyectos de Pruebas (`tests/`)
* **`AwsQuest.UnitTests`:**
  * Pruebas unitarias completas del `EvaluationEngine` (cálculo de puntajes, detección de SPOF, validación de conexiones, penalización de pistas).
  * Pruebas de validadores FluentValidation.
  * Pruebas de lógica de cálculo de XP y High Scores.
* **`AwsQuest.IntegrationTests`:**
  * Pruebas de integración de endpoints REST con `WebApplicationFactory<Program>`.
  * Pruebas de persistencia contra base de datos PostgreSQL real (Testcontainers) o PostgreSQL de prueba.

---

## 5. Matriz de Dependencias Permitidas entre Proyectos

```text
┌──────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Proyecto                 │ Dependencias de Proyecto Permitidas                         │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ AwsQuest.Domain          │ Ninguna (Cero dependencias)                                 │
│ AwsQuest.Application     │ AwsQuest.Domain                                             │
│ AwsQuest.Infrastructure  │ AwsQuest.Application, AwsQuest.Domain                       │
│ AwsQuest.Api             │ AwsQuest.Application, AwsQuest.Infrastructure               │
│ AwsQuest.UnitTests       │ AwsQuest.Domain, AwsQuest.Application                       │
│ AwsQuest.IntegrationTests│ AwsQuest.Api, AwsQuest.Infrastructure, AwsQuest.Application │
└──────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### Reglas Estrictas de Referencia:
1. `AwsQuest.Domain` **NUNCA** debe referenciar a `Application`, `Infrastructure`, `Api` ni librerías de Entity Framework.
2. `AwsQuest.Application` **NUNCA** debe referenciar a `Infrastructure` ni a `Api`.
3. Los controladores en `AwsQuest.Api` solo deben interactuar con interfaces y DTOs de `AwsQuest.Application`. Nunca deben inyectar `AppDbContext` directamente.

---

## 6. Stack Tecnológico, Paquetes NuGet y Versiones

### 6.1. Runtime y Compilador
* **Target Framework:** `.NET 10.0` (`net10.0`)
* **Lenguaje:** `C# 14` / `preview`
* **Nullable Reference Types:** Activado (`<Nullable>enable</Nullable>`)
* **Implicit Usings:** Activado (`<ImplicitUsings>enable</ImplicitUsings>`)
* **Treat Warnings As Errors:** Activado para compilaciones Release (`<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`)

### 6.2. Paquetes NuGet por Proyecto

#### `AwsQuest.Domain`
No requiere paquetes externos (utiliza exclusivamente el runtime base de .NET).

#### `AwsQuest.Application`
| Paquete | Versión Recomendada | Propósito |
| :--- | :--- | :--- |
| `FluentValidation` | `11.11.0` (o compatible .NET 10) | Validación declarativa y fuertemente tipada de DTOs. |
| `FluentValidation.DependencyInjectionExtensions` | `11.11.0` | Registro automático de validadores en el contenedor de DI. |

#### `AwsQuest.Infrastructure`
| Paquete | Versión Recomendada | Propósito |
| :--- | :--- | :--- |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | `9.0.3` / `10.0.*` | Proveedor PostgreSQL para EF Core con soporte nativo de JSONB. |
| `Microsoft.EntityFrameworkCore` | `9.0.2` / `10.0.*` | Core de ORM Entity Framework. |
| `Microsoft.EntityFrameworkCore.Relational` | `9.0.2` / `10.0.*` | Soporte relacional para EF Core. |
| `Microsoft.EntityFrameworkCore.Design` | `9.0.2` / `10.0.*` | Herramientas de diseño para generación de migraciones (`dotnet ef`). |
| `BCrypt.Net-Next` | `4.0.3` | Hashing seguro de contraseñas de usuarios. |
| `System.IdentityModel.Tokens.Jwt` | `8.6.0` (o compatible) | Creación y firma de tokens JWT para usuarios e invitados. |
| `Microsoft.IdentityModel.Tokens` | `8.6.0` (o compatible) | Utilidades de claves criptográficas y validación de tokens. |

#### `AwsQuest.Api`
| Paquete | Versión Recomendada | Propósito |
| :--- | :--- | :--- |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | `9.0.2` / `10.0.*` | Middleware de autenticación Bearer JWT para ASP.NET Core. |
| `Microsoft.AspNetCore.OpenApi` | `9.0.2` / `10.0.*` | Soporte nativo de especificaciones OpenAPI en ASP.NET Core. |
| `Swashbuckle.AspNetCore` | `7.3.1` (o Scalar `Scalar.AspNetCore`) | Interfaz Swagger UI interactiva para documentación de API. |
| `Microsoft.EntityFrameworkCore.Tools` | `9.0.2` / `10.0.*` | Comandos de consola de Package Manager para migraciones. |

#### `AwsQuest.UnitTests`
| Paquete | Versión Recomendada | Propósito |
| :--- | :--- | :--- |
| `xunit` | `2.9.3` | Framework de pruebas unitarias. |
| `xunit.runner.visualstudio` | `3.0.2` | Ejecutor de tests para CLI y Visual Studio. |
| `FluentAssertions` | `7.2.0` (o compatible) | Assertions fluidas y legibles para pruebas. |
| `NSubstitute` o `Moq` | `5.3.0` / `4.20.72` | Mocking de dependencias e interfaces. |
| `Microsoft.NET.Test.Sdk` | `17.13.0` | SDK de testing de .NET. |

---

## 7. Estructura de Carpetas del Backend (`apps/api/`)

La solución backend se ubica en `apps/api/` dentro del monorepo:

```text
apps/api/
├── AwsQuest.sln
├── src/
│   ├── AwsQuest.Domain/
│   │   ├── Entities/
│   │   │   ├── SystemConfig.cs
│   │   │   ├── User.cs
│   │   │   ├── Unit.cs
│   │   │   ├── AwsService.cs
│   │   │   ├── Challenge.cs
│   │   │   ├── ChallengeService.cs
│   │   │   ├── UserProgress.cs
│   │   │   └── ChallengeAttempt.cs
│   │   ├── Enums/
│   │   │   ├── AccessMode.cs
│   │   │   ├── DifficultyLevel.cs
│   │   │   ├── ProgressStatus.cs
│   │   │   ├── FeedbackCategory.cs
│   │   │   └── FeedbackItemStatus.cs
│   │   ├── Engine/
│   │   │   ├── EvaluationEngine.cs
│   │   │   ├── Models/
│   │   │   │   ├── SemanticGraph.cs
│   │   │   │   ├── GraphComponent.cs
│   │   │   │   ├── GraphConnection.cs
│   │   │   │   ├── ChallengeEvaluationRules.cs
│   │   │   │   ├── EvaluationResult.cs
│   │   │   │   └── FeedbackItem.cs
│   │   │   └── Evaluators/
│   │   │       ├── ISubEvaluator.cs
│   │   │       ├── ServicePresenceEvaluator.cs
│   │   │       ├── ConnectionValidator.cs
│   │   │       ├── AntiPatternEvaluator.cs
│   │   │       └── ScoreCalculator.cs
│   │   ├── Exceptions/
│   │   │   ├── DomainException.cs
│   │   │   ├── InvalidGraphException.cs
│   │   │   └── ServiceLimitExceededException.cs
│   │   └── AwsQuest.Domain.csproj
│   │
│   ├── AwsQuest.Application/
│   │   ├── Common/
│   │   │   ├── Models/
│   │   │   │   ├── ApiResponse.cs
│   │   │   │   ├── ApiErrorResponse.cs
│   │   │   │   └── ErrorCodes.cs
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAppDbContext.cs
│   │   │   │   ├── IJwtService.cs
│   │   │   │   ├── IPasswordHasher.cs
│   │   │   │   ├── ICurrentUserContext.cs
│   │   │   │   └── IChallengeContentReader.cs
│   │   │   └── Exceptions/
│   │   │       ├── NotFoundException.cs
│   │   │       ├── UnauthorizedException.cs
│   │   │       ├── ForbiddenException.cs
│   │   │       ├── ConflictException.cs
│   │   │       └── ValidationException.cs
│   │   ├── Dtos/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterDto.cs
│   │   │   │   ├── LoginDto.cs
│   │   │   │   ├── UserDto.cs
│   │   │   └── AuthResponseDto.cs
│   │   │   ├── Catalog/
│   │   │   │   ├── UnitCatalogDto.cs
│   │   │   │   ├── ChallengeSummaryDto.cs
│   │   │   │   └── UserProgressSummaryDto.cs
│   │   │   ├── Challenge/
│   │   │   │   ├── ChallengeDetailDto.cs
│   │   │   │   ├── AllowedServiceDto.cs
│   │   │   │   ├── HintsSummaryDto.cs
│   │   │   │   └── UnlockedHintDto.cs
│   │   │   ├── Evaluation/
│   │   │   │   ├── EvaluateArchitectureDto.cs
│   │   │   │   ├── GraphPayloadDto.cs
│   │   │   │   ├── EvaluationResponseDto.cs
│   │   │   │   └── AttemptHistoryDto.cs
│   │   │   ├── MasterServices/
│   │   │   │   └── AwsMasterServiceDto.cs
│   │   │   └── SystemConfig/
│   │   │       ├── SystemConfigDto.cs
│   │   │       └── UpdateSystemConfigDto.cs
│   │   ├── Validators/
│   │   │   ├── RegisterDtoValidator.cs
│   │   │   ├── LoginDtoValidator.cs
│   │   │   ├── EvaluateArchitectureDtoValidator.cs
│   │   │   └── UpdateSystemConfigDtoValidator.cs
│   │   ├── Services/
│   │   │   ├── IAuthService.cs
│   │   │   ├── AuthService.cs
│   │   │   ├── ICatalogService.cs
│   │   │   ├── CatalogService.cs
│   │   │   ├── IChallengeService.cs
│   │   │   ├── ChallengeService.cs
│   │   │   ├── IEvaluationService.cs
│   │   │   ├── EvaluationService.cs
│   │   │   ├── IHintService.cs
│   │   │   ├── HintService.cs
│   │   │   ├── ISystemConfigService.cs
│   │   │   ├── SystemConfigService.cs
│   │   │   ├── IAwsMasterService.cs
│   │   │   └── AwsMasterService.cs
│   │   ├── DependencyInjection.cs
│   │   └── AwsQuest.Application.csproj
│   │
│   ├── AwsQuest.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── SystemConfigConfiguration.cs
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── UnitConfiguration.cs
│   │   │   │   ├── AwsServiceConfiguration.cs
│   │   │   │   ├── ChallengeConfiguration.cs
│   │   │   │   ├── ChallengeServiceConfiguration.cs
│   │   │   │   ├── UserProgressConfiguration.cs
│   │   │   │   └── ChallengeAttemptConfiguration.cs
│   │   │   ├── Migrations/
│   │   │   └── Seeding/
│   │   │       ├── ChallengeSeeder.cs
│   │   │       └── JsonChallengeContentReader.cs
│   │   ├── Security/
│   │   │   ├── JwtService.cs
│   │   │   ├── PasswordHasher.cs
│   │   │   └── CurrentUserContext.cs
│   │   ├── DependencyInjection.cs
│   │   └── AwsQuest.Infrastructure.csproj
│   │
│   └── AwsQuest.Api/
│       ├── Controllers/
│       │   ├── BaseApiController.cs
│       │   ├── AuthController.cs
│       │   ├── UnitsController.cs
│       │   ├── ChallengesController.cs
│       │   ├── ServicesController.cs
│       │   └── SystemConfigController.cs
│       ├── Middlewares/
│       │   └── ApiExceptionMiddleware.cs
│       ├── Filters/
│       │   └── ApiResponseWrapperFilter.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Properties/
│       │   └── launchSettings.json
│       ├── Program.cs
│       └── AwsQuest.Api.csproj
│
└── tests/
    ├── AwsQuest.UnitTests/
    │   ├── Engine/
    │   │   ├── ServicePresenceEvaluatorTests.cs
    │   │   ├── ConnectionValidatorTests.cs
    │   │   ├── AntiPatternEvaluatorTests.cs
    │   │   └── EvaluationEngineTests.cs
    │   ├── Services/
    │   │   ├── AuthServiceTests.cs
    │   │   └── EvaluationServiceTests.cs
    │   ├── Validators/
    │   │   └── EvaluateArchitectureDtoValidatorTests.cs
    │   └── AwsQuest.UnitTests.csproj
    │
    └── AwsQuest.IntegrationTests/
        ├── AuthEndpointTests.cs
        ├── ChallengeEndpointTests.cs
        ├── EvaluationFlowIntegrationTests.cs
        └── AwsQuest.IntegrationTests.csproj
```

---

## 8. Configuración Inicial y Archivos Base

### 8.1. Contrato de Error Codes de la API (`ErrorCodes.cs`)
Constantes para serializar los códigos requeridos en `08-api-spec.md`:

```csharp
namespace AwsQuest.Application.Common.Models;

public static class ErrorCodes
{
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string ChallengeNotFound = "CHALLENGE_NOT_FOUND";
    public const string ChallengeLocked = "CHALLENGE_LOCKED";
    public const string InvalidGraphPayload = "INVALID_GRAPH_PAYLOAD";
    public const string ServiceLimitExceeded = "SERVICE_LIMIT_EXCEEDED";
    public const string AllHintsUnlocked = "ALL_HINTS_UNLOCKED";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
}
```

### 8.2. Envelopes de Respuesta de la API

```csharp
namespace AwsQuest.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public T Data { get; set; } = default!;
    public ApiMeta? Meta { get; set; }

    public static ApiResponse<T> Ok(T data, ApiMeta? meta = null) =>
        new() { Success = true, Data = data, Meta = meta ?? new ApiMeta { Timestamp = DateTime.UtcNow.ToString("o") } };
}

public class ApiErrorResponse
{
    public bool Success { get; set; } = false;
    public ApiErrorDetail Error { get; set; } = new();

    public static ApiErrorResponse Create(string code, string message, object? details = null) =>
        new()
        {
            Success = false,
            Error = new ApiErrorDetail
            {
                Code = code,
                Message = message,
                Details = details
            }
        };
}

public class ApiErrorDetail
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Details { get; set; }
}

public class ApiMeta
{
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
}
```

### 8.3. Configuración de Variables y Conexiones (`appsettings.Development.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=awsquest_db;Username=postgres;Password=postgres;Include Error Detail=true"
  },
  "JwtSettings": {
    "Secret": "SuperSecretKeyForDevelopmentOnlyDoNotUseInProduction1234567890!",
    "Issuer": "AwsQuestApi",
    "Audience": "AwsQuestClient",
    "ExpirationHours": 24,
    "GuestExpirationDays": 30
  },
  "ContentSettings": {
    "ChallengesPath": "../../content/challenges"
  },
  "CorsSettings": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173"
    ]
  }
}
```

### 8.4. Configuración de Inyección de Dependencias Modular

#### `AwsQuest.Application/DependencyInjection.cs`:
```csharp
namespace AwsQuest.Application;

using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using AwsQuest.Application.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICatalogService, CatalogService>();
        services.AddScoped<IChallengeService, ChallengeService>();
        services.AddScoped<IEvaluationService, EvaluationService>();
        services.AddScoped<IHintService, HintService>();
        services.AddScoped<ISystemConfigService, SystemConfigService>();
        services.AddScoped<IAwsMasterService, AwsMasterService>();

        return services;
    }
}
```

#### `AwsQuest.Infrastructure/DependencyInjection.cs`:
```csharp
namespace AwsQuest.Infrastructure;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Persistence.Seeding;
using AwsQuest.Infrastructure.Security;

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
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorCodesToAdd: null);
            }));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();
        services.AddScoped<IChallengeContentReader, JsonChallengeContentReader>();
        services.AddScoped<ChallengeSeeder>();

        return services;
    }
}
```

### 8.5. Pipeline Principal del Servidor (`AwsQuest.Api/Program.cs`)

```csharp
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AwsQuest.Application;
using AwsQuest.Infrastructure;
using AwsQuest.Infrastructure.Persistence.Seeding;
using AwsQuest.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// 1. Registro de Capas (Application e Infrastructure)
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Controladores con serialización JSON camelCase y enums como string
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddHttpContextAccessor();

// 3. Configuración CORS
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Configuración de Autenticación JWT Bearer
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Solo en desarrollo local
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Swagger / OpenAPI con esquema JWT Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AWS Architecture Quest API",
        Version = "v1",
        Description = "API REST de evaluación de arquitecturas AWS y progreso educativo."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Encabezado de autorización JWT usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Configuración del Pipeline de Middleware
app.UseMiddleware<ApiExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AWS Quest API v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 7. Seeding automático en desarrollo
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<ChallengeSeeder>();
    await seeder.SeedAsync();
}

app.Run();

// Exportación para pruebas de integración con WebApplicationFactory
public partial class Program { }
```

---

## 9. Configuración del Entorno de Desarrollo Local

### 9.1. Docker Compose para PostgreSQL (`docker-compose.yml`)
Ubicado en la raíz del proyecto para levantar la base de datos de desarrollo:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: awsquest-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: awsquest_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 9.2. Flujo de Comandos de Desarrollo (`dotnet CLI`)

```bash
# 1. Levantar el servicio de PostgreSQL
docker compose up -d postgres

# 2. Restaurar dependencias de la solución backend
cd apps/api
dotnet restore

# 3. Compilar solución completa
dotnet build

# 4. Crear la primera migración de EF Core
dotnet ef migrations add InitialCreate --project src/AwsQuest.Infrastructure --startup-project src/AwsQuest.Api

# 5. Aplicar migraciones a la base de datos PostgreSQL
dotnet ef database update --project src/AwsQuest.Infrastructure --startup-project src/AwsQuest.Api

# 6. Ejecutar pruebas unitarias
dotnet test tests/AwsQuest.UnitTests

# 7. Ejecutar el servidor backend en modo desarrollo (hot reload)
dotnet watch --project src/AwsQuest.Api
```

---

## 10. Reglas y Convenciones para Futuras Implementaciones

Para preservar la solidez arquitectónica, el equipo de desarrollo debe acatar las siguientes reglas:

### 10.1. Reglas de Controladores y Endpoints (API Layer)
1. **Controladores delgados (*Skinny Controllers*):** Ningún controlador debe contener lógica de negocio, validaciones complejas de grafos ni cálculos de puntaje.
2. **Cero persistencia directa:** Queda estrictamente prohibido inyectar `AppDbContext` o ejecutar queries LINQ en los controladores. Toda interacción debe canalizarse a través de servicios de `AwsQuest.Application`.
3. **Respuesta unificada:** Toda respuesta exitosa debe retornar envuelta en `ApiResponse<T>` y todo error debe capturarse en el middleware global retornando `ApiErrorResponse` con su correspondiente `ErrorCodes`.
4. **Asincronía obligatoria:** Todo método de acción debe ser `async Task<IActionResult>` y aceptar un `CancellationToken`.

### 10.2. Reglas del Motor de Evaluación (`EvaluationEngine`)
1. **Puro y Determinista:** El motor debe ser 100% síncrono/en memoria, determinista y libre de efectos secundarios o accesos a I/O.
2. **Sub-evaluadores especializados:** Cada regla arquitectónica debe implementarse como un componente desacoplado (`ServicePresenceEvaluator`, `ConnectionValidator`, `AntiPatternEvaluator`).
3. **Puntuación y Feedback Pedagógico:** Toda deducción de puntaje debe acompañarse de un `FeedbackItem` explicativo con categoría, estado y mensaje claro para el usuario.
4. **Cobertura de Tests al 100%:** Todo nuevo evaluador o regla de desafío debe incluir su suite de pruebas unitarias en `AwsQuest.UnitTests`.

### 10.3. Reglas de Persistencia y Transacciones (Infrastructure Layer)
1. **Transaccionalidad en Evaluaciones y XP:** La actualización de `UserProgress`, el guardado del `ChallengeAttempt` y la asignación incremental de `TotalXP` deben ejecutarse dentro de una transacción atómica `IDbContextTransaction` con aislamiento `ReadCommitted`.
2. **Idempotencia de Récords:** Si un intento posterior obtiene menor puntuación que el `highScore` actual, el `highScore` **no debe disminuir** ni debe sumarse XP adicional (RN-09 y RN-10).
3. **Consultas sin Tracking:** Todas las consultas de solo lectura (ej. listado de catálogo, detalle de desafío) deben utilizar `.AsNoTracking()` para optimizar memoria y tiempo de CPU.
4. **JSONB tipado:** Las columnas complejas se serializan mediante `System.Text.Json` con clases fuertemente tipadas en C# antes de su inserción en PostgreSQL.

### 10.4. Reglas de Modo Invitado y Seguridad
1. **Claims consistentes:** El JWT emitido en `/auth/guest` debe incluir `isGuest: true`, `sub: <guid_aleatorio>` y nombre descriptivo (`Invitado_XXXX`).
2. **Migración Atómica (RN-13):** Durante `/auth/register`, si se detecta un token de invitado en el header `Authorization`, la transferencia de registros `UserProgress` y `ChallengeAttempt` debe ejecutarse en una sola transacción antes de eliminar la sesión temporal.

---

## 11. Decisiones Técnicas y Preguntas de Definición

A continuación se detallan las decisiones arquitectónicas consolidadas y las consideraciones clave identificadas para la fase de construcción:

| Aspecto | Decisión Adoptada | Justificación Técnica |
| :--- | :--- | :--- |
| **Estilo de API** | **Controllers tradicionales de ASP.NET Core** | Mayor modularidad, soporte de filtros globales de respuesta (`ApiResponseWrapperFilter`), middlewares estructurados y clara división por controladores de funcionalidad. |
| **Hashing de Passwords** | **BCrypt.Net-Next** | Estándar de la industria, seguro contra ataques de diccionario y con factor de trabajo configurable. |
| **Gestión de Migraciones** | **EF Core Code-First Migrations** | Permite versionar los cambios del esquema PostgreSQL directamente en el repositorio Git. |
| **Serializador JSON** | **System.Text.Json** | Nativo de .NET 10, máximo rendimiento, soporte de conversores de Enums y configuración camelCase por defecto. |
| **Validación de DTOs** | **FluentValidation** | Separa las reglas de validación de los modelos DTO, facilitando tests unitarios independientes y desacoplados. |
| **Estrategia de Seeding** | **Declarativa basada en archivos JSON/YAML** | Permite editar y versionar desafíos pedagógicos en `content/challenges/` sin necesidad de recompilar código C#. |

---

## 12. Matriz de Verificación y Trazabilidad

Esta especificación de bootstrap ha sido verificada contra la documentación existente en `docs/`:

| Requisito / Documento Base | Sección en esta Spec | Estado |
| :--- | :--- | :--- |
| **`06-architecture.md` (Clean Architecture .NET 10 + Postgres)** | Secciones 2, 4, 5 y 7 | **100% Alineado** |
| **`07-data-model.md` (Esquema EF Core, JSONB y Transacciones XP)** | Secciones 4.1, 4.3, 8.4 y 10.3 | **100% Alineado** |
| **`08-api-spec.md` (Contratos REST, DTOs, Envelopes y ErrorCodes)** | Secciones 3, 4.2, 4.4, 8.1 y 8.2 | **100% Alineado** |
| **`09-frontend-bootstrap.md` (CORS, Base URL `/api/v1` y JWT)** | Secciones 8.3, 8.5 y 10.4 | **100% Alineado** |
| **`03-non-functional-requirements.md` (RNF-02 Evaluación < 2s)** | Secciones 2.1, 4.1 y 10.2 | **100% Alineado** |
| **`04-business-rules.md` (RN-01 a RN-13, HighScore, XP, Guest)** | Secciones 3, 8.1, 10.3 y 10.4 | **100% Alineado** |
