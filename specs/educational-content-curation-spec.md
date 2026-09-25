# Especificación Técnica: Carga y Curaduría de Contenido Educativo MVP (Fase 7 - Hito 7.3)

## 1. Introducción y Objetivos

Esta especificación técnica define el currículo educativo oficial, el diseño pedagógico de los casos prácticos, las reglas declarativas de evaluación, el sistema de pistas y los esquemas JSON para la **Carga y Curaduría de Contenido Educativo MVP**, correspondiente a la **Tarea 7.3** de la **Fase 7** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

### Objetivos Clave:
1. **Currículo Educativo Estructurado y Progresivo:** Proveer **4 unidades temáticas oficiales** que guían al estudiante desde conceptos fundamentales de cómputo y almacenamiento hasta arquitecturas empresariales integradoras de 3 capas.
2. **Diversidad de Modalidades de Juego:** Incluir tanto desafíos de construcción desde cero (**`BUILDER`**) como de diagnóstico y resolución de fallos sobre infraestructuras preexistentes (**`FIX_ARCHITECTURE`**).
3. **Alineación con el AWS Well-Architected Framework:** Enseñar principios arquitectónicos reales:
   - **Confiabilidad / Alta Disponibilidad:** Eliminación de Single Points of Failure (SPOF), redundancia Multi-AZ, Elastic Load Balancing y Auto Scaling.
   - **Seguridad:** Aislamiento de datos, bases de datos privadas no expuestas a Internet e intermediación estricta de tráfico.
   - **Eficiencia de Rendimiento:** Desacoplamiento de activos estáticos en almacenamiento de objetos (S3).
4. **Reglas de Evaluación Rigurosas y Pedagógicas:** Definir formalmente para cada desafío las reglas de servicios obligatorios, prohibidos, límites de instancias, conexiones requeridas, conexiones prohibidas y detección de antipatrones con mensajes de feedback claros y formativos.
5. **Pistas Progresivas Equitativas:** Diseñar secuencias de pistas (1 a 3 niveles) con penalizaciones balanceadas (**RN-06**, **RN-07**) que estimulen el razonamiento crítico antes de desvelar la solución.
6. **Validación Automatizada (Gold Solutions):** Garantizar mediante pruebas automatizadas que cada desafío cuenta con una solución canónica verificable que obtiene exactamente 100/100 puntos.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MAPA CURRICULAR EDUCATIVO MVP                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ UNIDAD 1: Fundamentos de Cómputo y Almacenamiento ]                      │
│   ├── Desafío 101: Servidor Web Básico en EC2 (Builder / Fácil - 100 XP)   │
│   └── Desafío 102: Hosting Estático y Activos en S3 (Builder / Fácil - 100XP)│
│                                 │                                           │
│                                 ▼                                           │
│  [ UNIDAD 2: Alta Disponibilidad y Balanceo de Carga ]                      │
│   ├── Desafío 201: Arquitectura Web 3 Capas Resiliente (Builder/Med - 150XP)│
│   └── Desafío 202: Reparación de Monolito sin Balanceo (FixArch/Med - 150XP) │
│                                 │                                           │
│                                 ▼                                           │
│  [ UNIDAD 3: Capa de Datos Resiliente y Seguridad ]                         │
│   ├── Desafío 301: Base de Datos Relacional Multi-AZ (Builder / Med - 150XP)│
│   └── Desafío 302: Reparación de BD Pública Expuesta (FixArch / Med - 150XP) │
│                                 │                                           │
│                                 ▼                                           │
│  [ UNIDAD 4: Desafíos Integradores y Arquitectura Cloud ]                   │
│   ├── Desafío 401: Plataforma E-Commerce de Alta Demanda (Builder/Hard-200XP)│
│   └── Desafío 402: Auditoría y Resiliencia Empresarial (FixArch/Hard-200XP) │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos, Reglas de Negocio y Pilares Pedagógicos

| Requisito / Regla | Concepto | Aplicación en la Curaduría de Contenido |
| :--- | :--- | :--- |
| **RF-01 / RF-02** | Catálogo de Unidades y Desafíos | 4 unidades temáticas con 8 desafíos organizados por índice de orden y dificultad. |
| **RF-03 / RF-04** | Servicios y Distractores | Cada desafío delimita los servicios autorizados e introduce distractores intencionales. |
| **RF-05 / RF-09** | Modalidades de Interacción | Soporte nativo para modalidad `BUILDER` (canvas limpio) y `FIX_ARCHITECTURE` (grafo inicial con fallos). |
| **RF-13 a RF-18** | Motor de Evaluación | Definición declarativa de `requiredServices`, `forbiddenServices`, `requiredConnections`, `forbiddenConnections` y `antiPatterns`. |
| **RF-21 / RF-22** | Contenido Declarativo GitOps | Versionamiento 100% en archivos JSON dentro del repositorio (`content/`). |
| **RN-01** | Accesibilidad Configurable | Contenido compatible tanto con Modo Libre como con progresión secuencial. |
| **RN-02** | Umbral de Aprobación | Umbral canónico de 70/100 puntos en todos los desafíos. |
| **RN-03 / RN-04** | Límites de Instanciación | `maxInstances` configurado en `allowedServices` y en `evaluationRules`. |
| **RN-05** | Validez Topológica | Reglas de conexión dirigidas (`HTTP_HTTPS`, `DATABASE`, `STORAGE`, `SECURITY_GROUP`). |
| **RN-06 / RN-07** | Pistas Secuenciales y Deducciones | 1 a 3 pistas por desafío con deducciones de 5, 10 y 15 puntos. |
| **RN-08** | Penalizaciones por Antipatrones | Detección de SPOF (-20 pts), base de datos pública (-25 pts), conex. inválidas (-25 pts). |
| **RN-10** | XP Anti-Farmeo | Asignación de base XP proporcional a la complejidad (Fácil: 100 XP, Intermedio: 150 XP, Integrador/Difícil: 200 XP). |

---

## 3. Catálogo Maestro de Servicios AWS (`content/services/aws-services.json`)

Para soportar el currículo completo del MVP y permitir una adecuada discriminación arquitectónica con servicios distractores y complementarios, el catálogo maestro se actualiza a los siguientes servicios esenciales:

```json
[
  {
    "code": "AWS_ALB",
    "name": "Application Load Balancer",
    "category": "Networking",
    "shortDescription": "Distribución elástica de tráfico HTTP/HTTPS a nivel de capa de aplicación (L7).",
    "iconUrl": "/icons/aws/alb.svg",
    "isActive": true
  },
  {
    "code": "AWS_EC2",
    "name": "Amazon EC2",
    "category": "Compute",
    "shortDescription": "Instancias de cómputo virtual escalables y seguras en la nube.",
    "iconUrl": "/icons/aws/ec2.svg",
    "isActive": true
  },
  {
    "code": "AWS_RDS",
    "name": "Amazon RDS",
    "category": "Database",
    "shortDescription": "Servicio administrado de base de datos relacional con soporte Multi-AZ.",
    "iconUrl": "/icons/aws/rds.svg",
    "isActive": true
  },
  {
    "code": "AWS_S3",
    "name": "Amazon S3",
    "category": "Storage",
    "shortDescription": "Almacenamiento de objetos altamente escalable, duradero y seguro.",
    "iconUrl": "/icons/aws/s3.svg",
    "isActive": true
  },
  {
    "code": "AWS_CLOUDFRONT",
    "name": "Amazon CloudFront",
    "category": "Networking",
    "shortDescription": "Red de entrega de contenido (CDN) global de baja latencia.",
    "iconUrl": "/icons/aws/cloudfront.svg",
    "isActive": true
  },
  {
    "code": "AWS_DYNAMODB",
    "name": "Amazon DynamoDB",
    "category": "Database",
    "shortDescription": "Base de datos NoSQL de clave-valor totalmente administrada y de alto rendimiento.",
    "iconUrl": "/icons/aws/dynamodb.svg",
    "isActive": true
  }
]
```

---

## 4. Estructura de Directorios de Contenido

```text
content/
├── services/
│   └── aws-services.json
├── system-config.json
└── challenges/
    ├── unit-1/
    │   ├── unit.json
    │   ├── challenge-101.json       # Servidor Web Básico en EC2 (Builder)
    │   └── challenge-102.json       # Alojamiento Estático y Assets en S3 (Builder)
    ├── unit-2/
    │   ├── unit.json
    │   ├── challenge-201.json       # Arquitectura Web 3 Capas Resiliente (Builder)
    │   └── challenge-202.json       # Reparación de Monolito sin Balanceo (FixArch)
    ├── unit-3/
    │   ├── unit.json
    │   ├── challenge-301.json       # Base de Datos Relacional Multi-AZ (Builder)
    │   └── challenge-302.json       # Reparación de BD Pública Expuesta (FixArch)
    └── unit-4/
        ├── unit.json
        ├── challenge-401.json       # E-Commerce de Alta Demanda (Builder Integrador)
        └── challenge-402.json       # Auditoría y Resiliencia Empresarial (FixArch Integrador)
```

---

## 5. Especificación Detallada de las Unidades y Desafíos

### 5.1. Unidad 1: Fundamentos de Cómputo y Almacenamiento (`unit-1`)

#### `content/challenges/unit-1/unit.json`
```json
{
  "title": "Fundamentos de Cómputo y Almacenamiento",
  "description": "Aprende los conceptos esenciales de servidores virtuales en la nube con Amazon EC2 y almacenamiento de objetos duradero con Amazon S3.",
  "orderIndex": 1
}
```

#### Desafío 101: `challenge-101.json` (Servidor Web Básico en EC2)
* **Objetivo:** Introducir la instanciación de un servidor web monolítico simple en EC2.
* **Modalidad:** `BUILDER` | **Dificultad:** `Easy` | **Base XP:** 100 | **Required XP:** 0 | **Order:** 1
* **Definición JSON:**
```json
{
  "title": "Servidor Web Básico en EC2",
  "description": "Diseña una infraestructura simple para alojar una aplicación web inicial en una instancia virtual Amazon EC2.",
  "difficulty": "Easy",
  "mode": "BUILDER",
  "baseXP": 100,
  "requiredXP": 0,
  "orderIndex": 1,
  "allowedServices": [
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": null,
      "isDistractor": true
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Selecciona una instancia Amazon EC2 de la paleta lateral y arrástrala al canvas para proporcionar la capacidad de cómputo requerida.",
      "penaltyPoints": 5
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_EC2"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 1
    },
    "maxInstances": {
      "AWS_EC2": 1
    },
    "requiredConnections": [],
    "forbiddenConnections": [],
    "antiPatterns": [],
    "passingScoreThreshold": 70
  }
}
```

---

#### Desafío 102: `challenge-102.json` (Alojamiento de Activos Estáticos en S3)
* **Objetivo:** Comprender el desacoplamiento de almacenamiento de archivos estáticos (imágenes, CSS, JS) utilizando Amazon S3 junto a servidores EC2.
* **Modalidad:** `BUILDER` | **Dificultad:** `Easy` | **Base XP:** 100 | **Required XP:** 0 | **Order:** 2
* **Definición JSON:**
```json
{
  "title": "Alojamiento de Activos Estáticos en S3",
  "description": "Desacopla los archivos estáticos y multimedia de tu servidor web EC2 conectándolo a un bucket de almacenamiento de objetos Amazon S3.",
  "difficulty": "Easy",
  "mode": "BUILDER",
  "baseXP": 100,
  "requiredXP": 0,
  "orderIndex": 2,
  "allowedServices": [
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": null,
      "isDistractor": true
    },
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Agrega una instancia Amazon EC2 para procesar las solicitudes de aplicación y un bucket Amazon S3 para los archivos estáticos.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Conecta el servidor EC2 hacia el bucket S3 para permitir la lectura y subida de archivos multimedia.",
      "penaltyPoints": 10
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_EC2",
      "AWS_S3"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 1,
      "AWS_S3": 1
    },
    "maxInstances": {
      "AWS_EC2": 1,
      "AWS_S3": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_S3",
        "connectionType": "STORAGE",
        "penaltyIfMissing": 30,
        "description": "La instancia EC2 debe conectarse a Amazon S3 para almacenar y recuperar objetos estáticos."
      }
    ],
    "forbiddenConnections": [],
    "antiPatterns": [],
    "passingScoreThreshold": 70
  }
}
```

---

### 5.2. Unidad 2: Alta Disponibilidad, Escalabilidad y Balanceo (`unit-2`)

#### `content/challenges/unit-2/unit.json`
```json
{
  "title": "Alta Disponibilidad y Balanceo de Carga",
  "description": "Aprende a diseñar infraestructuras elásticas y redundantes capaces de distribuir tráfico mediante balanceadores de carga y evitar puntos únicos de fallo.",
  "orderIndex": 2
}
```

#### Desafío 201: `challenge-201.json` (Arquitectura Web de 3 Capas Resiliente)
* **Objetivo:** Construir desde cero una arquitectura de 3 capas con balanceo, cómputo escalable y base de datos relacional redundante.
* **Modalidad:** `BUILDER` | **Dificultad:** `Intermediate` | **Base XP:** 150 | **Required XP:** 0 | **Order:** 1
* **Definición JSON:**
```json
{
  "title": "Arquitectura Web de 3 Capas Resiliente",
  "description": "Diseña una arquitectura altamente disponible con balanceo de carga (ALB), escalado automático de servidores web (EC2) y base de datos relacional redundante (RDS Multi-AZ).",
  "difficulty": "Intermediate",
  "mode": "BUILDER",
  "baseXP": 150,
  "requiredXP": 0,
  "orderIndex": 1,
  "allowedServices": [
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 4,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": null,
      "isDistractor": true
    },
    {
      "serviceCode": "AWS_DYNAMODB",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Piensa en cómo balancear el tráfico web entrante antes de que llegue a las instancias de cómputo.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Conecta el Application Load Balancer hacia las instancias EC2 configuradas con Auto Scaling.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Configura Amazon RDS con la opción Multi-AZ habilitada y enlaza las EC2 a la base de datos.",
      "penaltyPoints": 15
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_ALB",
      "AWS_EC2",
      "AWS_RDS"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 2
    },
    "maxInstances": {
      "AWS_ALB": 1,
      "AWS_RDS": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP_HTTPS",
        "penaltyIfMissing": 15,
        "description": "El Application Load Balancer debe distribuir el tráfico hacia las instancias EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben conectarse a la base de datos relacional RDS."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_RDS",
        "reason": "Un balanceador de carga web no debe conectarse directamente a la base de datos.",
        "penalty": 25
      }
    ],
    "antiPatterns": [
      {
        "code": "SPOF_EC2",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Availability",
        "title": "Punto Único de Fallo en Cómputo",
        "feedback": "Una sola instancia EC2 sin Auto Scaling representa un Single Point of Failure. Agrega al menos 2 instancias o habilita Auto Scaling."
      },
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "La base de datos RDS no debe tener acceso público activado. Mantén la base de datos en una subred privada."
      },
      {
        "code": "NO_MULTIAZ_RDS",
        "type": "MissingMultiAz",
        "penalty": 15,
        "category": "Reliability",
        "title": "Base de Datos sin Redundancia Multi-AZ",
        "feedback": "En una arquitectura resiliente, Amazon RDS debe tener la opción Multi-AZ habilitada para tolerancia a caídas de zona."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

#### Desafío 202: `challenge-202.json` (Reparación de Monolito sin Balanceo)
* **Objetivo:** Recibir un diagrama preexistente defectuoso (1 sola EC2 conectada a RDS sin balanceador) y transformarlo en una solución resiliente.
* **Modalidad:** `FIX_ARCHITECTURE` | **Dificultad:** `Intermediate` | **Base XP:** 150 | **Required XP:** 0 | **Order:** 2
* **Grafo Inicial Pre-Cargado:**
  - Nodo 1: `AWS_EC2` (`instanceCount: 1`, `autoScaling: false`)
  - Nodo 2: `AWS_RDS` (`isMultiAz: false`, `isPublic: false`)
  - Conexión: `AWS_EC2 -> AWS_RDS` (`DATABASE`)
* **Definición JSON:**
```json
{
  "title": "Reparación de Monolito sin Balanceo",
  "description": "Una aplicación en producción experimenta caídas por saturación en su único servidor web. Corrige la arquitectura incorporando un Application Load Balancer y escalabilidad horizontal.",
  "difficulty": "Intermediate",
  "mode": "FIX_ARCHITECTURE",
  "baseXP": 150,
  "requiredXP": 0,
  "orderIndex": 2,
  "initialGraph": {
    "components": [
      {
        "id": "node-legacy-ec2",
        "serviceCode": "AWS_EC2",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": true
        }
      },
      {
        "id": "node-legacy-rds",
        "serviceCode": "AWS_RDS",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": false
        }
      }
    ],
    "connections": [
      {
        "id": "edge-ec2-rds",
        "fromComponentId": "node-legacy-ec2",
        "toComponentId": "node-legacy-rds",
        "connectionType": "DATABASE"
      }
    ]
  },
  "allowedServices": [
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 4,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_CLOUDFRONT",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Inserta un Application Load Balancer al inicio para recibir el tráfico de los usuarios.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Agrega una segunda instancia EC2 o habilita Auto Scaling en el cómputo y conéctalas al ALB.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Asegúrate de que la base de datos RDS tenga activada la opción Multi-AZ para alta disponibilidad.",
      "penaltyPoints": 15
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_ALB",
      "AWS_EC2",
      "AWS_RDS"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 2
    },
    "maxInstances": {
      "AWS_ALB": 1,
      "AWS_RDS": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP_HTTPS",
        "penaltyIfMissing": 20,
        "description": "El balanceador ALB debe distribuir las solicitudes HTTP hacia la capa de cómputo EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 20,
        "description": "Las instancias EC2 deben conectarse a la base de datos relacional RDS."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_RDS",
        "reason": "El balanceador de carga no debe conectarse directamente a la base de datos.",
        "penalty": 25
      }
    ],
    "antiPatterns": [
      {
        "code": "SPOF_EC2",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Availability",
        "title": "Punto Único de Fallo en Cómputo",
        "feedback": "Existe una única instancia EC2 sin redundancia. Incorpora al menos 2 instancias o habilita Auto Scaling."
      },
      {
        "code": "MISSING_ALB",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Networking",
        "title": "Falta Balanceador de Carga",
        "feedback": "Sin un Application Load Balancer, el tráfico no puede distribuirse equitativamente entre los servidores web."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

### 5.3. Unidad 3: Capa de Datos Resiliente y Seguridad en Base de Datos (`unit-3`)

#### `content/challenges/unit-3/unit.json`
```json
{
  "title": "Capa de Datos Resiliente y Seguridad",
  "description": "Aprende a proteger la persistencia relacional con réplicas sincrónicas Multi-AZ y aislamiento de red en subredes privadas.",
  "orderIndex": 3
}
```

#### Desafío 301: `challenge-301.json` (Base de Datos Relacional Multi-AZ con Acceso Aislado)
* **Objetivo:** Diseñar una capa de persistencia crítica con RDS Multi-AZ, prohibiendo cualquier conexión directa desde fuera de la VPC / fuera de las instancias autorizadas.
* **Modalidad:** `BUILDER` | **Dificultad:** `Intermediate` | **Base XP:** 150 | **Required XP:** 0 | **Order:** 1
* **Definición JSON:**
```json
{
  "title": "Base de Datos Relacional Multi-AZ con Acceso Aislado",
  "description": "Diseña una solución donde las instancias de aplicación EC2 interactúen de forma segura con una base de datos relacional Amazon RDS configurada con alta disponibilidad Multi-AZ y sin exposición a Internet.",
  "difficulty": "Intermediate",
  "mode": "BUILDER",
  "baseXP": 150,
  "requiredXP": 0,
  "orderIndex": 1,
  "allowedServices": [
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 2,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_DYNAMODB",
      "maxInstances": null,
      "isDistractor": true
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Coloca las instancias EC2 para procesar la lógica de negocio y la base de datos RDS para la persistencia transaccional.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Asegúrate de que Amazon RDS tenga la propiedad Multi-AZ activa y que su acceso público esté desactivado.",
      "penaltyPoints": 10
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_EC2",
      "AWS_RDS"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 1,
      "AWS_RDS": 1
    },
    "maxInstances": {
      "AWS_RDS": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 25,
        "description": "Las instancias EC2 deben conectarse a Amazon RDS mediante una conexión de base de datos segura."
      }
    ],
    "forbiddenConnections": [],
    "antiPatterns": [
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "La base de datos relacional tiene acceso público habilitado. Debe residir exclusivamente en subredes privadas."
      },
      {
        "code": "NO_MULTIAZ_RDS",
        "type": "MissingMultiAz",
        "penalty": 20,
        "category": "Reliability",
        "title": "Falta Replicación Multi-AZ",
        "feedback": "Habilita la opción Multi-AZ en RDS para garantizar continuidad de negocio ante desastres zonales."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

#### Desafío 302: `challenge-302.json` (Reparación de Base de Datos Pública Expuesta)
* **Objetivo:** Recibir un diagrama donde la base de datos RDS tiene `isPublic: true` y no tiene Multi-AZ, corregir la vulnerabilidad y asegurar la topología.
* **Modalidad:** `FIX_ARCHITECTURE` | **Dificultad:** `Intermediate` | **Base XP:** 150 | **Required XP:** 0 | **Order:** 2
* **Grafo Inicial Pre-Cargado:**
  - Nodo 1: `AWS_EC2` (`instanceCount: 2`, `autoScaling: true`)
  - Nodo 2: `AWS_RDS` (`isMultiAz: false`, `isPublic: true`)
  - Conexión: `AWS_EC2 -> AWS_RDS` (`DATABASE`)
* **Definición JSON:**
```json
{
  "title": "Reparación de Base de Datos Pública Expuesta",
  "description": "Una auditoría de seguridad detectó que la base de datos de producción es accesible directamente desde Internet y carece de réplica secundaria. Modifica la configuración y asegura la infraestructura.",
  "difficulty": "Intermediate",
  "mode": "FIX_ARCHITECTURE",
  "baseXP": 150,
  "requiredXP": 0,
  "orderIndex": 2,
  "initialGraph": {
    "components": [
      {
        "id": "node-app-ec2",
        "serviceCode": "AWS_EC2",
        "config": {
          "instanceCount": 2,
          "autoScaling": true,
          "isMultiAz": true,
          "isPublic": false
        }
      },
      {
        "id": "node-vulnerable-rds",
        "serviceCode": "AWS_RDS",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": true
        }
      }
    ],
    "connections": [
      {
        "id": "edge-ec2-to-rds",
        "fromComponentId": "node-app-ec2",
        "toComponentId": "node-vulnerable-rds",
        "connectionType": "DATABASE"
      }
    ]
  },
  "allowedServices": [
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 2,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Revisa la configuración del nodo RDS: desactiva la opción pública para restringir el acceso a la red interna.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Activa la casilla Multi-AZ en el nodo RDS para garantizar tolerancia a caídas.",
      "penaltyPoints": 10
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_EC2",
      "AWS_RDS"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 1,
      "AWS_RDS": 1
    },
    "maxInstances": {
      "AWS_RDS": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 25,
        "description": "Las instancias EC2 deben conectarse a la base de datos relacional RDS."
      }
    ],
    "forbiddenConnections": [],
    "antiPatterns": [
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 30,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "La base de datos sigue configurada como pública. Desactiva la opción 'isPublic' en la configuración del nodo."
      },
      {
        "code": "NO_MULTIAZ_RDS",
        "type": "MissingMultiAz",
        "penalty": 20,
        "category": "Reliability",
        "title": "Falta Redundancia Multi-AZ en RDS",
        "feedback": "Habilita la opción Multi-AZ en la base de datos para garantizar conmutación por error automática."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

### 5.4. Unidad 4: Desafíos Integradores y Arquitectura Cloud Empresarial (`unit-4`)

#### `content/challenges/unit-4/unit.json`
```json
{
  "title": "Desafíos Integradores y Arquitectura Cloud",
  "description": "Aplica todos los conceptos adquiridos para diseñar y auditar arquitecturas empresariales completas de comercio electrónico y alta concurrencia.",
  "orderIndex": 4
}
```

#### Desafío 401: `challenge-401.json` (Plataforma E-Commerce de Alta Demanda)
* **Objetivo:** Desafío integrador de nivel difícil (`Integrator`). Combina ALB, cómputo horizontal en EC2 con Auto Scaling, persistencia transaccional en RDS Multi-AZ y bucket S3 para catálogo de imágenes de productos.
* **Modalidad:** `BUILDER` | **Dificultad:** `Hard` | **Base XP:** 200 | **Required XP:** 0 | **Order:** 1
* **Definición JSON:**
```json
{
  "title": "Plataforma E-Commerce de Alta Demanda",
  "description": "Diseña la infraestructura completa para una tienda online con tráfico masivo: balanceo de carga L7 (ALB), capa de cómputo escalable (EC2 Auto Scaling), almacenamiento de imágenes de productos (S3) y base de datos relacional redundante (RDS Multi-AZ).",
  "difficulty": "Hard",
  "mode": "BUILDER",
  "baseXP": 200,
  "requiredXP": 0,
  "orderIndex": 1,
  "allowedServices": [
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 4,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_DYNAMODB",
      "maxInstances": null,
      "isDistractor": true
    },
    {
      "serviceCode": "AWS_CLOUDFRONT",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Comienza colocando un Application Load Balancer para distribuir el tráfico entrante hacia la flota de instancias EC2.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Conecta las instancias EC2 con Auto Scaling tanto a la base de datos RDS Multi-AZ como al bucket Amazon S3.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Verifica que la base de datos no tenga acceso público y que el balanceador no se conecte directamente a RDS.",
      "penaltyPoints": 15
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_ALB",
      "AWS_EC2",
      "AWS_RDS",
      "AWS_S3"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 2
    },
    "maxInstances": {
      "AWS_ALB": 1,
      "AWS_RDS": 1,
      "AWS_S3": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP_HTTPS",
        "penaltyIfMissing": 15,
        "description": "El Application Load Balancer debe distribuir las peticiones web a las instancias EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben conectarse a Amazon RDS para las operaciones transaccionales de compra."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_S3",
        "connectionType": "STORAGE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben interactuar con Amazon S3 para cargar y recuperar fotos de productos."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_RDS",
        "reason": "El balanceador de carga web no debe puentear la capa de cómputo hacia la base de datos.",
        "penalty": 25
      },
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_S3",
        "reason": "El balanceador ALB no debe conectarse directamente al bucket S3 en esta arquitectura.",
        "penalty": 20
      }
    ],
    "antiPatterns": [
      {
        "code": "SPOF_EC2",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Availability",
        "title": "Punto Único de Fallo en Cómputo",
        "feedback": "Una sola instancia EC2 no soportará el tráfico del Black Friday. Agrega al menos 2 instancias o activa Auto Scaling."
      },
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "La base de datos relacional debe ser privada para salvaguardar los datos bancarios y personales de los clientes."
      },
      {
        "code": "NO_MULTIAZ_RDS",
        "type": "MissingMultiAz",
        "penalty": 15,
        "category": "Reliability",
        "title": "Base de Datos sin Redundancia Multi-AZ",
        "feedback": "Amazon RDS debe contar con replicación Multi-AZ activa para evitar pérdidas en caso de caída del centro de datos primario."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

#### Desafío 402: `challenge-402.json` (Auditoría y Resiliencia Empresarial)
* **Objetivo:** Auditoría integral sobre una infraestructura crítica con múltiples fallos concurrentes (SPOF en cómputo, conexión inválida de ALB directo a RDS, falta de S3 para activos, y RDS no Multi-AZ).
* **Modalidad:** `FIX_ARCHITECTURE` | **Dificultad:** `Hard` | **Base XP:** 200 | **Required XP:** 0 | **Order:** 2
* **Grafo Inicial Pre-Cargado:**
  - Nodo 1: `AWS_ALB` (`instanceCount: 1`)
  - Nodo 2: `AWS_EC2` (`instanceCount: 1`, `autoScaling: false`, `isPublic: true`)
  - Nodo 3: `AWS_RDS` (`instanceCount: 1`, `isMultiAz: false`, `isPublic: true`)
  - Conexión 1: `AWS_ALB -> AWS_RDS` (`HTTP_HTTPS` - Inválida)
  - Conexión 2: `AWS_EC2 -> AWS_RDS` (`DATABASE`)
* **Definición JSON:**
```json
{
  "title": "Auditoría y Resiliencia Empresarial",
  "description": "Una consultoría externa identificó graves vulnerabilidades y riesgos de disponibilidad en la arquitectura corporativa. Elimina las conexiones indebidas, protege la base de datos, incorpora Auto Scaling y almacenamiento duradero en S3.",
  "difficulty": "Hard",
  "mode": "FIX_ARCHITECTURE",
  "baseXP": 200,
  "requiredXP": 0,
  "orderIndex": 2,
  "initialGraph": {
    "components": [
      {
        "id": "node-corp-alb",
        "serviceCode": "AWS_ALB",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": true
        }
      },
      {
        "id": "node-corp-ec2",
        "serviceCode": "AWS_EC2",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": true
        }
      },
      {
        "id": "node-corp-rds",
        "serviceCode": "AWS_RDS",
        "config": {
          "instanceCount": 1,
          "autoScaling": false,
          "isMultiAz": false,
          "isPublic": true
        }
      }
    ],
    "connections": [
      {
        "id": "edge-invalid-alb-rds",
        "fromComponentId": "node-corp-alb",
        "toComponentId": "node-corp-rds",
        "connectionType": "HTTP_HTTPS"
      },
      {
        "id": "edge-ec2-rds",
        "fromComponentId": "node-corp-ec2",
        "toComponentId": "node-corp-rds",
        "connectionType": "DATABASE"
      }
    ]
  },
  "allowedServices": [
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_EC2",
      "maxInstances": 4,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_RDS",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_S3",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_DYNAMODB",
      "maxInstances": null,
      "isDistractor": true
    }
  ],
  "hints": [
    {
      "orderIndex": 1,
      "text": "Elimina la conexión directa errónea entre el Application Load Balancer y la base de datos RDS.",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Conecta el ALB a la capa EC2, agrega una segunda instancia o Auto Scaling, y asegura que RDS sea privada y Multi-AZ.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Incorpora un bucket Amazon S3 para activos estáticos y enlaza las instancias EC2 a este bucket.",
      "penaltyPoints": 15
    }
  ],
  "evaluationRules": {
    "requiredServices": [
      "AWS_ALB",
      "AWS_EC2",
      "AWS_RDS",
      "AWS_S3"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "AWS_EC2": 2
    },
    "maxInstances": {
      "AWS_ALB": 1,
      "AWS_RDS": 1,
      "AWS_S3": 1
    },
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP_HTTPS",
        "penaltyIfMissing": 15,
        "description": "El balanceador ALB debe distribuir las solicitudes a las instancias EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben conectarse a la base de datos relacional RDS."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_S3",
        "connectionType": "STORAGE",
        "penaltyIfMissing": 15,
        "description": "Las instancias EC2 deben conectarse a Amazon S3 para el almacenamiento de archivos y respaldos."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_RDS",
        "reason": "Conexión directa inválida: El balanceador de carga web no debe conectarse directamente a la base de datos.",
        "penalty": 25
      }
    ],
    "antiPatterns": [
      {
        "code": "SPOF_EC2",
        "type": "SinglePointOfFailure",
        "penalty": 20,
        "category": "Availability",
        "title": "Punto Único de Fallo en Cómputo",
        "feedback": "Existe un único servidor EC2. Agrega una segunda instancia o habilita Auto Scaling."
      },
      {
        "code": "PUBLIC_RDS",
        "type": "PublicDatabaseExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Base de Datos Expuesta a Internet",
        "feedback": "La base de datos RDS tiene acceso público. Modifica su configuración para hacerla privada."
      },
      {
        "code": "NO_MULTIAZ_RDS",
        "type": "MissingMultiAz",
        "penalty": 15,
        "category": "Reliability",
        "title": "Base de Datos sin Redundancia Multi-AZ",
        "feedback": "Habilita la opción Multi-AZ en RDS para asegurar disponibilidad ante contingencias zonales."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

## 6. Estrategia de Idempotencia y Carga Automática en PostgreSQL

1. **Lectura con `JsonChallengeContentReader`:**
   - Lee recursivamente el directorio `content/challenges/` ordenando por `unit.json -> orderIndex` y `challenge-XXX.json -> orderIndex`.
   - Lee `content/services/aws-services.json` y `content/system-config.json`.
   - Realiza validaciones sintácticas y semánticas previas (garantizar que todos los `serviceCode` existan en el catálogo maestro y que las penalizaciones sumen valores consistentes).
2. **Sincronización Atómica en `ChallengeSeeder`:**
   - Ejecuta un `IDbContextTransaction` atómico.
   - Realiza **Upsert Idempotente**:
     1. Inserta/Actualiza configuración global `SystemConfig`.
     2. Inserta/Actualiza catálogo maestro `AwsService`.
     3. Inserta/Actualiza `Unit` por título / orden.
     4. Inserta/Actualiza `Challenge` por título / unidad, serializando `EvaluationRulesJson` y `HintsJson` a `JSONB`.
     5. Inserta/Actualiza relaciones `ChallengeService` asociadas.

---

## 7. Estrategia de Pruebas y Validación Automatizada

### 7.1. Pruebas Unitarias de Integridad de Contenido (`ContentIntegrityTests.cs`)
- **Validez de Esquema:** Comprueba que todos los archivos JSON de las 4 unidades cumplan el contrato de serialización `System.Text.Json`.
- **Integridad Referencial:** Comprueba que no existan servicios referenciados en `allowedServices`, `requiredServices`, `requiredConnections` o `antiPatterns` que no estén dados de alta en `aws-services.json`.
- **Consistencia de Pistas:** Verifica que las pistas comiencen en `orderIndex: 1`, sean consecutivas y tengan penalizaciones estrictamente positivas.
- **Validez de Grafos Iniciales:** Verifica que para los desafíos con modalidad `FIX_ARCHITECTURE`, el `initialGraph` contenga nodos válidos y conexiones con identificadores existentes.

### 7.2. Pruebas de Solución Ideal (Gold Solutions - 8 Desafíos)
- Se implementará una suite de pruebas unitarias/integración que someta la **Solución Perfecta Canónica** para cada uno de los 8 desafíos al `EvaluationEngine` en memoria:
  1. `Challenge 101 Gold Solution`: 1 EC2 -> **Puntuación: 100/100 | Passed: True**
  2. `Challenge 102 Gold Solution`: 1 EC2 + 1 S3 + Edge EC2->S3 -> **Puntuación: 100/100 | Passed: True**
  3. `Challenge 201 Gold Solution`: 1 ALB + 2 EC2 (AutoScaling) + 1 RDS (Multi-AZ, privado) + Edges ALB->EC2 y EC2->RDS -> **Puntuación: 100/100 | Passed: True**
  4. `Challenge 202 Gold Solution`: Corrección de monolito con ALB + 2 EC2 + RDS Multi-AZ -> **Puntuación: 100/100 | Passed: True**
  5. `Challenge 301 Gold Solution`: 1 EC2 + 1 RDS (Multi-AZ, privado) + Edge EC2->RDS -> **Puntuación: 100/100 | Passed: True**
  6. `Challenge 302 Gold Solution`: Remediación de RDS privado y Multi-AZ -> **Puntuación: 100/100 | Passed: True**
  7. `Challenge 401 Gold Solution`: 1 ALB + 2 EC2 (AutoScaling) + 1 RDS (Multi-AZ) + 1 S3 + Edges ALB->EC2, EC2->RDS, EC2->S3 -> **Puntuación: 100/100 | Passed: True**
  8. `Challenge 402 Gold Solution`: Remediación integral sin conexiones inválidas y con S3 -> **Puntuación: 100/100 | Passed: True**

### 7.3. Pruebas de Antipatrones y Fallos
- Se validará que las soluciones con SPOF, BD pública, falta de balanceador o conexiones inválidas reciban las deducciones de puntaje correspondientes y el feedback pedagógico esperado.

---

## 8. Criterios de Aceptación para el Release MVP

1. **4 Unidades y 8 Desafíos Creados:** Todos los archivos JSON declarativos en `content/challenges/` y `content/services/` están redactados y validados.
2. **Seeding Idempotente Verificado:** Al levantar la API o ejecutar los tests de integración contra PostgreSQL, el seeder carga las 4 unidades, 8 desafíos y catálogo maestro sin errores.
3. **100% de Tests Verdes:** Las suites existentes y nuevas pasan al 100% (`npm run test:all`).
4. **Visualización en Frontend:** El catálogo en React muestra las 4 unidades con sus respectivos desafíos, badges de dificultad (`Easy`, `Intermediate`, `Hard`), modalidad y XP.
