# Especificación Técnica: Fase 5 — Expansión de Contenido y Desafíos de Red AWS

> **Documento de Especificación de Implementación**  
> **Fase:** 5 (Content Expansion & Network Challenges)  
> **Proyecto:** AWS Architecture Quest (`apps/api` & `content/`)  
> **Documento de Referencia:** [`docs/14-aws-network-expansion-plan.md`](file:///c:/workspace/aws/aws-game/docs/14-aws-network-expansion-plan.md)  
> **Dependencias:** Fase 1, Fase 2, Fase 3 y Fase 4 completadas  
> **Estado:** Listo para Implementación

---

## 1. Introducción y Objetivos de la Fase 5

Con las capacidades del motor de evaluación topológico (Fases 1 y 2), la persistencia/migraciones (Fase 3) y la interfaz visual jerárquica con cajas contenedoras en React Flow (Fase 4) completamente operativas, la **Fase 5** se enfoca en la **creación e integración del nuevo contenido educativo declarativo**.

El objetivo es introducir desafíos interactivos progresivos que enseñen a los estudiantes a diseñar redes virtuales en AWS (**Amazon VPC**), segmentar infraestructura en **Subredes Públicas y Privadas**, configurar compuertas de red (**Internet Gateway** y **NAT Gateway**), y aplicar políticas de firewall virtual con **Security Groups**.

### 1.1 Objetivos Principales:
1. **Creación del Desafío 103 (Unidad 1 - Fundamentos de Cómputo y Red):**
   * *Título:* *"Despliegue de Servidor Web en VPC Pública con Internet Gateway"*.
   * *Objetivo Pedagógico:* Enseñar el aislamiento de cómputo en una VPC personalizada, la creación de una subred pública y el enrutamiento bidireccional hacia Internet vía Internet Gateway (`NET_IGW`).
2. **Creación del Desafío 203 (Unidad 2 - Arquitecturas Multi-Capa y Resiliencia):**
   * *Título:* *"Arquitectura Segura de 2 Capas con Subredes Públicas y Privadas"*.
   * *Objetivo Pedagógico:* Enseñar el patrón de arquitectura canónico de dos capas en AWS: balanceador de carga o servidor de aplicaciones en subred pública con salida a Internet, y base de datos relacional (Amazon RDS) en subred privada aislada, con reglas de Security Group restringidas (puerto 5432 desde cómputo).
3. **Calibración Exacta de Reglas de Evaluación:**
   * Reglas de Contención Jerárquica (`PlacementRules`).
   * Reglas de Enrutamiento Topológico (`RoutingRules`).
   * Reglas de Firewall y Seguridad (`SecurityGroupRules`).
   * Reglas de Antipatrones (`AntiPatterns`: base de datos en subred pública, cómputo sin salida a Internet, etc.).
4. **Pruebas Automatizadas de Solución Gold (`Gold Solution Tests`):**
   * Creación de pruebas de integración en `AwsQuest.IntegrationTests` que verifiquen que las soluciones óptimas obtienen una puntuación perfecta de **100/100** y que las arquitecturas defectuosas reciben las penalizaciones exactas esperadas.

---

## 2. Definición Detallada de los Nuevos Desafíos

### 2.1 Desafío 103: Despliegue de Servidor Web en VPC Pública con Internet Gateway

* **Archivo:** [`content/challenges/unit-1/challenge-103.json`](file:///c:/workspace/aws/aws-game/content/challenges/unit-1/challenge-103.json)
* **Unidad:** Unidad 1 — *Fundamentos de Cómputo y Almacenamiento en la Nube*
* **Dificultad:** `Intermediate`
* **Modo:** `BUILDER`
* **Base XP:** 120 XP
* **Required XP:** 100 XP (se desbloquea tras completar 101 o 102)
* **Order Index:** 3

#### 2.1.1 Descripción Narrativa y Requisitos Pedagógicos
Una startup necesita alojar su aplicación web en una instancia EC2 dentro de una red virtual privada dedicada (`NET_VPC`) para no depender de la VPC por defecto. La instancia debe residir en una subred pública (`NET_SUBNET` con `tier = Public`) y debe contar con conectividad a Internet mediante un Internet Gateway (`NET_IGW`) para responder al tráfico web público.

#### 2.1.2 Servicios Permitidos (`allowedServices`)
| Código de Servicio | Nombre | maxInstances | isDistractor | Ámbito / Rol |
| :--- | :--- | :--- | :--- | :--- |
| `NET_VPC` | Virtual Private Cloud | 1 | `false` | Contenedor raíz de red |
| `NET_SUBNET` | Subnet | 2 | `false` | Subred pública dentro de la VPC |
| `NET_IGW` | Internet Gateway | 1 | `false` | Compuerta de acceso a Internet |
| `AWS_EC2` | Amazon EC2 | 1 | `false` | Servidor web en subred pública |
| `AWS_S3` | Amazon S3 | null | `true` | Distractor (no requerido) |
| `AWS_RDS` | Amazon RDS | null | `true` | Distractor (no requerido) |

#### 2.1.3 Sistema de Pistas Graduales (`hints`)
1. **Pista 1 (Costo: 5 XP):** *"Comienza creando una Virtual Private Cloud (VPC) en el canvas para delimitar tu red privada."*
2. **Pista 2 (Costo: 10 XP):** *"Arrastra una Subred dentro de la VPC y configúrala como pública (`Public`). Luego ubica tu instancia EC2 dentro de ella."*
3. **Pista 3 (Costo: 15 XP):** *"Agrega un Internet Gateway (`NET_IGW`) y asócialo a tu red para permitir que la subred pública enrute tráfico hacia Internet."*

#### 2.1.4 Reglas de Evaluación (`evaluationRules`)
```json
{
  "requiredServices": [
    "NET_VPC",
    "NET_SUBNET",
    "NET_IGW",
    "AWS_EC2"
  ],
  "forbiddenServices": [
    "AWS_RDS"
  ],
  "minInstances": {
    "NET_VPC": 1,
    "NET_SUBNET": 1,
    "NET_IGW": 1,
    "AWS_EC2": 1
  },
  "maxInstances": {
    "NET_VPC": 1,
    "NET_SUBNET": 2,
    "NET_IGW": 1,
    "AWS_EC2": 1
  },
  "placementRules": [
    {
      "serviceCode": "NET_SUBNET",
      "requiredContainerCode": "NET_VPC",
      "requiredSubnetTier": null,
      "penaltyIfViolated": 30,
      "description": "Las subredes deben estar obligatoriamente contenidas dentro de una VPC."
    },
    {
      "serviceCode": "AWS_EC2",
      "requiredContainerCode": "NET_SUBNET",
      "requiredSubnetTier": "Public",
      "penaltyIfViolated": 30,
      "description": "La instancia EC2 del servidor web debe residir en una subred pública para recibir tráfico web directo."
    }
  ],
  "routingRules": [
    {
      "subnetTier": "Public",
      "requiresRouteTo": "NET_IGW",
      "penaltyIfMissing": 25,
      "description": "La subred pública debe contar con una ruta activa hacia el Internet Gateway para salida y entrada a Internet."
    }
  ],
  "requiredConnections": [
    {
      "fromServiceCode": "NET_VPC",
      "toServiceCode": "NET_IGW",
      "connectionType": "ATTACHED_VPC",
      "penaltyIfMissing": 20,
      "description": "El Internet Gateway debe estar adjunto a la VPC."
    }
  ],
  "forbiddenConnections": [],
  "antiPatterns": [
    {
      "code": "EC2_WITHOUT_VPC",
      "type": "SecurityRisk",
      "penalty": 30,
      "category": "Security",
      "title": "Cómputo Huérfano fuera de la VPC",
      "feedback": "La instancia EC2 no se encuentra dentro de una subred de la VPC. Toda la infraestructura debe residir dentro de la VPC diseñada."
    }
  ],
  "passingScoreThreshold": 70
}
```

---

### 2.2 Desafío 203: Arquitectura Segura de 2 Capas con Subredes Públicas y Privadas

* **Archivo:** [`content/challenges/unit-2/challenge-203.json`](file:///c:/workspace/aws/aws-game/content/challenges/unit-2/challenge-203.json)
* **Unidad:** Unidad 2 — *Alta Disponibilidad, Escalabilidad y Redes Seguras*
* **Dificultad:** `Hard`
* **Modo:** `BUILDER`
* **Base XP:** 200 XP
* **Required XP:** 150 XP
* **Order Index:** 3

#### 2.2.1 Descripción Narrativa y Requisitos Pedagógicos
Diseña una arquitectura web corporativa altamente segura de dos niveles en AWS:
1. **Capa Web (Pública):** Instancia(s) Amazon EC2 dentro de una subred pública conectada a Internet mediante un Internet Gateway.
2. **Capa de Datos (Privada):** Base de datos Amazon RDS ubicada en una subred privada aislada (sin acceso directo desde Internet ni ruta al Internet Gateway).
3. **Seguridad y Control de Acceso:** Un Security Group asociado a la base de datos RDS que solo permita tráfico entrante (Ingress) en el puerto TCP `5432` proveniente del Security Group de las instancias EC2.

#### 2.2.2 Servicios Permitidos (`allowedServices`)
| Código de Servicio | Nombre | maxInstances | isDistractor | Ámbito / Rol |
| :--- | :--- | :--- | :--- | :--- |
| `NET_VPC` | Virtual Private Cloud | 1 | `false` | Contenedor raíz de red |
| `NET_SUBNET` | Subnet | 4 | `false` | Subredes públicas y privadas |
| `NET_IGW` | Internet Gateway | 1 | `false` | Conexión a Internet para subred pública |
| `NET_SECURITY_GROUP` | Security Group | 2 | `false` | Firewalls virtuales para EC2 y RDS |
| `AWS_EC2` | Amazon EC2 | 2 | `false` | Servidor(es) web en subred pública |
| `AWS_RDS` | Amazon RDS | 1 | `false` | Base de datos relacional en subred privada |
| `AWS_S3` | Amazon S3 | null | `true` | Distractor |
| `AWS_DYNAMODB` | Amazon DynamoDB | null | `true` | Distractor |

#### 2.2.3 Sistema de Pistas Graduales (`hints`)
1. **Pista 1 (Costo: 5 XP):** *"Crea una VPC y subdivídela en al menos dos subredes: una con tier 'Public' y otra con tier 'Private'."*
2. **Pista 2 (Costo: 10 XP):** *"Ubica las instancias EC2 en la subred pública y conecta la VPC al Internet Gateway. Coloca la base de datos RDS en la subred privada."*
3. **Pista 3 (Costo: 15 XP):** *"Conecta las instancias EC2 a la base de datos RDS y asegura que el Security Group de la base de datos restrinja el puerto 5432 solo a las instancias EC2."*

#### 2.2.4 Reglas de Evaluación (`evaluationRules`)
```json
{
  "requiredServices": [
    "NET_VPC",
    "NET_SUBNET",
    "NET_IGW",
    "AWS_EC2",
    "AWS_RDS",
    "NET_SECURITY_GROUP"
  ],
  "forbiddenServices": [],
  "minInstances": {
    "NET_VPC": 1,
    "NET_SUBNET": 2,
    "NET_IGW": 1,
    "AWS_EC2": 1,
    "AWS_RDS": 1,
    "NET_SECURITY_GROUP": 1
  },
  "maxInstances": {
    "NET_VPC": 1,
    "NET_SUBNET": 4,
    "NET_IGW": 1,
    "AWS_EC2": 2,
    "AWS_RDS": 1,
    "NET_SECURITY_GROUP": 3
  },
  "placementRules": [
    {
      "serviceCode": "NET_SUBNET",
      "requiredContainerCode": "NET_VPC",
      "requiredSubnetTier": null,
      "penaltyIfViolated": 25,
      "description": "Todas las subredes deben estar contenidas dentro de la VPC."
    },
    {
      "serviceCode": "AWS_EC2",
      "requiredContainerCode": "NET_SUBNET",
      "requiredSubnetTier": "Public",
      "penaltyIfViolated": 25,
      "description": "Las instancias EC2 del nivel web deben ubicarse en una subred pública."
    },
    {
      "serviceCode": "AWS_RDS",
      "requiredContainerCode": "NET_SUBNET",
      "requiredSubnetTier": "Private",
      "penaltyIfViolated": 30,
      "description": "La base de datos relacional RDS debe residir estrictamente en una subred privada para evitar exposición pública."
    }
  ],
  "routingRules": [
    {
      "subnetTier": "Public",
      "requiresRouteTo": "NET_IGW",
      "penaltyIfMissing": 20,
      "description": "La subred pública debe tener ruta activa hacia el Internet Gateway."
    }
  ],
  "securityGroupRules": [
    {
      "targetServiceCode": "AWS_RDS",
      "allowedSourceServiceCode": "AWS_EC2",
      "protocol": "TCP",
      "port": 5432,
      "penaltyIfViolated": 20,
      "description": "El Security Group de RDS debe autorizar tráfico entrante en el puerto 5432 exclusivamente desde las instancias EC2."
    }
  ],
  "requiredConnections": [
    {
      "fromServiceCode": "AWS_EC2",
      "toServiceCode": "AWS_RDS",
      "connectionType": "DATABASE",
      "penaltyIfMissing": 15,
      "description": "Las instancias EC2 deben conectarse a la base de datos RDS."
    },
    {
      "fromServiceCode": "NET_VPC",
      "toServiceCode": "NET_IGW",
      "connectionType": "ATTACHED_VPC",
      "penaltyIfMissing": 15,
      "description": "El Internet Gateway debe estar adjunto a la VPC."
    }
  ],
  "forbiddenConnections": [
    {
      "fromServiceCode": "NET_IGW",
      "toServiceCode": "AWS_RDS",
      "reason": "La base de datos privada no debe recibir conexiones directas desde el Internet Gateway.",
      "penalty": 30
    }
  ],
  "antiPatterns": [
    {
      "code": "PUBLIC_DATABASE_EXPOSURE",
      "type": "SecurityRisk",
      "penalty": 30,
      "category": "Security",
      "title": "Base de Datos Expuesta Públicamente",
      "feedback": "La base de datos RDS está en una subred pública o accesible directamente desde Internet. Muévela a una subred privada."
    }
  ],
  "passingScoreThreshold": 70
}
```

---

## 3. Grafos de Solución Gold (Declarative Gold Graphs)

Para la verificación automatizada en pruebas de integración, se definen los grafos semánticos canónicos que satisfacen al 100% las reglas de evaluación.

### 3.1 Grafo Gold: Desafío 103
```json
{
  "components": [
    {
      "id": "vpc-main",
      "serviceCode": "NET_VPC",
      "parentId": null,
      "config": {
        "cidrBlock": "10.0.0.0/16"
      }
    },
    {
      "id": "sub-public-1",
      "serviceCode": "NET_SUBNET",
      "parentId": "vpc-main",
      "config": {
        "subnetTier": "Public",
        "cidrBlock": "10.0.1.0/24",
        "routes": [
          { "destinationCidrBlock": "0.0.0.0/0", "targetGatewayId": "igw-main" }
        ]
      }
    },
    {
      "id": "igw-main",
      "serviceCode": "NET_IGW",
      "parentId": null,
      "config": {
        "attachedVpcId": "vpc-main"
      }
    },
    {
      "id": "ec2-web-1",
      "serviceCode": "AWS_EC2",
      "parentId": "sub-public-1",
      "config": {
        "instanceCount": 1,
        "isMultiAz": false
      }
    }
  ],
  "connections": [
    {
      "fromComponentId": "vpc-main",
      "toComponentId": "igw-main",
      "connectionType": "ATTACHED_VPC"
    }
  ]
}
```

### 3.2 Grafo Gold: Desafío 203
```json
{
  "components": [
    {
      "id": "vpc-prod",
      "serviceCode": "NET_VPC",
      "parentId": null,
      "config": {
        "cidrBlock": "10.0.0.0/16"
      }
    },
    {
      "id": "sub-public-web",
      "serviceCode": "NET_SUBNET",
      "parentId": "vpc-prod",
      "config": {
        "subnetTier": "Public",
        "cidrBlock": "10.0.1.0/24",
        "routes": [
          { "destinationCidrBlock": "0.0.0.0/0", "targetGatewayId": "igw-prod" }
        ]
      }
    },
    {
      "id": "sub-private-db",
      "serviceCode": "NET_SUBNET",
      "parentId": "vpc-prod",
      "config": {
        "subnetTier": "Private",
        "cidrBlock": "10.0.2.0/24",
        "routes": []
      }
    },
    {
      "id": "igw-prod",
      "serviceCode": "NET_IGW",
      "parentId": null,
      "config": {
        "attachedVpcId": "vpc-prod"
      }
    },
    {
      "id": "sg-ec2",
      "serviceCode": "NET_SECURITY_GROUP",
      "parentId": null,
      "config": {
        "securityGroupRules": [
          { "direction": "Ingress", "protocol": "TCP", "fromPort": 80, "toPort": 80, "sourceCidr": "0.0.0.0/0" },
          { "direction": "Ingress", "protocol": "TCP", "fromPort": 443, "toPort": 443, "sourceCidr": "0.0.0.0/0" }
        ]
      }
    },
    {
      "id": "sg-rds",
      "serviceCode": "NET_SECURITY_GROUP",
      "parentId": null,
      "config": {
        "securityGroupRules": [
          { "direction": "Ingress", "protocol": "TCP", "fromPort": 5432, "toPort": 5432, "sourceSecurityGroupId": "sg-ec2" }
        ]
      }
    },
    {
      "id": "ec2-app-1",
      "serviceCode": "AWS_EC2",
      "parentId": "sub-public-web",
      "config": {
        "instanceCount": 1,
        "securityGroupIds": ["sg-ec2"]
      }
    },
    {
      "id": "rds-postgres-1",
      "serviceCode": "AWS_RDS",
      "parentId": "sub-private-db",
      "config": {
        "engine": "PostgreSQL",
        "isMultiAz": true,
        "isPublic": false,
        "securityGroupIds": ["sg-rds"]
      }
    }
  ],
  "connections": [
    {
      "fromComponentId": "vpc-prod",
      "toComponentId": "igw-prod",
      "connectionType": "ATTACHED_VPC"
    },
    {
      "fromComponentId": "ec2-app-1",
      "toComponentId": "rds-postgres-1",
      "connectionType": "DATABASE"
    },
    {
      "fromComponentId": "ec2-app-1",
      "toComponentId": "sg-ec2",
      "connectionType": "ATTACHED_SECURITY_GROUP"
    },
    {
      "fromComponentId": "rds-postgres-1",
      "toComponentId": "sg-rds",
      "connectionType": "ATTACHED_SECURITY_GROUP"
    }
  ]
}
```

---

## 4. Mapa de Archivos e Impacto en el Proyecto

```text
content/
├── challenges/
│   ├── unit-1/
│   │   ├── unit.json                             [VERIFY] (Debe contener descripción adecuada)
│   │   ├── challenge-101.json                    [INTACTO] (Sin cambios)
│   │   ├── challenge-102.json                    [INTACTO] (Sin cambios)
│   │   └── challenge-103.json                    [NEW] (Despliegue Web en VPC Pública con IGW)
│   └── unit-2/
│       ├── unit.json                             [VERIFY] (Debe contener descripción adecuada)
│       ├── challenge-201.json                    [INTACTO] (Sin cambios)
│       ├── challenge-202.json                    [INTACTO] (Sin cambios)
│       └── challenge-203.json                    [NEW] (Arquitectura Segura 2 Capas con Subredes y SG)
apps/api/
└── tests/
    └── AwsQuest.IntegrationTests/
        └── Content/
            └── NetworkChallengesGoldSolutionTests.cs  [NEW] (Pruebas de evaluación Gold para 103 y 203)
```

---

## 5. Plan de Ejecución y Verificación

### 5.1 Pasos de Ejecución
1. **Crear archivo `challenge-103.json`** en `content/challenges/unit-1/` con las reglas de evaluación, pistas y servicios autorizados detallados en la Sección 2.1.
2. **Crear archivo `challenge-203.json`** en `content/challenges/unit-2/` con las reglas de evaluación, pistas y servicios autorizados detallados en la Sección 2.2.
3. **Crear suite de pruebas de integración `NetworkChallengesGoldSolutionTests.cs`** en `apps/api/tests/AwsQuest.IntegrationTests/Content/` para validar la carga mediante el seeder y la evaluación de soluciones Gold y defectuosas con el motor de evaluación real.
4. **Ejecutar Seeding y Suite de Pruebas**:
   * Ejecutar `dotnet test apps/api/tests/AwsQuest.UnitTests`
   * Ejecutar `dotnet test apps/api/tests/AwsQuest.IntegrationTests`
   * Ejecutar `pnpm --filter web test`

### 5.2 Criterios de Aceptación
* El seeder (`ChallengeSeeder`) carga correctamente los desafíos 103 y 203 sin errores de deserialización.
* La solución Gold para el desafío 103 obtiene una puntuación de **100/100** con veredicto `Passed = true`.
* La solución Gold para el desafío 203 obtiene una puntuación de **100/100** con veredicto `Passed = true`.
* Los desafíos MVP existentes (101, 102, 201, 202, 301, 302, 401, 402) continúan pasando sus pruebas de solución Gold con 100/100 (cero regresiones).
* El frontend compila y sus 207 pruebas unitarias siguen pasando al 100%.
