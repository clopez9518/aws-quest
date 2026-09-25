# Colección de Postman - Módulo de Autenticación y Modo Invitado

Esta carpeta contiene la colección de pruebas de Postman y el entorno de configuración para probar todos los endpoints del **Módulo de Autenticación y Modo Invitado (Fase 3 - Hito 3.2)** de **AWS Architecture Quest**.

---

## 1. Archivos Incluidos

* **`awsquest-auth.postman_collection.json`:** Colección completa de peticiones con tests automáticos de aserción (Status Code, Envelope `ApiResponse` / `ApiErrorResponse`, guardado automático de tokens JWT en variables).
* **`awsquest-local.postman_environment.json`:** Variables de entorno para ejecución local (`baseUrl: http://localhost:5000`).

---

## 2. Endpoints y Escenarios Cubiertos

### Carpeta `01 - Modo Invitado (Guest Session)`
1. **`POST /api/v1/auth/guest`:** Genera un usuario anónimo (`IsGuest = true`), emite un JWT con vigencia de 30 días y guarda automáticamente el token en `guestToken`.
2. **`GET /api/v1/auth/me` (con Guest Token):** Valida la obtención del perfil de invitado y sus contadores de XP/desafíos.

### Carpeta `02 - Registro y Migración de Cuenta (Register)`
3. **`POST /api/v1/auth/register` (con Migración RN-13 / CU-08):** Envía el Bearer `guestToken` en el encabezado `Authorization`. Ejecuta la promoción *in-place* conservando todo el progreso acumulado y emite el token permanente `authToken`.
4. **`POST /api/v1/auth/register` (Registro Directo):** Registra un usuario nuevo sin sesión previa de invitado (`migratedProgressCount = 0`).
5. **`POST /api/v1/auth/register` (Email Duplicado - Error 409):** Valida el rechazo de emails duplicados con `EMAIL_ALREADY_EXISTS`.
6. **`POST /api/v1/auth/register` (Contraseña Débil - Error 400):** Valida las reglas de FluentValidation (`VALIDATION_ERROR`).

### Carpeta `03 - Inicio de Sesión (Login)`
7. **`POST /api/v1/auth/login` (Login Exitoso):** Valida credenciales contra el hash BCrypt y renueva `authToken`.
8. **`POST /api/v1/auth/login` (Contraseña Incorrecta - Error 401):** Valida el error `INVALID_CREDENTIALS`.
9. **`POST /api/v1/auth/login` (Email Inexistente - Error 401):** Valida el error `INVALID_CREDENTIALS`.

### Carpeta `04 - Perfil de Usuario (/auth/me)`
10. **`GET /api/v1/auth/me` (con Auth Token):** Consulta el perfil del usuario autenticado permanente.
11. **`GET /api/v1/auth/me` (sin Token - Error 401):** Valida la captura del evento `OnChallenge` con código `UNAUTHORIZED`.

---

## 3. Instrucciones de Uso

1. **Iniciar el Backend:**
   ```bash
   dotnet run --project apps/api/src/AwsQuest.Api
   ```
2. **Importar en Postman:**
   * Abrir Postman $\rightarrow$ Botón **Import**.
   * Seleccionar `awsquest-auth.postman_collection.json` y `awsquest-local.postman_environment.json`.
3. **Seleccionar Entorno:**
   * En la esquina superior derecha, seleccionar el entorno **AWS Quest - Local Environment**.
4. **Ejecutar:**
   * Se pueden ejecutar las peticiones individualmente o usar el **Collection Runner** para ejecutar la suite completa en orden secuencial con 100% de tests automáticos aprobados.
