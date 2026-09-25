# Colección Postman: Manejo Global de Excepciones y Swagger / OpenAPI (Hito 3.6)

Esta colección permite probar y validar de forma automatizada la disponibilidad de la documentación interactiva Swagger / OpenAPI y el comportamiento estandarizado del middleware global de excepciones (`ApiExceptionMiddleware`) ante todos los códigos de estado HTTP canónicos (400, 401, 403, 404, 409, 500) en la API REST de **AWS Architecture Quest**.

---

## 📁 Archivos Incluidos

- `awsquest-global-exception-swagger.postman_collection.json`: Colección completa con carpetas organizadas por categoría de error y documentación Swagger.
- `awsquest-local.postman_environment.json`: Entorno local configurado con la URL base predeterminada (`https://localhost:7234`).
- `README.md`: Esta guía de uso y referencia.

---

## 🚀 Instrucciones de Uso

1. **Importar en Postman:**
   - Abre Postman y selecciona **Import**.
   - Arrastra e importa tanto la colección `awsquest-global-exception-swagger.postman_collection.json` como el entorno `awsquest-local.postman_environment.json`.

2. **Seleccionar Entorno:**
   - Asegúrate de seleccionar el entorno activo **AWS Architecture Quest - Localhost**.

3. **Iniciar el Backend:**
   - Ejecuta la API localmente mediante:
     ```powershell
     dotnet run --project apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj
     ```

4. **Ejecutar Pruebas:**
   - Puedes ejecutar las peticiones individualmente o usar el **Postman Collection Runner** para verificar automáticamente el 100% de los tests.

---

## 📋 Estructura de Carpetas y Endpoints

### 00 - Documentación Swagger y OpenAPI
- `GET /swagger/v1/swagger.json` — Verifica que el JSON del esquema OpenAPI se genera correctamente con soporte para Bearer JWT.
- `GET /swagger/index.html` — Verifica que la interfaz gráfica interactiva de Swagger UI está disponible.

### 01 - Escenarios de Error 400 Bad Request
- `POST /api/v1/auth/register` (Campos faltantes / inválidos) — Verifica la respuesta de error de validación `VALIDATION_ERROR` con la lista de campos en `details`.
- `POST /api/v1/challenges/{id}/evaluate` (Grafo vacío) — Verifica `VALIDATION_ERROR` / `INVALID_GRAPH_PAYLOAD`.
- `PATCH /api/v1/system/config` (Valor enum inválido) — Verifica `VALIDATION_ERROR`.

### 02 - Escenarios de Error 401 Unauthorized
- `GET /api/v1/auth/me` (Sin token Bearer) — Verifica el rechazo 401 por falta de autenticación.
- `POST /api/v1/auth/login` (Credenciales incorrectas) — Verifica el código `INVALID_CREDENTIALS`.

### 03 - Escenarios de Error 403 Forbidden
- `GET /api/v1/challenges/{id}` (Desafío bloqueado en modo progresivo) — Verifica el código `CHALLENGE_LOCKED`.

### 04 - Escenarios de Error 404 Not Found
- `GET /api/v1/challenges/00000000-0000-0000-0000-000000000000` (Desafío inexistente) — Verifica el código `CHALLENGE_NOT_FOUND`.

### 05 - Escenarios de Error 409 Conflict
- `POST /api/v1/auth/register` (Email duplicado) — Verifica el código `EMAIL_ALREADY_EXISTS`.
