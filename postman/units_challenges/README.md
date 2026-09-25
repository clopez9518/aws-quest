# Colección de Postman - Módulo de Catálogo y Desafíos

Esta carpeta contiene la colección de pruebas de Postman y el entorno de configuración para probar todos los endpoints del **Módulo de Catálogo y Desafíos (Fase 3 - Hito 3.3)** de **AWS Architecture Quest**.

---

## 1. Archivos Incluidos

* **`awsquest-catalog-challenges.postman_collection.json`:** Colección completa de peticiones con tests automáticos de aserción (validación de envelopes `ApiResponse` / `ApiErrorResponse`, extracción dinámica de `challengeId` y validación de protección anti-cheat de pistas).
* **`awsquest-local.postman_environment.json`:** Variables de entorno para ejecución local configuradas con base URL `https://localhost:7234`.

---

## 2. Endpoints y Escenarios Cubiertos

### Carpeta `00 - Setup de Autenticación`
1. **`POST /api/v1/auth/guest`:** Genera un token JWT de sesión anónima y lo guarda automáticamente en la variable de colección `authToken` para autenticar las peticiones subsecuentes.

### Carpeta `01 - Catálogo de Unidades y Desafíos (/units)`
2. **`GET /api/v1/units` (Listar Catálogo Completo - CU-01):**
   * Retorna las unidades de aprendizaje y sus desafíos asociados ordenados por `OrderIndex`.
   * Enriquecido con el progreso del usuario (`Status`, `HighScore`, `HintsUsed`, `CompletedAt`).
   * Guarda dinámicamente el ID del primer desafío encontrado en la variable `challengeId`.
3. **`GET /api/v1/units` (Sin Autenticación - Error 401):**
   * Valida que una petición sin token Bearer sea rechazada con código canónico `UNAUTHORIZED`.

### Carpeta `02 - Detalle y Workspace del Desafío (/challenges)`
4. **`GET /api/v1/challenges/{{challengeId}}` (Obtener Detalle del Desafío - CU-02):**
   * Carga el contexto completo de trabajo del desafío especificado en `{{challengeId}}`.
   * Valida la estructura de `allowedServices` (`Code`, `Name`, `Category`, `IconUrl`, `MaxInstances`, `IsDistractor`).
   * Valida el resumen de pistas (`HintsSummary`) y comprueba el mecanismo anti-cheat (sólo texto de pistas previamente desbloqueadas).
5. **`GET /api/v1/challenges/00000000-0000-0000-0000-000000000000` (ID Inexistente - Error 404):**
   * Valida el retorno de `404 Not Found` con código de error canónico `CHALLENGE_NOT_FOUND`.
6. **`GET /api/v1/challenges/{{challengeId}}` (Sin Autenticación - Error 401):**
   * Valida el rechazo con `401 Unauthorized` (`UNAUTHORIZED`).

---

## 3. Instrucciones de Uso

1. **Iniciar la API Backend:**
   ```bash
   dotnet run --project apps/api/src/AwsQuest.Api
   ```
2. **Importar en Postman:**
   * Abrir Postman $\rightarrow$ **Import**.
   * Seleccionar `awsquest-catalog-challenges.postman_collection.json` y `awsquest-local.postman_environment.json`.
3. **Seleccionar el Entorno:**
   * En la esquina superior derecha, elegir el entorno **AWS Quest - Local Environment (HTTPS 7234)**.
4. **Ejecución de Pruebas:**
   * Ejecutar la petición `POST /auth/guest` primero para obtener el token, o bien ejecutar la colección completa mediante el **Collection Runner** para probar el flujo completo de forma secuencial y automatizada.
