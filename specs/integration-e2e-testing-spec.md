# Especificación Técnica: Pruebas de Integración y End-to-End (E2E) (Fase 7 - Hito 7.1)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura, diseño modular, infraestructura de ejecución, contratos de prueba, Page Object Models (POM), suites de pruebas automatizadas y criterios de verificación para las **Pruebas de Integración del Backend** y las **Pruebas End-to-End (E2E) del Frontend**, correspondiente a la **Tarea 7.1** de la **Fase 7: Testing E2E, Accesibilidad y Preparación para Release MVP** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El objetivo primordial del Hito 7.1 es asegurar la calidad de software integral, la resiliencia en tiempo de ejecución y la verificación automatizada del 100% de los flujos de usuario (Casos de Uso **CU-01 a CU-08**), reglas de negocio (**RN-01 a RN-13**), requisitos funcionales (**RF-01 a RF-22**) y requisitos no funcionales (**RNF-01 a RNF-13**).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PIRÁMIDE DE TESTING Y ESTRATEGIA DE VERIFICACIÓN                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│                                       / \                                                                       │
│                                      /   \                                                                      │
│                                     / E2E \       Playwright (apps/web/e2e)                                     │
│                                    / Tests \      • Flujo Completo Invitado -> Desafío -> Evaluación -> Registro │
│                                   /---------\     • Canvas Drag & Drop, Conexiones, Pistas y Modales            │
│                                  /           \    • Modo Libre vs Progresivo, Restauración de Intentos y Tema   │
│                                 / Integration \                                                                 │
│                                /  Tests (.NET) \  WebApplicationFactory<Program> (AwsQuest.IntegrationTests)     │
│                               /-----------------\ • API REST Endpoints + PostgreSQL Real + Transacciones ACID    │
│                              /                   \• JWT Bearer Auth, Migración de Progreso y Seed Declarativo   │
│                             /     Unit Tests      \                                                             │
│                            /  xUnit & Vitest/RTL   \ 130 tests Backend (.NET 10) + 190 tests Frontend (React 19)│
│                           /-------------------------\                                                           │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos, Reglas de Negocio y Casos de Uso Vinculados

| Requerimiento / Regla / Caso | Descripción | Enfoque de Validación en Pruebas de Integración y E2E |
| :--- | :--- | :--- |
| **RF-01 / CU-01** | Catálogo de Unidades y Desafíos | Integración: `GET /api/v1/units` retorna unidades y desafíos enriquecidos con progreso del usuario autenticado.<br>E2E: Renderizado de acordeones, tarjetas con dificultad, XP y estados de bloqueo. |
| **RF-02 / RF-03 / CU-02** | Detalle de Desafío y Workspace | Integración: `GET /api/v1/challenges/{id}` sanitiza pistas no reveladas y entrega servicios permitidos.<br>E2E: Carga de 3 paneles (Contexto/Servicios/Canvas) y arquitectura inicial. |
| **RF-05 a RF-09 / CU-03 / CU-06** | Diagramación Drag & Drop y Reset | E2E: Arrastre desde paleta a lienzo, trazado de conexiones, badges de configuración técnica, validación de límites de instancias (**RN-04**) y confirmación de reseteo (**RN-11**). |
| **RF-10 a RF-12 / CU-04** | Sistema de Pistas y Penalizaciones | Integración: `POST /api/v1/challenges/{id}/hints/unlock` acumula penalizaciones secuenciales (**RN-06, RN-07**).<br>E2E: `HintUnlockModal` -> `HintDrawer` con texto revelado y descuento en nota final. |
| **RF-13 a RF-18 / CU-05** | Evaluación, Feedback y XP | Integración: `POST /api/v1/challenges/{id}/evaluate` valida grafo en memoria ($<2$s **RNF-02**), persiste `ChallengeAttempt`, actualiza `UserProgress` y calcula XP anti-farmeo (**RN-09, RN-10**).<br>E2E: `EvaluationModal` con `ScoreGauge` animado, lista de feedback formativo, `XpProgressBar` y `LevelUpModal`. |
| **RF-19 / RF-20 / CU-08** | Modo Invitado y Migración Transparente | Integración: `POST /api/v1/auth/guest` emite token anónimo; `POST /api/v1/auth/register` con token invitado promueve la cuenta conservando XP e historial (**RN-13**).<br>E2E: Usuario anónimo juega, gana XP, se registra y verifica persistencia del progreso. |
| **RF-04 / CU-07** | Políticas de Acceso al Contenido | Integración: `PATCH /api/v1/system/config` conmuta `OpenAccess` $\leftrightarrow$ `Progressive` recalculando candados (**RN-01**).<br>E2E: `AccessModeToggle` actualiza la UI bloqueando/desbloqueando desafíos en tiempo real. |
| **RNF-01 a RNF-13** | Rendimiento, A11y, Compatibilidad y Seguridad | Integración: Tiempos de respuesta de API $<200$ ms, integridad de reglas en servidor (**RNF-12**), persistencia transaccional ACID (**RNF-13**).<br>E2E: Compatibilidad Chromium/Firefox/WebKit (**RNF-10**), navegación por teclado y contraste accesible (**RNF-05**). |

---

## 3. Arquitectura de Pruebas de Integración del Backend (`AwsQuest.IntegrationTests`)

### 3.1. Estructura de Proyectos y Directorios

```text
apps/api/tests/AwsQuest.IntegrationTests/
├── AwsQuest.IntegrationTests.csproj            # Configuración xUnit, FluentAssertions, WebApplicationFactory
├── Infrastructure/
│   ├── CustomWebApplicationFactory.cs         # Host de prueba en memoria con base de datos real aislada
│   ├── IntegrationTestBase.cs                 # Clase base con inyección de HttpClient, DB Fixtures y Helpers
│   ├── TestDatabaseFixture.cs                 # Gestión de ciclo de vida de PostgreSQL, migraciones y seed
│   └── AuthTestHelpers.cs                     # Generadores de tokens y payloads de autenticación (Guest/User)
├── Controllers/
│   ├── AuthControllerIntegrationTests.cs      # Pruebas de Guest, Register, Login, Me y Migración
│   ├── UnitsControllerIntegrationTests.cs     # Pruebas de Catálogo, Progreso y Bloqueo Progresivo
│   ├── ChallengesControllerIntegrationTests.cs# Pruebas de Detalle, Workspace, Pistas y Sanitización
│   ├── EvaluationControllerIntegrationTests.cs# Pruebas de Evaluación, Scoring, Anti-Farmeo y Transacciones
│   ├── AttemptsControllerIntegrationTests.cs  # Pruebas de Consulta de Historial de Intentos
│   ├── ServicesControllerIntegrationTests.cs  # Pruebas de Catálogo Maestro de Servicios AWS
│   └── SystemConfigControllerIntegrationTests.cs # Pruebas de Cambio de Política Global de Acceso
└── Middlewares/
    └── GlobalErrorHandlingIntegrationTests.cs # Pruebas de Respuestas Canónicas de Error (400, 401, 403, 404, 500)
```

### 3.2. Infraestructura de Servidor y Persistencia de Prueba

#### 3.2.1. `CustomWebApplicationFactory.cs`
Implementa `WebApplicationFactory<Program>` para inicializar la API completa de ASP.NET Core (.NET 10) en memoria con su canal HTTP interno (`TestServer`), reconfigurando la cadena de conexión hacia la base de datos PostgreSQL de integración (`awsquest_test_db` o contenedor dedicado).

```csharp
namespace AwsQuest.IntegrationTests.Infrastructure;

using AwsQuest.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _connectionString;

    public CustomWebApplicationFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _connectionString,
                ["Jwt:SecretKey"] = "SuperSecretIntegrationTestingKey1234567890!@#$%",
                ["Jwt:Issuer"] = "AwsQuestApiTest",
                ["Jwt:Audience"] = "AwsQuestWebTest"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remover descriptor de DbContext preexistente
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Inyectar DbContext apuntando a la base de datos de integración
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(_connectionString);
            });
        });

        builder.ConfigureLogging(logging =>
        {
            logging.ClearProviders();
            logging.AddFilter(level => level >= LogLevel.Warning);
        });
    }
}
```

#### 3.2.2. `TestDatabaseFixture.cs` y `IntegrationTestBase.cs`
Gestiona la ejecución de migraciones EF Core, el seeder declarativo (`ChallengeSeeder`) y la limpieza/aislamiento de datos entre pruebas mediante transacciones o truncamiento de tablas de usuario (`users`, `user_progress`, `challenge_attempts`).

```csharp
namespace AwsQuest.IntegrationTests.Infrastructure;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

public class TestDatabaseFixture : IAsyncLifetime
{
    public string ConnectionString { get; }
    public CustomWebApplicationFactory Factory { get; private set; } = null!;

    public TestDatabaseFixture()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        ConnectionString = config.GetConnectionString("TestConnection")
            ?? config.GetConnectionString("DefaultConnection")
            ?? "Host=127.0.0.1;Port=5437;Database=awsquest_db;Username=postgres;Password=postgres;Include Error Detail=true";
    }

    public async Task InitializeAsync()
    {
        Factory = new CustomWebApplicationFactory(ConnectionString);

        // Ejecutar migraciones y seed inicial
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        var seeder = scope.ServiceProvider.GetRequiredService<IChallengeSeeder>();
        await seeder.SeedAsync();
    }

    public async Task ResetUserDataAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Limpiar datos transitorios conservando catálogo maestro y desafíos
        await context.Database.ExecuteSqlRawAsync(
            "TRUNCATE TABLE challenge_attempts, user_progress, users CASCADE;");
        
        // Asegurar configuración del sistema por defecto
        var systemConfig = await context.SystemConfigs.FirstOrDefaultAsync();
        if (systemConfig != null)
        {
            systemConfig.AccessMode = Domain.Enums.AccessMode.OpenAccess;
            await context.SaveChangesAsync();
        }
    }

    public Task DisposeAsync()
    {
        Factory.Dispose();
        return Task.CompletedTask;
    }
}
```

```csharp
namespace AwsQuest.IntegrationTests.Infrastructure;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Auth;
using FluentAssertions;
using Xunit;

[CollectionDefinition("DatabaseCollection")]
public class DatabaseCollection : ICollectionFixture<TestDatabaseFixture> { }

[Collection("DatabaseCollection")]
public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected readonly TestDatabaseFixture Fixture;
    protected readonly HttpClient Client;
    protected readonly JsonSerializerOptions JsonOptions;

    protected IntegrationTestBase(TestDatabaseFixture fixture)
    {
        Fixture = fixture;
        Client = fixture.Factory.CreateClient();
        JsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public virtual async Task InitializeAsync()
    {
        await Fixture.ResetUserDataAsync();
    }

    public virtual Task DisposeAsync() => Task.CompletedTask;

    protected async Task<GuestSessionResponseDto> CreateGuestSessionAsync()
    {
        var response = await Client.PostAsync("/api/v1/auth/guest", null);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<GuestSessionResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        envelope!.Data.Should().NotBeNull();
        return envelope.Data;
    }

    protected async Task<RegisterResponseDto> CreateRegisteredUserAsync(
        string email = "test@awsquest.io", 
        string password = "Password123!", 
        string name = "Cloud Architect")
    {
        var request = new RegisterRequestDto(email, password, name);
        var content = new StringContent(JsonSerializer.Serialize(request, JsonOptions), Encoding.UTF8, "application/json");
        var response = await Client.PostAsync("/api/v1/auth/register", content);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiResponse<RegisterResponseDto>>(body, JsonOptions);
        envelope.Should().NotBeNull();
        return envelope!.Data;
    }

    protected void SetAuthorizationToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
```

---

### 3.3. Matriz Exhaustiva de Pruebas de Integración por Endpoint

#### 3.3.1. `AuthControllerIntegrationTests.cs` (Autenticación y Migración)
* **`POST /api/v1/auth/guest`:**
  - Emite token JWT con claim `isGuest = true` y tiempo de expiración de 30 días.
  - Inserta usuario en BD con `IsGuest = true` y `Email = null`.
* **`POST /api/v1/auth/register` (Usuario Nuevo):**
  - Registra usuario con email único y contraseña hasheada en BCrypt.
  - Rechaza emails duplicados retornando HTTP 409 (`EMAIL_ALREADY_REGISTERED`).
  - Rechaza contraseñas débiles retornando HTTP 400 (`VALIDATION_ERROR`).
* **`POST /api/v1/auth/register` con Token de Invitado (Migración - RN-13 / CU-08):**
  - Usuario anónimo acumula XP resolviendo un desafío.
  - Se invoca `POST /api/v1/auth/register` con `Authorization: Bearer <guestToken>`.
  - Verifica que el registro en BD `users` se promueve in-place (`IsGuest = false`, `Email = registered@email.com`), conservando su `Id`, `TotalXp`, `UserProgress` y `ChallengeAttempt`.
  - El token nuevo emitido permite invocar `/api/v1/auth/me` con datos completos.
* **`POST /api/v1/auth/login`:**
  - Autentica con credenciales válidas emitiendo token de 24h.
  - Retorna HTTP 401 (`INVALID_CREDENTIALS`) ante contraseña incorrecta o email inexistente.
* **`GET /api/v1/auth/me`:**
  - Retorna perfil del usuario autenticado con `totalXP` y `level`.
  - Retorna HTTP 401 si no se envía header `Authorization`.

#### 3.3.2. `UnitsControllerIntegrationTests.cs` y `ChallengesControllerIntegrationTests.cs`
* **`GET /api/v1/units`:**
  - Retorna todas las unidades y desafíos ordenados por `OrderIndex`.
  - Incluye resumen de progreso del usuario activo (`progressStatus`, `highScore`).
  - En `OpenAccess`, todos los desafíos tienen `isLocked = false`.
  - En `Progressive`, los desafíos bloqueados tienen `isLocked = true` y `lockReason` descriptivo (**RN-01**).
* **`GET /api/v1/challenges/{id}`:**
  - Retorna detalle del desafío, catálogo de servicios permitidos con `maxInstances` y `hintsSummary`.
  - **Protección Anti-Cheat:** Verifica que el payload JSON **no** contiene los textos ni penalizaciones de las pistas que aún no han sido desbloqueadas por el usuario.
  - Retorna HTTP 403 (`CHALLENGE_LOCKED`) si el desafío está bloqueado en modo progresivo.
  - Retorna HTTP 404 (`CHALLENGE_NOT_FOUND`) ante ID inexistente.

#### 3.3.3. `HintsIntegrationTests.cs`
* **`POST /api/v1/challenges/{id}/hints/unlock`:**
  - Desbloquea la pista 1 de forma secuencial (**RN-06**).
  - Segundo llamado desbloquea la pista 2 acumulando penalización (**RN-07**).
  - Retorna HTTP 400 (`ALL_HINTS_UNLOCKED`) cuando se intenta desbloquear más allá del total de pistas disponibles.

#### 3.3.4. `EvaluationControllerIntegrationTests.cs` (Motor de Evaluación y Gamificación)
* **`POST /api/v1/challenges/{id}/evaluate`:**
  - **Evaluación Exitosa (Score $\ge 70$):** Envía arquitectura válida de `challenge-101` (S3 configurado correctamente). Verifica `passed = true`, `score = 100`, `earnedXP = 100`, actualización de `UserProgress.HighScore = 100`, `UserProgress.Status = Completed`, y registro de auditoría en `ChallengeAttempt`.
  - **Detección de Antipatrones (Score $< 70$):** Envía arquitectura de `challenge-201` con RDS público sin Multi-AZ. Verifica que el feedback contiene ítems de fallo (`AntiPattern`, `SinglePointOfFailure`), `passed = false`, `earnedXP = 0`.
  - **Fórmula Anti-Farmeo de XP (RN-10):**
    1. Intento 1: Obtiene score 75 $\rightarrow$ `earnedXP = 75`, `totalXP = 75`.
    2. Intento 2: Obtiene score 70 $\rightarrow$ `earnedXP = 0` (no supera récord), `totalXP = 75`, récord preservado en 75 (**RN-09**).
    3. Intento 3: Obtiene score 90 $\rightarrow$ `earnedXP = 15` ($90 - 75$), `totalXP = 90`.
  - **Deducción de Pistas:** Si el usuario desbloqueó pistas previas, el score máximo se deduce automáticamente.
  - **Rendimiento:** La petición completa de evaluación con persistencia ACID en PostgreSQL responde en menos de 200 ms (ampliamente inferior al límite de 2 segundos de **RNF-02**).

#### 3.3.5. `SystemConfigControllerIntegrationTests.cs`
* **`GET /api/v1/system/config`:** Retorna `accessMode` actual.
* **`PATCH /api/v1/system/config`:** Conmuta política a `Progressive`. Verifica que subsiguientes consultas a `GET /api/v1/units` aplican los bloqueos condicionales.

---

## 4. Arquitectura y Diseño de Pruebas End-to-End (E2E) del Frontend (Playwright)

### 4.1. Configuración de Playwright (`playwright.config.ts`)

Ubicación: `apps/web/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Ejecución secuencial controlada para escenarios con estado
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.VITE_APP_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run preview --workspace=@aws-quest/web -- --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

### 4.2. Estructura de Directorios y Page Object Models (POM)

```text
apps/web/e2e/
├── fixtures/
│   ├── baseTest.ts                             # Fixture personalizado con reset de sesión y helpers
│   └── testData.ts                             # Credenciales y payloads de prueba estandarizados
├── pom/
│   ├── CatalogPage.pom.ts                      # POM de Catálogo, Unidades, Filtros y AccessMode
│   ├── WorkspacePage.pom.ts                    # POM de Workspace, Drag & Drop, Canvas, Palette y Toolbar
│   ├── EvaluationModal.pom.ts                  # POM de Modal de Evaluación, ScoreGauge y FeedbackList
│   ├── HintDrawer.pom.ts                       # POM de Cajón de Pistas y Modal de Confirmación
│   ├── AttemptHistory.pom.ts                   # POM de Panel de Historial de Intentos y Restauración
│   ├── AuthModal.pom.ts                        # POM de Diálogo de Registro, Login y Migración
│   └── HeaderGamification.pom.ts               # POM de Header, XpProgressBar, Level y ThemeToggle
└── specs/
    ├── 01-guest-core-gameplay-loop.spec.ts     # Escenario 1: Flujo Invitado -> Solución -> XP -> Migración
    ├── 02-fix-architecture-evaluation.spec.ts  # Escenario 2: Iteración, Corrección de Errores y Anti-Farmeo
    ├── 03-hints-system-deductions.spec.ts      # Escenario 3: Desbloqueo de Pistas y Penalización en Nota
    ├── 04-attempt-history-restore.spec.ts      # Escenario 4: Auditoría y Restauración de Canvas
    ├── 05-access-mode-progressive-lock.spec.ts # Escenario 5: Conmutación Libre/Progresivo y Candados
    └── 06-theme-persistence-accessibility.spec.ts # Escenario 6: Dark/Light Mode, Teclado y Contraste
```

---

### 4.3. Especificación Detallada de Page Object Models (POM)

#### 4.3.1. `CatalogPage.pom.ts`
Encapsula la navegación en `/catalog`, selección de unidades, lectura de badges de desafío y conmutación de políticas de acceso.

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CatalogPagePom {
  readonly page: Page;
  readonly catalogTitle: Locator;
  readonly accessModeToggle: Locator;
  readonly openAccessButton: Locator;
  readonly progressiveAccessButton: Locator;
  readonly unitCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.catalogTitle = page.getByRole('heading', { name: /catálogo de desafíos/i });
    this.accessModeToggle = page.getByTestId('access-mode-toggle');
    this.openAccessButton = page.getByRole('button', { name: /modo libre/i });
    this.progressiveAccessButton = page.getByRole('button', { name: /modo progresivo/i });
    this.unitCards = page.getByTestId('unit-accordion');
  }

  async goto() {
    await this.page.goto('/catalog');
    await expect(this.catalogTitle).toBeVisible();
  }

  async selectChallenge(title: string | RegExp) {
    const card = this.page.getByTestId('challenge-card').filter({ hasText: title });
    await expect(card).toBeVisible();
    await card.click();
    await this.page.waitForURL(/\/challenges\/.+/);
  }

  async setAccessMode(mode: 'openAccess' | 'progressive') {
    if (mode === 'openAccess') {
      await this.openAccessButton.click();
    } else {
      await this.progressiveAccessButton.click();
    }
    // Esperar a que se aplique la mutación
    await this.page.waitForTimeout(300);
  }

  async expectChallengeLocked(title: string | RegExp, isLocked: boolean) {
    const card = this.page.getByTestId('challenge-card').filter({ hasText: title });
    if (isLocked) {
      await expect(card.getByTestId('lock-icon')).toBeVisible();
    } else {
      await expect(card.getByTestId('lock-icon')).not.toBeVisible();
    }
  }
}
```

#### 4.3.2. `WorkspacePage.pom.ts`
Encapsula la interacción gráfica en el workspace de React Flow: drag & drop de nodos desde la paleta de servicios, trazado de aristas entre handles, configuración de propiedades en nodos, inspección del panel de requisitos y botones de acción.

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class WorkspacePagePom {
  readonly page: Page;
  readonly canvasContainer: Locator;
  readonly submitButton: Locator;
  readonly resetCanvasButton: Locator;
  readonly hintsButton: Locator;
  readonly servicePalette: Locator;
  readonly contextPanelTabs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvasContainer = page.getByTestId('architecture-canvas');
    this.submitButton = page.getByTestId('submit-solution-button');
    this.resetCanvasButton = page.getByTestId('reset-canvas-button');
    this.hintsButton = page.getByTestId('hints-trigger-button');
    this.servicePalette = page.getByTestId('service-palette');
    this.contextPanelTabs = page.getByTestId('problem-context-panel-tabs');
  }

  async dragServiceToCanvas(serviceCode: string, targetX = 400, targetY = 300) {
    const serviceItem = this.page.getByTestId(`palette-item-${serviceCode}`);
    await expect(serviceItem).toBeVisible();

    const canvasBox = await this.canvasContainer.boundingBox();
    if (!canvasBox) throw new Error('Canvas container bounding box not found');

    // Simular Drag & Drop HTML5 nativo de React Flow
    await serviceItem.dragTo(this.canvasContainer, {
      targetPosition: { x: targetX, y: targetY }
    });
    
    // Verificar que el nodo se instanció en el canvas
    const node = this.page.locator(`.react-flow__node[data-service-code="${serviceCode}"]`);
    await expect(node.first()).toBeVisible();
  }

  async connectNodes(sourceNodeSelector: string, targetNodeSelector: string) {
    const sourceHandle = this.page.locator(`${sourceNodeSelector} .react-flow__handle-bottom`);
    const targetHandle = this.page.locator(`${targetNodeSelector} .react-flow__handle-top`);

    await expect(sourceHandle).toBeVisible();
    await expect(targetHandle).toBeVisible();

    await sourceHandle.dragTo(targetHandle);
    
    // Verificar que se renderizó la arista conectora
    await expect(this.page.locator('.react-flow__edge')).toBeVisible();
  }

  async submitSolution() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async resetCanvas() {
    await this.resetCanvasButton.click();
    const modal = this.page.getByTestId('reset-canvas-modal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /confirmar reinicio/i }).click();
    await expect(this.page.locator('.react-flow__node')).toHaveCount(0);
  }
}
```

#### 4.3.3. `EvaluationModal.pom.ts`
Encapsula la validación de la pantalla modal de resultados pedagógicos (`EvaluationModal`), medidor radial de nota (`ScoreGauge`), lista de aciertos/errores (`FeedbackList`) y botones de reintento/avance.

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class EvaluationModalPom {
  readonly page: Page;
  readonly modalContainer: Locator;
  readonly scoreText: Locator;
  readonly passBadge: Locator;
  readonly failBadge: Locator;
  readonly feedbackItems: Locator;
  readonly retryButton: Locator;
  readonly nextChallengeButton: Locator;
  readonly guestBannerCta: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalContainer = page.getByTestId('evaluation-modal');
    this.scoreText = page.getByTestId('score-gauge-value');
    this.passBadge = page.getByTestId('evaluation-status-pass');
    this.failBadge = page.getByTestId('evaluation-status-fail');
    this.feedbackItems = page.getByTestId('feedback-item');
    this.retryButton = page.getByRole('button', { name: /reintentar solución/i });
    this.nextChallengeButton = page.getByRole('button', { name: /siguiente desafío/i });
    this.guestBannerCta = page.getByTestId('guest-progress-banner-cta');
  }

  async waitForModal() {
    await expect(this.modalContainer).toBeVisible({ timeout: 5000 });
  }

  async expectScore(expectedScore: number, passed: boolean) {
    await expect(this.scoreText).toHaveText(`${expectedScore}`);
    if (passed) {
      await expect(this.passBadge).toBeVisible();
    } else {
      await expect(this.failBadge).toBeVisible();
    }
  }

  async clickRetry() {
    await this.retryButton.click();
    await expect(this.modalContainer).not.toBeVisible();
  }

  async clickRegisterFromBanner() {
    await this.guestBannerCta.click();
  }
}
```

#### 4.3.4. `AuthModal.pom.ts` y `HeaderGamification.pom.ts`
Encapsulan el modal de registro y la validación en tiempo real de XP acumulada, nivel y estado de sesión.

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class AuthModalPom {
  readonly page: Page;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitRegisterButton: Locator;
  readonly submitLoginButton: Locator;
  readonly tabRegister: Locator;
  readonly tabLogin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('auth-modal');
    this.nameInput = page.getByTestId('auth-name-input');
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.submitRegisterButton = page.getByTestId('auth-submit-register');
    this.submitLoginButton = page.getByTestId('auth-submit-login');
    this.tabRegister = page.getByRole('tab', { name: /crear cuenta/i });
    this.tabLogin = page.getByRole('tab', { name: /iniciar sesión/i });
  }

  async register(name: string, email: string, pass: string) {
    await expect(this.modal).toBeVisible();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitRegisterButton.click();
    await expect(this.modal).not.toBeVisible();
  }
}

export class HeaderGamificationPom {
  readonly page: Page;
  readonly xpText: Locator;
  readonly levelBadge: Locator;
  readonly guestBadge: Locator;
  readonly userMenuButton: Locator;
  readonly themeToggleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.xpText = page.getByTestId('header-total-xp');
    this.levelBadge = page.getByTestId('header-level-badge');
    this.guestBadge = page.getByTestId('guest-session-badge');
    this.userMenuButton = page.getByTestId('user-session-menu');
    this.themeToggleButton = page.getByTestId('theme-toggle-button');
  }

  async expectTotalXp(expectedXp: number) {
    await expect(this.xpText).toContainText(`${expectedXp}`);
  }

  async expectLevel(expectedLevel: number) {
    await expect(this.levelBadge).toHaveText(`Nivel ${expectedLevel}`);
  }

  async expectIsGuest(isGuest: boolean) {
    if (isGuest) {
      await expect(this.guestBadge).toBeVisible();
    } else {
      await expect(this.guestBadge).not.toBeVisible();
    }
  }

  async toggleTheme() {
    await this.themeToggleButton.click();
  }
}
```

---

### 4.4. Especificación Exhaustiva de Escenarios E2E

#### 4.4.1. Escenario 1: Core Gameplay Loop Completo con Migración de Invitado
**Archivo:** `apps/web/e2e/specs/01-guest-core-gameplay-loop.spec.ts`  
**Casos de Uso:** CU-01, CU-02, CU-03, CU-05, CU-08  
**Reglas de Negocio:** RN-02, RN-04, RN-10, RN-13  
**Flujo de Pasos Automatizados:**
1. El usuario accede a la raíz `/` $\rightarrow$ Redirección automática a `/catalog`.
2. El sistema inicializa la sesión en Modo Invitado (`isGuest = true`) de forma transparente (**RN-13**).
3. `HeaderGamification` refleja: `isGuest: true`, `TotalXP: 0`, `Nivel: 1`.
4. El usuario selecciona el desafío *"Static Web Hosting con S3"* (`challenge-101`).
5. Se carga el workspace con sus 3 paneles en pantalla completa.
6. El usuario arrastra el servicio **AWS S3** desde la paleta hacia el centro del canvas.
7. Presiona el botón *"Enviar solución"*.
8. Se despliega `EvaluationModal` con animación radial de puntuación:
   - Score: **100 / 100** (`Passed = true`).
   - Feedback: Lista con items en verde (`Pass`).
   - XP Ganada: **+100 XP**.
9. En el header global, `XpProgressBar` anima el incremento sumando +100 XP.
10. El usuario hace clic en el banner *"Conserva tus 100 XP creando una cuenta permanente"*.
11. Se abre `AuthModal` con el tab de registro activo.
12. El usuario ingresa Nombre (*"Cloud Apprentice"*), Email (*"apprentice@awsquest.io"*) y Contraseña.
13. Presiona *"Registrar y Guardar Progreso"*.
14. El modal se cierra exitosamente. El header muestra el avatar del usuario registrado (`isGuest = false`), conservando intactos sus **100 XP**, **Nivel 1** y el récord de 100 puntos en el catálogo.

```typescript
import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { WorkspacePagePom } from '../pom/WorkspacePage.pom';
import { EvaluationModalPom } from '../pom/EvaluationModal.pom';
import { AuthModalPom } from '../pom/AuthModal.pom';
import { HeaderGamificationPom } from '../pom/HeaderGamification.pom';

test.describe('E2E Escenario 1: Core Gameplay Loop & Migración de Invitado (CU-01 a CU-08)', () => {
  test('debe permitir a un invitado resolver un desafío, ganar XP y migrar su progreso a una cuenta permanente', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const workspace = new WorkspacePagePom(page);
    const evaluation = new EvaluationModalPom(page);
    const authModal = new AuthModalPom(page);
    const header = new HeaderGamificationPom(page);

    // 1. Acceso inicial como Invitado
    await catalog.goto();
    await header.expectIsGuest(true);
    await header.expectTotalXp(0);
    await header.expectLevel(1);

    // 2. Selección de Desafío 101
    await catalog.selectChallenge(/Static Web Hosting con S3/i);

    // 3. Diseño de Arquitectura (Drag S3 Bucket)
    await workspace.dragServiceToCanvas('AWS_S3', 450, 300);

    // 4. Enviar Solución
    await workspace.submitSolution();

    // 5. Verificación de Resultados en Modal
    await evaluation.waitForModal();
    await evaluation.expectScore(100, true);

    // 6. Migración a Cuenta Permanente desde Banner
    await evaluation.clickRegisterFromBanner();
    await authModal.register('Cloud Hero', `hero_${Date.now()}@awsquest.io`, 'StrongPassword123!');

    // 7. Verificación de Progreso Conservado Post-Migración
    await header.expectIsGuest(false);
    await header.expectTotalXp(100);
    await header.expectLevel(1);

    // 8. Retorno al Catálogo y Verificación de Récord
    await page.goto('/catalog');
    const completedCard = page.getByTestId('challenge-card').filter({ hasText: /Static Web Hosting con S3/i });
    await expect(completedCard.getByTestId('high-score-badge')).toHaveText(/100/);
  });
});
```

---

#### 4.4.2. Escenario 2: Iteración en Canvas, Corrección de Errores y Anti-Farmeo de XP
**Archivo:** `apps/web/e2e/specs/02-fix-architecture-evaluation.spec.ts`  
**Casos de Uso:** CU-02, CU-03, CU-05, CU-06  
**Reglas de Negocio:** RN-02, RN-08, RN-09, RN-10, RN-12  
**Flujo de Pasos Automatizados:**
1. El usuario carga el desafío *"Arquitectura Web en 3 Capas"* (`challenge-201`).
2. Diseña una arquitectura incompleta con solo **AWS RDS** (sin Multi-AZ, sin ALB, sin EC2).
3. Envía la solución:
   - Score: **$< 70$** (`Passed = false`).
   - Feedback: Muestra antipatrón de Single Point of Failure y servicios faltantes.
   - XP Ganada: **+0 XP** (no se otorga XP en desafíos no aprobados).
4. El usuario hace clic en *"Reintentar solución"* (el canvas conserva los componentes diseñados para permitir corrección rápida).
5. Completa la arquitectura agregando **ALB**, **EC2** y trazando las conexiones dirigidas (`ALB -> EC2 -> RDS`).
6. Envía nuevamente la solución:
   - Score: **85 / 100** (`Passed = true`).
   - XP Ganada: **+85 XP**.
7. Hace un tercer intento optimizando parámetros y obtiene **95 / 100**:
   - XP Ganada: **+10 XP** (diferencial neto $95 - 85$ según regla anti-farmeo **RN-10**).
   - Total XP acumulado: **95 XP**.

---

#### 4.4.3. Escenario 3: Sistema de Pistas con Descuento Secuencial
**Archivo:** `apps/web/e2e/specs/03-hints-system-deductions.spec.ts`  
**Casos de Uso:** CU-04, CU-05  
**Reglas de Negocio:** RN-06, RN-07  
**Flujo de Pasos Automatizados:**
1. El usuario abre el desafío `challenge-201`.
2. Presiona *"Solicitar Pista"*: se abre `HintUnlockModal` advirtiendo penalización de -5 puntos (**RN-07**).
3. Confirma la solicitud: `HintDrawer` muestra la Pista 1 revelada y el botón de pistas indica "1/3 pistas desbloqueadas (-5 pts)".
4. Solicita la Pista 2: penalización acumulada asciende a -15 pts.
5. Diseña la solución perfecta y la envía:
   - Nota base: 100 pts.
   - Penalización aplicada por pistas: -15 pts.
   - Puntuación final: **85 / 100** (**RN-06**).

---

#### 4.4.4. Escenario 4: Auditoría y Restauración de Intentos Históricos
**Archivo:** `apps/web/e2e/specs/04-attempt-history-restore.spec.ts`  
**Casos de Uso:** CU-05, CU-06  
**Reglas de Negocio:** RN-11, RN-12  
**Flujo de Pasos Automatizados:**
1. El usuario realiza dos intentos con distintas topologías de diseño.
2. Abre la pestaña *"Historial"* en el panel de contexto lateral izquierdo.
3. Se despliega la lista cronológica de intentos con sus badges de aprobación, fecha y nota.
4. Hace clic en *"Cargar en Canvas"* sobre el intento 1.
5. Se muestra `RestoreAttemptModal` solicitando confirmación para no perder el lienzo actual.
6. Al confirmar, el canvas de React Flow reconstruye instantáneamente los nodos y aristas de dicho intento histórico.

---

#### 4.4.5. Escenario 5: Conmutación de Modo de Acceso (Libre vs Progresivo)
**Archivo:** `apps/web/e2e/specs/05-access-mode-progressive-lock.spec.ts`  
**Casos de Uso:** CU-01, CU-07  
**Reglas de Negocio:** RN-01  
**Flujo de Pasos Automatizados:**
1. En `/catalog`, conmuta el selector `AccessModeToggle` a *"Modo Progresivo"*.
2. El desafío avanzado `challenge-201` muestra el icono de candado bloqueado y tooltip con requisitos de XP previa.
3. El usuario intenta navegar directamente a la URL `/challenges/challenge-201`: la página renderiza `ChallengeErrorState` con código 403 `CHALLENGE_LOCKED`.
4. Conmuta nuevamente a *"Modo Libre"*: el desafío se desbloquea de inmediato y permite el acceso normal.

---

#### 4.4.6. Escenario 6: Persistencia de Tema (Dark/Light) y Accesibilidad Básica
**Archivo:** `apps/web/e2e/specs/06-theme-persistence-accessibility.spec.ts`  
**Requisitos No Funcionales:** RNF-04, RNF-05, RNF-10  
**Flujo de Pasos Automatizados:**
1. El usuario presiona el botón `ThemeToggle` en el header: la etiqueta `<html>` conmuta su clase a `dark`.
2. Los componentes del workspace y canvas adaptan sus tokens cromáticos a la paleta Squid Dark de AWS.
3. El usuario recarga la página: se comprueba que la preferencia persiste en `localStorage` (`awsquest_theme_mode`).
4. **Navegación por Teclado:** Selecciona un nodo en el canvas con el ratón y presiona la tecla `Delete` / `Backspace` $\rightarrow$ el nodo y sus aristas asociadas se eliminan del lienzo (**RF-09**).
5. Presiona `Escape` $\rightarrow$ cualquier diálogo modal o drawer abierto se cierra inmediatamente.

---

## 5. Estrategia de Ejecución, Automatización y Pipeline CI/CD

### 5.1. Comandos de Ejecución de Pruebas

#### Backend Integration Tests (.NET 10):
```bash
# Ejecutar suite de pruebas de integración con reporte detallado
dotnet test apps/api/tests/AwsQuest.IntegrationTests/AwsQuest.IntegrationTests.csproj --verbosity normal --logger "console;verbosity=detailed"
```

#### Frontend E2E Tests (Playwright):
```bash
# Ejecutar todas las pruebas E2E en modo headless
npm run test:e2e --workspace=@aws-quest/web

# Ejecutar con interfaz gráfica interactiva (UI Mode) para debugging
npx playwright test --ui

# Ejecutar en un navegador específico
npx playwright test --project=chromium
```

#### Scripts Unificados en `package.json` (Raíz):
```json
{
  "scripts": {
    "test:unit:backend": "dotnet test apps/api/tests/AwsQuest.UnitTests/AwsQuest.UnitTests.csproj",
    "test:integration:backend": "dotnet test apps/api/tests/AwsQuest.IntegrationTests/AwsQuest.IntegrationTests.csproj",
    "test:unit:frontend": "npm run test --workspace=@aws-quest/web",
    "test:e2e:frontend": "npx playwright test --config=apps/web/playwright.config.ts",
    "test:all": "npm run test:unit:backend && npm run test:integration:backend && npm run test:unit:frontend && npm run test:e2e:frontend"
  }
}
```

---

## 6. Criterios de Aceptación y Verificación (Definition of Done)

1. **Aislamiento e Idempotencia:** Todas las pruebas de integración y E2E deben ser reproducibles e independientes del orden de ejecución, reseteando los datos de prueba sin alterar el catálogo maestro.
2. **Cobertura de Casos de Uso:** El 100% de los flujos de usuario (CU-01 a CU-08) cuentan con al menos un escenario E2E automatizado en Playwright.
3. **Validación de Transacciones y Gamificación:** Las pruebas de integración backend verifican que el cálculo de XP anti-farmeo (**RN-10**), el desbloqueo de pistas (**RN-06, RN-07**) y la migración de cuenta (**RN-13**) operan atómicamente bajo transacciones ACID en PostgreSQL.
4. **Ejecución Multi-Navegador:** La suite de Playwright supera el 100% de las pruebas en Chromium, Firefox y WebKit (**RNF-10**).
5. **Tiempo de Ejecución y Resiliencia:** Ninguna prueba unitaria o de integración individual excede los 2 segundos (**RNF-02**), y la suite E2E completa se ejecuta en menos de 3 minutos en entornos de desarrollo local y CI.

---

## 7. Matriz de Trazabilidad Total

| Requisito / Regla / CU | Prueba de Integración Backend (`AwsQuest.IntegrationTests`) | Prueba E2E Frontend (`Playwright`) | Estado de Cobertura |
| :--- | :--- | :--- | :--- |
| **CU-01 / RF-01 / RN-01** | `UnitsControllerIntegrationTests.cs` | `01-guest-core-gameplay-loop.spec.ts`, `05-access-mode-progressive-lock.spec.ts` | **100% Completa** |
| **CU-02 / RF-02 / RF-03** | `ChallengesControllerIntegrationTests.cs` | `01-guest-core-gameplay-loop.spec.ts`, `02-fix-architecture-evaluation.spec.ts` | **100% Completa** |
| **CU-03 / RF-05-09 / RN-04,05**| `EvaluateArchitectureRequestDtoValidatorTests.cs` | `01-guest-core-gameplay-loop.spec.ts`, `02-fix-architecture-evaluation.spec.ts` | **100% Completa** |
| **CU-04 / RF-10-12 / RN-06,07**| `HintsIntegrationTests.cs` | `03-hints-system-deductions.spec.ts` | **100% Completa** |
| **CU-05 / RF-13-18 / RN-02,08-10**| `EvaluationControllerIntegrationTests.cs` | `01-guest-core-gameplay-loop.spec.ts`, `02-fix-architecture-evaluation.spec.ts` | **100% Completa** |
| **CU-06 / RF-09 / RN-11** | N/A (Estado local de Canvas) | `01-guest-core-gameplay-loop.spec.ts`, `04-attempt-history-restore.spec.ts` | **100% Completa** |
| **CU-07 / RF-04 / RN-01** | `SystemConfigControllerIntegrationTests.cs`| `05-access-mode-progressive-lock.spec.ts` | **100% Completa** |
| **CU-08 / RF-19,20 / RN-13** | `AuthControllerIntegrationTests.cs` | `01-guest-core-gameplay-loop.spec.ts` | **100% Completa** |
| **RNF-01 a RNF-13** | `IntegrationTestBase.cs`, `GlobalErrorHandlingIntegrationTests.cs` | `06-theme-persistence-accessibility.spec.ts` | **100% Completa** |
