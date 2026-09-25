# Especificación de la API REST - AWS Architecture Quest

## 1. Introducción y Convenciones Generales

Este documento establece el contrato formal de comunicación entre el cliente Frontend (React + React Flow) y el servidor Backend (ASP.NET Core Web API en .NET 10).
Define los endpoints REST, métodos HTTP, parámetros, DTOs de petición/respuesta en TypeScript, códigos de estado HTTP, autenticación y manejo de errores.

---

## 2. Convenciones Globales

* **Base URL:** `/api/v1`
* **Formato de intercambio:** `application/json` (UTF-8).
* **Autenticación:** Encabezado HTTP estándar `Authorization: Bearer <JWT>`.
  * Los tokens JWT son emitidos tanto para usuarios registrados como para usuarios anónimos en **Modo Invitado** (`isGuest: true`).
  * **Estructura de Claims JWT:**
    ```json
    {
      "sub": "c7a10294-9b21-4d32-bb19-201a89c89012",
      "name": "Carlos López",
      "email": "aprendiz@awsquest.dev",
      "isGuest": false,
      "role": "Learner",
      "exp": 1726300000
    }
    ```
    *(En tokens de Modo Invitado, `email` es omitido y `isGuest` es `true`).*

### 2.1. Envelope Estándar de Respuesta Exitosa (`ApiResponse<T>`)

```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
  };
}
```

### 2.2. Envelope Estándar de Error (`ApiErrorResponse`)

```typescript
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // Código alfanumérico único para el Frontend (ej. 'CHALLENGE_LOCKED')
    message: string;    // Mensaje descriptivo amigable
    details?: any;      // Detalles adicionales o errores de validación de campos
  };
}
```

---

## 3. Catálogo de Códigos de Error

| Código de Error | HTTP Status | Descripción |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Token JWT ausente, expirado o inválido. |
| `FORBIDDEN` | 403 | Permisos insuficientes para ejecutar la acción. |
| `CHALLENGE_NOT_FOUND` | 404 | El desafío especificado por ID no existe. |
| `CHALLENGE_LOCKED` | 403 | El desafío está bloqueado por falta de prerrequisito o XP en Modo Progresivo. |
| `INVALID_GRAPH_PAYLOAD`| 400 | El formato del grafo de arquitectura enviado es inválido o está vacío. |
| `SERVICE_LIMIT_EXCEEDED`| 400 | La arquitectura enviada supera el límite máximo de instancias de un servicio. |
| `ALL_HINTS_UNLOCKED` | 400 | Se han revelado todas las pistas disponibles para este desafío. |
| `EMAIL_ALREADY_EXISTS` | 409 | El email ingresado ya está registrado. |
| `INTERNAL_SERVER_ERROR`| 500 | Error interno no controlado en el servidor. |

---

## 4. Especificación Detallada de Endpoints

### 4.1. Módulo de Autenticación y Sesión (`/auth`)

#### `POST /auth/guest`
Genera una nueva sesión anónima en Modo Invitado para permitir el acceso sin registro previo.

* **Headers:** No requeridos.
* **Request Body:** Vacío.
* **Response:** `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "a3b8e2c0-8219-49c1-8429-11c97a892b1a",
        "name": "Invitado_4829",
        "email": null,
        "isGuest": true,
        "totalXP": 0,
        "level": 1
      }
    }
  }
  ```

---

#### `POST /auth/register`
Registra una cuenta de usuario permanente. Si el cliente incluye en el header el token de su sesión de invitado previa, migra automáticamente el progreso e historial acumulados (**RN-13 / CU-08**).

* **Headers:** `Authorization: Bearer <Guest_JWT>` *(Opcional)*
* **Request Body (`RegisterDto`):**
  ```json
  {
    "email": "aprendiz@awsquest.dev",
    "password": "PasswordSeguro123!",
    "name": "Carlos López"
  }
  ```
* **Response:** `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "c7a10294-9b21-4d32-bb19-201a89c89012",
        "name": "Carlos López",
        "email": "aprendiz@awsquest.dev",
        "isGuest": false,
        "totalXP": 150,
        "level": 2
      },
      "migratedProgressCount": 2
    }
  }
  ```

---

#### `POST /auth/login`
Inicia sesión con credenciales existentes.

* **Request Body (`LoginDto`):**
  ```json
  {
    "email": "aprendiz@awsquest.dev",
    "password": "PasswordSeguro123!"
  }
  ```
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "c7a10294-9b21-4d32-bb19-201a89c89012",
        "name": "Carlos López",
        "email": "aprendiz@awsquest.dev",
        "isGuest": false,
        "totalXP": 350,
        "level": 3
      }
    }
  }
  ```

---

#### `GET /auth/me`
Obtiene el perfil y progreso global del usuario actual (autenticado o invitado).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "c7a10294-9b21-4d32-bb19-201a89c89012",
      "name": "Carlos López",
      "email": "aprendiz@awsquest.dev",
      "isGuest": false,
      "totalXP": 350,
      "level": 3,
      "completedChallengesCount": 4
    }
  }
  ```

---

### 4.2. Módulo de Catálogo y Desafíos (`/units` & `/challenges`)

#### `GET /units`
Lista todas las unidades temáticas de aprendizaje junto con sus desafíos y el estado de avance del usuario según la política de acceso activa (**CU-01**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "u-101-uuid",
        "title": "Cómputo y Escalabilidad",
        "description": "Fundamentos de EC2, Auto Scaling Groups y Balanceadores de Carga",
        "orderIndex": 1,
        "challenges": [
          {
            "id": "c-201-uuid",
            "title": "Servidor Web con Alta Disponibilidad",
            "difficulty": "INTERMEDIATE",
            "mode": "BUILDER",
            "baseXP": 100,
            "orderIndex": 1,
            "isLocked": false,
            "lockReason": null,
            "userProgress": {
              "status": "COMPLETED",
              "highScore": 95,
              "hintsUsed": 1
            }
          },
          {
            "id": "c-202-uuid",
            "title": "Escalabilidad Dinámica bajo Tráfico Impredecible",
            "difficulty": "HARD",
            "mode": "BUILDER",
            "baseXP": 150,
            "orderIndex": 2,
            "isLocked": true,
            "lockReason": "Requiere completar el desafío 'Servidor Web con Alta Disponibilidad'",
            "userProgress": {
              "status": "NOT_STARTED",
              "highScore": 0,
              "hintsUsed": 0
            }
          }
        ]
      }
    ]
  }
  ```

---

#### `GET /challenges/:id`
Obtiene toda la información de contexto para inicializar el workspace de trabajo del desafío (**CU-02**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "id": "c-201-uuid",
      "title": "Servidor Web con Alta Disponibilidad",
      "description": "Diseña una arquitectura resiliente para soportar un sitio de comercio electrónico...",
      "difficulty": "INTERMEDIATE",
      "mode": "BUILDER",
      "baseXP": 100,
      "allowedServices": [
        {
          "code": "AWS_ALB",
          "name": "Application Load Balancer",
          "category": "Networking",
          "iconUrl": "/icons/aws/alb.svg",
          "maxInstances": 1,
          "isDistractor": false
        },
        {
          "code": "AWS_EC2",
          "name": "Amazon EC2",
          "category": "Compute",
          "iconUrl": "/icons/aws/ec2.svg",
          "maxInstances": 4,
          "isDistractor": false
        },
        {
          "code": "AWS_RDS",
          "name": "Amazon RDS Multi-AZ",
          "category": "Database",
          "iconUrl": "/icons/aws/rds.svg",
          "maxInstances": 1,
          "isDistractor": false
        },
        {
          "code": "AWS_S3",
          "name": "Amazon S3",
          "category": "Storage",
          "iconUrl": "/icons/aws/s3.svg",
          "maxInstances": null,
          "isDistractor": true
        }
      ],
      "hintsSummary": {
        "totalHints": 3,
        "unlockedCount": 1,
        "unlockedHints": [
          {
            "orderIndex": 1,
            "text": "Piensa en cómo distribuir el tráfico entrante de manera balanceada.",
            "penaltyApplied": 5
          }
        ]
      },
      "lastAttemptGraph": null
    }
  }
  ```

---

### 4.3. Módulo de Pistas Educativas (`/challenges/:id/hints`)

#### `POST /challenges/:id/hints/unlock`
Desbloquea la siguiente pista disponible en orden secuencial (**RN-06, RN-07, CU-04**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Request Body:** Vacío.
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "unlockedHint": {
        "orderIndex": 2,
        "text": "Tu aplicación tiene múltiples servidores; necesitas un servicio administrado de Load Balancing.",
        "penaltyPoints": 10
      },
      "totalHintsUnlocked": 2,
      "totalPenaltyAccumulated": 15
    }
  }
  ```
* **Error Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "error": {
      "code": "ALL_HINTS_UNLOCKED",
      "message": "Ya has desbloqueado todas las pistas disponibles para este desafío."
    }
  }
  ```

---

### 4.4. Módulo de Evaluación de Arquitecturas (`/challenges/:id/evaluate`)

#### `POST /challenges/:id/evaluate`
Envía la arquitectura diseñada en el canvas para ser evaluada por el motor de reglas en memoria (**RN-08 a RN-10, CU-05**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Request Body (`EvaluateArchitectureDto`):**
  ```json
  {
    "graph": {
      "components": [
        {
          "id": "node-1",
          "serviceCode": "AWS_ALB",
          "config": {}
        },
        {
          "id": "node-2",
          "serviceCode": "AWS_EC2",
          "config": {
            "autoScaling": true,
            "instanceCount": 2
          }
        },
        {
          "id": "node-3",
          "serviceCode": "AWS_RDS",
          "config": {
            "isMultiAz": true
          }
        }
      ],
      "connections": [
        {
          "fromComponentId": "node-1",
          "toComponentId": "node-2",
          "connectionType": "HTTP_HTTPS"
        },
        {
          "fromComponentId": "node-2",
          "toComponentId": "node-3",
          "connectionType": "DATABASE"
        }
      ]
    },
    "hintsUsed": 1
  }
  ```

* **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "score": 95,
      "passed": true,
      "isNewHighScore": true,
      "earnedXP": 95,
      "currentUserXP": 445,
      "currentUserLevel": 3,
      "feedback": {
        "summary": "¡Excelente arquitectura! Cumple con alta disponibilidad y resiliencia.",
        "items": [
          {
            "status": "PASS",
            "category": "SERVICE_SELECTION",
            "title": "Balanceador de Carga configurado",
            "explanation": "El uso de Application Load Balancer distribuye adecuadamente las peticiones."
          },
          {
            "status": "PASS",
            "category": "AVAILABILITY",
            "title": "Redundancia en Base de Datos",
            "explanation": "Amazon RDS configurado en Multi-AZ garantiza continuidad ante fallos de zona."
          },
          {
            "status": "INFO",
            "category": "HINT_PENALTY",
            "title": "Penalización de Pistas",
            "explanation": "Se descontaron 5 puntos por el uso de 1 pista."
          }
        ]
      },
      "attemptId": "att-9012-uuid"
    }
  }
  ```

---

#### `GET /challenges/:id/attempts`
Obtiene el historial cronológico de intentos realizados por el usuario en el desafío especificado (**CU-05**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "att-9012-uuid",
        "score": 95,
        "passed": true,
        "hintsUsed": 1,
        "createdAt": "2026-09-12T18:30:00.000Z",
        "graphSubmitted": {
          "components": [
            { "id": "node-1", "serviceCode": "AWS_ALB" },
            { "id": "node-2", "serviceCode": "AWS_EC2" },
            { "id": "node-3", "serviceCode": "AWS_RDS" }
          ],
          "connections": [
            { "fromComponentId": "node-1", "toComponentId": "node-2" },
            { "fromComponentId": "node-2", "toComponentId": "node-3" }
          ]
        }
      }
    ]
  }
  ```

---

### 4.5. Módulo del Catálogo Maestro de Servicios AWS (`/services`)

#### `GET /services`
Obtiene la lista completa de servicios AWS disponibles en la plataforma.

* **Headers:** No requeridos.
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "s-1-uuid",
        "code": "AWS_EC2",
        "name": "Amazon EC2",
        "category": "Compute",
        "shortDescription": "Capacidad de cómputo escalable y servidores virtuales en la nube.",
        "iconUrl": "/icons/aws/ec2.svg",
        "isActive": true
      },
      {
        "id": "s-2-uuid",
        "code": "AWS_RDS",
        "name": "Amazon RDS",
        "category": "Database",
        "shortDescription": "Servicio de base de datos relacional administrado.",
        "iconUrl": "/icons/aws/rds.svg",
        "isActive": true
      }
    ]
  }
  ```

---

### 4.6. Módulo de Configuración del Sistema (`/system/config`)

#### `GET /system/config`
Obtiene la política global de accesibilidad configurada (**RN-01**).

* **Headers:** No requeridos.
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "accessMode": "OPEN_ACCESS",
      "updatedAt": "2026-09-11T16:00:00.000Z"
    }
  }
  ```

---

#### `PATCH /system/config`
Actualiza la política global de accesibilidad (**RN-01 / CU-07**).

* **Headers:** `Authorization: Bearer <JWT>` *(Requerido)*
* **Request Body (`UpdateSystemConfigDto`):**
  ```json
  {
    "accessMode": "PROGRESSIVE"
  }
  ```
* **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "accessMode": "PROGRESSIVE",
      "updatedAt": "2026-09-11T19:05:00.000Z"
    }
  }
  ```

---

## 5. Matriz de Trazabilidad entre Endpoints y Casos de Uso

| Endpoint HTTP | Caso de Uso Asociado | Reglas de Negocio Vinculadas |
| :--- | :--- | :--- |
| `POST /auth/guest` | CU-01, CU-02 (Acceso sin fricción) | Modo Invitado (RF-20) |
| `POST /auth/register` | CU-08 (Registrarse y Migrar Progreso) | RN-13 (Migración de Progreso) |
| `GET /units` | CU-01 (Explorar Catálogo) | RN-01 (Modo Libre / Progresivo) |
| `GET /challenges/:id` | CU-02 (Iniciar Desafío) | RN-03, RN-04 (Restricciones y Límites) |
| `POST /challenges/:id/hints/unlock` | CU-04 (Solicitar Pista) | RN-06, RN-07 (Pistas y Penalización) |
| `POST /challenges/:id/evaluate` | CU-05 (Evaluar Arquitectura) | RN-02, RN-05, RN-08 a RN-10, RN-12 |
| `GET /challenges/:id/attempts` | CU-05 (Historial de Intentos) | RN-09, RN-11 (Auditoría de Intentos) |
| `PATCH /system/config` | CU-07 (Configurar Accesibilidad) | RN-01 (Política Configurable) |
