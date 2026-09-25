# AWS Architecture Quest - Colección Postman: Servicios Maestros y Configuración (Hito 3.5)

Esta carpeta contiene la colección de Postman y el entorno de configuración para probar y verificar los endpoints del **Módulo de Servicios Maestros y Configuración del Sistema** (Hito 3.5 de la Fase 3 del plan de implementación).

## 📁 Archivos Incluidos

- `awsquest-master-services-config.postman_collection.json`: Colección con todas las peticiones organizadas por módulo, aserciones automatizadas en JavaScript y captura de variables de sesión.
- `awsquest-local.postman_environment.json`: Entorno local preconfigurado con `baseUrl: https://localhost:7234`.

---

## 🚀 Endpoints Cubiertos

### 00 - Setup de Autenticación
- `POST /api/v1/auth/guest` — Obtiene token de sesión para autenticar peticiones de modificación de configuración. Almacena automáticamente el `authToken`.

### 01 - Catálogo Maestro de Servicios AWS
- `GET /api/v1/services` — Obtiene la lista completa de servicios AWS activos con metadatos de categoría, iconos y descripción.
- `GET /api/v1/services?category=Compute` — Filtra los servicios pertenecientes a la categoría Compute.
- `GET /api/v1/services?category=Storage` — Filtra los servicios pertenecientes a la categoría Storage.

### 02 - Configuración del Sistema
- `GET /api/v1/system/config` — Obtiene la modalidad de acceso global activa (`OpenAccess` vs `Progressive`).
- `PATCH /api/v1/system/config` (Progressive) — Actualiza la política global a Modo Progresivo (`[Authorize]`).
- `PATCH /api/v1/system/config` (OpenAccess) — Restaura la política global a Modo Libre / Open Access (`[Authorize]`).

### 03 - Escenarios de Error y Casos Borde
- `PATCH /api/v1/system/config` (401 Unauthorized) — Valida el rechazo de peticiones de modificación sin token JWT.
- `PATCH /api/v1/system/config` (400 Bad Request) — Valida el error `VALIDATION_ERROR` ante valores numéricos fuera del enum `AccessMode`.

---

## 🛠️ Instrucciones de Uso en Postman

1. **Importar Archivos**:
   - Abre Postman y haz clic en **Import**.
   - Selecciona los archivos `awsquest-master-services-config.postman_collection.json` y `awsquest-local.postman_environment.json`.
2. **Seleccionar Entorno**:
   - En la esquina superior derecha de Postman, selecciona el entorno **AWS Architecture Quest - Localhost**.
3. **Ejecución con Collection Runner**:
   - Haz clic derecho sobre la colección `AWS Architecture Quest - Master Services & System Config` y selecciona **Run Collection**.
   - Ejecuta todos los tests en orden secuencial. Todas las pruebas pasarán con `100% PASS`.
