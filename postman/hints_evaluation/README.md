# AWS Architecture Quest - Colección Postman: Módulo de Pistas y Evaluación (Hito 3.4)

Esta carpeta contiene la colección de Postman y el entorno de configuración para probar y verificar los endpoints del **Módulo de Pistas y Evaluación** (Hito 3.4 de la Fase 3 del plan de implementación).

## 📁 Archivos Incluidos

- `awsquest-hints-evaluation.postman_collection.json`: Colección con todas las peticiones organizadas por flujo de negocio, aserciones automatizadas en JavaScript y captura de variables de sesión.
- `awsquest-local.postman_environment.json`: Entorno local preconfigurado con `baseUrl: https://localhost:7234`.

---

## 🚀 Endpoints Cubiertos

### 00 - Setup de Autenticación y Desafío
- `POST /api/v1/auth/guest` — Obtiene token de sesión para interactuar con la API como jugador invitado. Almacena automáticamente el `authToken`.
- `GET /api/v1/units` — Consulta el catálogo y extrae dinámicamente el primer `challengeId` disponible para las pruebas.

### 01 - Desbloqueo Secuencial de Pistas
- `POST /api/v1/challenges/{id}/hints/unlock` (Pista 1) — Desbloquea la primera pista pedagógica, validando orden, penalización y estado.
- `POST /api/v1/challenges/{id}/hints/unlock` (Pista 2) — Desbloquea la pista subsecuente acumulando la penalización.

### 02 - Evaluación de Arquitectura
- `POST /api/v1/challenges/{id}/evaluate` (Aprobatoria) — Evalúa un grafo arquitectónico contra las reglas del desafío en memoria, calcula feedback, actualiza XP y nivel de usuario, y audita el intento.
- `POST /api/v1/challenges/{id}/evaluate` (Anti-Refarming) — Re-evalúa una solución idéntica comprobando que el `earnedXP` resultante sea `0` para prevenir explotación.

### 03 - Historial de Envíos e Intentos
- `GET /api/v1/challenges/{id}/attempts` — Retorna el historial cronológico de auditoría con notas, estados de aprobación y snapshots de grafos evaluados.

### 04 - Escenarios de Error y Casos Borde
- `POST /api/v1/challenges/{id}/evaluate` (401 Unauthorized) — Valida el rechazo de peticiones sin token JWT.
- `POST /api/v1/challenges/{id}/hints/unlock` (404 Not Found) — Valida el error `CHALLENGE_NOT_FOUND` ante identificadores inexistentes.
- `POST /api/v1/challenges/{id}/evaluate` (400 Bad Request) — Valida el error `INVALID_GRAPH_PAYLOAD` al intentar evaluar un grafo vacío.

---

## 🛠️ Instrucciones de Uso en Postman

1. **Importar Archivos**:
   - Abre Postman y haz clic en **Import**.
   - Selecciona los archivos `awsquest-hints-evaluation.postman_collection.json` y `awsquest-local.postman_environment.json`.
2. **Seleccionar Entorno**:
   - En la esquina superior derecha de Postman, selecciona el entorno **AWS Architecture Quest - Localhost**.
3. **Ejecución con Collection Runner**:
   - Haz clic derecho sobre la colección `AWS Architecture Quest - Hints & Evaluation Module` y selecciona **Run Collection**.
   - Ejecuta todos los tests en orden secuencial. Todas las pruebas pasarán con `100% PASS`.
