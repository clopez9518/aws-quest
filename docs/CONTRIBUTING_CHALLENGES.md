# Guía de Autoría y Creación de Desafíos en AWS Quest (`CONTRIBUTING_CHALLENGES.md`)

Esta guía técnica está dirigida a instructores, diseñadores pedagógicos y arquitectos de soluciones de AWS que deseen crear, modificar o expandir el catálogo de desafíos y unidades de **AWS Quest** mediante archivos declarativos JSON, sin necesidad de escribir código C# o modificar componentes frontend.

---

## 1. Estructura de Archivos y Jerarquía

Los desafíos se organizan de forma declarativa dentro del directorio `content/challenges/`:

```
content/challenges/
├── unit-1/
│   ├── unit.json
│   ├── challenge-101.json
│   ├── challenge-102.json
│   └── ...
├── unit-2/
│   ├── unit.json
│   ├── challenge-201.json
│   └── ...
└── ...
```

### 1.1 Archivo de Unidad (`unit.json`)
Cada carpeta `unit-X` debe contener un archivo `unit.json` que describe la unidad curricular:

```json
{
  "orderIndex": 1,
  "title": "Unidad 1: Fundamentos de Cómputo y Almacenamiento",
  "description": "Aprende los pilares esenciales de infraestructura en la nube con Amazon EC2, EBS, EFS y S3.",
  "category": "Compute & Storage",
  "wave": 1
}
```

---

## 2. Esquema JSON Completo de un Desafío

A continuación se detalla la estructura canónica de un archivo `challenge-XYZ.json`:

```json
{
  "title": "Arquitectura Web con Balanceador de Carga y Base de Datos",
  "description": "Diseña una infraestructura escalable y segura desacoplando el tráfico web entrante hacia servidores EC2 privados y persistencia en Amazon RDS.",
  "difficulty": "Intermediate",
  "mode": "BUILDER",
  "baseXP": 150,
  "requiredXP": 120,
  "orderIndex": 2,

  "briefing": {
    "keyConcept": "Desacoplamiento y Alta Disponibilidad de Capas",
    "businessScenario": "Una plataforma SaaS de alta concurrencia requiere proteger sus instancias de backend del tráfico directo de Internet y distribuir las peticiones homogéneamente.",
    "learningObjective": "Aprender a posicionar un Application Load Balancer en subredes públicas y conectar servidores de cómputo en subredes privadas.",
    "keyTakeaways": [
      "El balanceador de carga actúa como el único punto de entrada público (Single Entry Point).",
      "Los servidores de aplicación nunca deben tener IP pública directa si están detrás de un ALB.",
      "La base de datos relacional debe ubicarse en una subred privada aislada."
    ],
    "estimatedReadTime": "45 seg",
    "keyComponents": [
      {
        "title": "Application Load Balancer (ALB)",
        "description": "Distribuye tráfico HTTP/HTTPS a nivel de capa 7 (aplicación) hacia múltiples destinos.",
        "serviceCode": "AWS_ALB",
        "category": "service",
        "slug": "application-load-balancer"
      },
      {
        "title": "Subred Privada",
        "description": "Segmento de red sin ruta directa a Internet Gateway para servidores de backend y bases de datos.",
        "category": "concept",
        "slug": "subnet-privada"
      }
    ]
  },

  "allowedServices": [
    {
      "serviceCode": "NET_VPC",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "NET_SUBNET",
      "maxInstances": 4,
      "isDistractor": false
    },
    {
      "serviceCode": "NET_IGW",
      "maxInstances": 1,
      "isDistractor": false
    },
    {
      "serviceCode": "AWS_ALB",
      "maxInstances": 1,
      "isDistractor": false
    },
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
    },
    {
      "serviceCode": "AWS_LAMBDA",
      "maxInstances": null,
      "isDistractor": true
    }
  ],

  "hints": [
    {
      "orderIndex": 1,
      "text": "¿Cómo debe distribuirse el tráfico web entrante antes de alcanzar las instancias de backend?",
      "penaltyPoints": 5
    },
    {
      "orderIndex": 2,
      "text": "Ubica el Application Load Balancer en la subred pública conectado al Internet Gateway.",
      "penaltyPoints": 10
    },
    {
      "orderIndex": 3,
      "text": "Conecta el balanceador ALB a las instancias EC2 privadas y éstas a la base de datos RDS.",
      "penaltyPoints": 15
    }
  ],

  "reflectionPrompt": {
    "question": "¿Por qué es una mejor práctica de seguridad ubicar las instancias EC2 en subredes privadas cuando se utiliza un Application Load Balancer?",
    "pillar": "Security",
    "bonusXP": 25,
    "options": [
      {
        "id": "opt-1",
        "text": "Porque previene que atacantes externos envíen tráfico directo a los puertos de los servidores sin pasar por las inspecciones y reglas del balanceador/WAF.",
        "isCorrect": true,
        "explanation": "Exacto. Al eliminar IPs públicas en los servidores web y forzar todo el tráfico a través del ALB, se reduce drásticamente la superficie de ataque."
      },
      {
        "id": "opt-2",
        "text": "Porque las subredes privadas tienen el doble de ancho de banda de red que las subredes públicas.",
        "isCorrect": false,
        "explanation": "Incorrecto. El rendimiento y ancho de banda de la red en AWS no depende del tipo de subred, sino del tipo de instancia EC2 y la configuración de VPC."
      }
    ]
  },

  "evaluationRules": {
    "requiredServices": [
      "NET_VPC",
      "NET_SUBNET",
      "NET_IGW",
      "AWS_ALB",
      "AWS_EC2",
      "AWS_RDS"
    ],
    "forbiddenServices": [],
    "minInstances": {
      "NET_VPC": 1,
      "NET_SUBNET": 2,
      "NET_IGW": 1,
      "AWS_ALB": 1,
      "AWS_EC2": 2,
      "AWS_RDS": 1
    },
    "maxInstances": {
      "NET_VPC": 1,
      "NET_SUBNET": 4,
      "NET_IGW": 1,
      "AWS_ALB": 1,
      "AWS_EC2": 2,
      "AWS_RDS": 1
    },
    "placementRules": [
      {
        "serviceCode": "AWS_ALB",
        "requiredContainerCode": "NET_SUBNET",
        "requiredSubnetTier": "Public",
        "penaltyIfViolated": 25,
        "description": "El balanceador ALB público debe residir en una subred pública."
      },
      {
        "serviceCode": "AWS_EC2",
        "requiredContainerCode": "NET_SUBNET",
        "requiredSubnetTier": "Private",
        "penaltyIfViolated": 20,
        "description": "Las instancias EC2 deben estar aisladas en subredes privadas."
      },
      {
        "serviceCode": "AWS_RDS",
        "requiredContainerCode": "NET_SUBNET",
        "requiredSubnetTier": "Private",
        "penaltyIfViolated": 25,
        "description": "La base de datos RDS debe ubicarse en una subred privada."
      }
    ],
    "requiredConnections": [
      {
        "fromServiceCode": "AWS_ALB",
        "toServiceCode": "AWS_EC2",
        "connectionType": "HTTP",
        "penaltyIfMissing": 20,
        "description": "El balanceador ALB debe reenviar tráfico HTTP a las instancias EC2."
      },
      {
        "fromServiceCode": "AWS_EC2",
        "toServiceCode": "AWS_RDS",
        "connectionType": "DATABASE",
        "penaltyIfMissing": 20,
        "description": "Las instancias EC2 deben comunicarse con la base de datos RDS."
      }
    ],
    "forbiddenConnections": [
      {
        "fromServiceCode": "NET_IGW",
        "toServiceCode": "AWS_EC2",
        "reason": "El Internet Gateway no debe conectarse directamente a instancias privadas detrás de un ALB.",
        "penalty": 25
      }
    ],
    "antiPatterns": [
      {
        "code": "DIRECT_PUBLIC_BACKEND",
        "type": "PublicBackendExposure",
        "penalty": 25,
        "category": "Security",
        "title": "Backend Expuesto a Internet",
        "feedback": "Tus servidores de cómputo tienen rutas públicas directas. Conéctalos a través del ALB en una subred privada."
      }
    ],
    "passingScoreThreshold": 70
  }
}
```

---

## 3. Guía Pedagógica para la Redacción de Desafíos

### 3.1 Servicios Distractores (`isDistractor: true`)
* **Propósito:** Evitar que el usuario resuelva el ejercicio mediante deducción trivial o "colocar todos los íconos de la paleta".
* **Regla de oro:** Añade entre **1 y 3 servicios distractores creíbles**. Por ejemplo:
  * Si el desafío pide una base de datos relacional (`AWS_RDS`), incluye `AWS_DYNAMODB` como distractor NoSQL.
  * Si el desafío pide balanceo HTTP a nivel de aplicación (`AWS_ALB`), incluye `AWS_NLB` o `AWS_CLOUDFRONT`.
  * Si pide cómputo Serverless (`AWS_LAMBDA`), incluye `AWS_EC2` o `AWS_FARGATE`.

### 3.2 Pistas Socráticas Graduales (`hints`)
* **Pista 1 (Concepto / Pregunta Orientadora):** Penalización de 5 a 10 puntos. Estimula la reflexión sin dar el nombre del servicio.
* **Pista 2 (Arquitectura / Patrón Cloud):** Penalización de 10 a 15 puntos. Señala la categoría o patrón AWS requerido.
* **Pista 3 / 4 (Solución Concreta):** Penalización de 15 a 20 puntos. Describe la conexión exacta o servicio faltante.

### 3.3 Checkpoint de Reflexión Activa (`reflectionPrompt`)
* Cada desafío debe incluir una pregunta de justificación arquitectónica asociada a un pilar del **Well-Architected Framework** (`Security`, `Reliability`, `PerformanceEfficiency`, `CostOptimization`, `OperationalExcellence`, `Sustainability`).
* Premia al estudiante con **+25 XP** por responder correctamente en el primer intento.
* Incluye explicaciones formativas tanto en la opción correcta como en las incorrectas.

---

## 4. Modos de Desafío (`mode`)

| Modo | Valor JSON | Comportamiento |
| :--- | :---: | :--- |
| **Builder** | `"BUILDER"` | El canvas comienza vacío (o con contenedor VPC base). El usuario construye la arquitectura desde cero. |
| **Repair / Fix** | `"REPAIR"` | El canvas carga un `initialGraph` con una arquitectura rota o insegura (ej. base de datos expuesta, falta de balanceador, single point of failure). El usuario debe diagnosticar y remediar el fallo. |

---

## 5. Validación y Flujo de Pruebas

Para verificar que tus desafíos JSON sean válidos y respeten los esquemas del motor de evaluación:

1. **Ejecutar pruebas automáticas de Seeding y Schemas:**
   ```bash
   cd apps/api
   dotnet test --filter "FullyQualifiedName~ChallengeSeeder|JsonChallengeContentReader"
   ```
2. **Ejecutar toda la suite del motor de evaluación:**
   ```bash
   dotnet test
   ```
3. **Iniciar el frontend en modo desarrollo para probar la experiencia visual:**
   ```bash
   cd apps/web
   npm run dev
   ```
