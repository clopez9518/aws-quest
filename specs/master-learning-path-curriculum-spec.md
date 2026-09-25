# Especificación Técnica y Curricular: Master Learning Path (12 Unidades)

> **Documento de Especificación Oficial de Currículo Educativo**  
> **Estado:** Aprobado / Fuente Única de Verdad Curricular  
> **Versión:** 2.0 (12 Unidades / 50 Desafíos)  
> **Referencia Pedagógica:** [`docs/15-pedagogical-learning-experience-audit.md`](file:///c:/workspace/aws/aws-game/docs/15-pedagogical-learning-experience-audit.md)  
> **Plan de Implementación:** [`docs/16-pedagogical-critical-fixes-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/16-pedagogical-critical-fixes-implementation-plan.md)

---

## 1. Visión General del Currículo

El **Master Learning Path** de AWS Quest estructura el aprendizaje de arquitectura en Amazon Web Services mediante un modelo progresivo de **12 unidades temáticas**. Cada unidad está articulada a través de una **pregunta directriz de diseño** que sitúa al estudiante en el rol de arquitecto cloud y SRE (Site Reliability Engineer).

```text
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                            AWS QUEST — MASTER LEARNING PATH                           ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

  [OLA 1: FUNDAMENTOS Y RESILIENCIA IAAS]
  ├── UNIDAD 1: Computación y Almacenamiento ("¿Dónde vive mi aplicación?")
  ├── UNIDAD 2: Construir una Aplicación Web ("¿Cómo conecto mi aplicación con sus usuarios?")
  ├── UNIDAD 3: Redes: Construir el Camino ("¿Cómo viaja el tráfico?")
  ├── UNIDAD 4: Datos y Seguridad ("¿Dónde viven los datos y quién puede acceder?")
  └── UNIDAD 5: Disponibilidad y Escalabilidad ("¿Qué pasa cuando algo falla o llega tráfico?")

  [OLA 2: MODERN CLOUD, EVENTOS Y EDGE]
  ├── UNIDAD 6: Arquitecturas Serverless ("¿Siempre necesito administrar servidores?")
  ├── UNIDAD 7: Comunicación y Eventos ("¿Cómo desacoplo mis componentes?")
  └── UNIDAD 8: Edge, DNS y Seguridad Web ("¿Cómo hago mi aplicación global y resistente?")

  [OLA 3: CONTENEDORES, OBSERVABILIDAD Y CAPSTONES]
  ├── UNIDAD 9: Contenedores y Computación Moderna ("¿Qué alternativas existen a EC2?")
  ├── UNIDAD 10: Observabilidad y Operación ("¿Cómo sé que mi sistema funciona?")
  ├── UNIDAD 11: Automatización e Infraestructura ("¿Cómo dejo de configurar manualmente?")
  └── UNIDAD 12: Desafíos de Arquitectura ("Ahora piensa como arquitecto")
```

---

## 2. Estructura Detallada de Unidades y Desafíos

---

### UNIDAD 1 — COMPUTACIÓN Y ALMACENAMIENTO
> **Pregunta Guía:** *"¿Dónde vive mi aplicación?"*  
> **Objetivo:** Dominar los tipos de cómputo en máquinas virtuales y la diferenciación fundamental entre almacenamiento en bloque (EBS), archivos compartidos (EFS) y objetos (S3).

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **101** | Mi primer servidor con EC2 | `BUILDER` | Fácil (100 XP) | `AWS_EC2` | Instanciación básica de un servidor virtual monolítico. |
| **102** | Persistencia: EBS | `BUILDER` | Fácil (100 XP) | `AWS_EC2`, `AWS_EBS` | Almacenamiento en bloque persistente dedicado a una única instancia. |
| **103** | Archivos compartidos con EFS | `BUILDER` | Fácil-Med (120 XP) | `AWS_EC2`, `AWS_EFS` | Sistema de archivos en red montable concurrentemente por múltiples servidores. |
| **104** | Almacenamiento de objetos con S3 | `BUILDER` | Fácil (100 XP) | `AWS_EC2`, `AWS_S3` | Desacoplamiento de activos estáticos hacia almacenamiento de objetos sin estado. |

---

### UNIDAD 2 — CONSTRUIR UNA APLICACIÓN WEB
> **Pregunta Guía:** *"¿Cómo conecto mi aplicación con sus usuarios?"*  
> **Objetivo:** Conectar clientes con servidores y distribuir activos estáticos a escala global.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **201** | Aplicación Web Básica | `BUILDER` | Fácil (100 XP) | `AWS_EC2` | Exposición de servicio web en puertos estándar HTTP (80). |
| **202** | Separando Frontend y Backend con S3 + EC2 | `BUILDER` | Fácil-Med (120 XP) | `AWS_S3`, `AWS_EC2` | Arquitectura de dos niveles: frontend estático en S3 y API dinámica en EC2. |
| **203** | Contenido Global con CloudFront + S3 | `BUILDER` | Intermedio (150 XP) | `AWS_CLOUDFRONT`, `AWS_S3` | Aceleración de entrega con baja latencia mediante CDN y Origin Access. |

---

### UNIDAD 3 — REDES: CONSTRUIR EL CAMINO
> **Pregunta Guía:** *"¿Cómo viaja el tráfico?"*  
> **Objetivo:** Comprender la topología de red virtual, aislamiento, puertas de enlace y firewalls en capas.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **301** | Crear una VPC y sus Subnets | `BUILDER` | Fácil-Med (120 XP) | `NET_VPC`, `NET_SUBNET` | Creación de una red privada virtual y segmentación en subredes lógicas. |
| **302** | Conectar la VPC a Internet | `BUILDER` | Intermedio (150 XP) | `NET_VPC`, `NET_SUBNET`, `NET_IGW`, `NET_ROUTE_TABLE` | Puerta de enlace a Internet y tabla de ruteo con ruta predeterminada `0.0.0.0/0`. |
| **303** | Subnets Públicas y Privadas | `BUILDER` | Intermedio (150 XP) | `NET_VPC`, `NET_SUBNET` (Public/Private), `NET_IGW`, `NET_NAT_GATEWAY` | Aislamiento de capas: subred pública con salida directa y subred privada con NAT. |
| **304** | Controlar el tráfico con Security Groups | `BUILDER` | Intermedio (150 XP) | `NET_SECURITY_GROUP`, `AWS_EC2` | Firewall virtual stateful controlando reglas de Ingress y Egress por puerto. |

---

### UNIDAD 4 — DATOS Y SEGURIDAD
> **Pregunta Guía:** *"¿Dónde viven los datos y quién puede acceder?"*  
> **Objetivo:** Gestionar bases de datos relacionales, aislamiento perimetral estricto y administración segura de credenciales.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **401** | Base de Datos con RDS | `BUILDER` | Intermedio (150 XP) | `AWS_RDS` | Aprovisionamiento de motor de base de datos relacional administrado. |
| **402** | Aplicación + RDS en Arquitectura de Capas | `BUILDER` | Intermedio (150 XP) | `AWS_EC2`, `AWS_RDS` | Conexión cliente-servidor de base de datos (`DATABASE connection`). |
| **403** | Aislar una Base de Datos | `REPAIR` | Intermedio (150 XP) | `AWS_RDS`, `NET_SUBNET` | Identificar y remediar base de datos pública expuesta, reubicándola en subred privada. |
| **404** | Gestión de secretos y credenciales | `BUILDER` | Intermedio (150 XP) | `AWS_EC2`, `AWS_RDS`, `AWS_SECRETS_MANAGER` | Eliminación de contraseñas *hardcodeadas* mediante rotación de secretos. |

---

### UNIDAD 5 — DISPONIBILIDAD Y ESCALABILIDAD
> **Pregunta Guía:** *"¿Qué pasa cuando algo falla o llega más tráfico?"*  
> **Objetivo:** Diseñar infraestructuras elásticas, tolerancia a fallos zonales y balanceo de carga L7.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **501** | Eliminar un Single Point of Failure | `REPAIR` | Intermedio (150 XP) | `AWS_EC2`, `AWS_ALB` | Diagnosticar servidor único y agregar redundancia horizontal. |
| **502** | Distribuir tráfico con ALB | `BUILDER` | Intermedio (150 XP) | `AWS_ALB`, `AWS_EC2` | Balanceo de carga en capa de aplicación hacia múltiples instancias web. |
| **503** | Escalabilidad automática con Auto Scaling | `BUILDER` | Intermedio (150 XP) | `AWS_EC2` (Auto Scaling Group), `AWS_ALB` | Capacidad de cómputo elástica que crece y decrece según la demanda. |
| **504** | Base de Datos Multi-AZ | `BUILDER` | Intermedio (150 XP) | `AWS_RDS` (Multi-AZ) | Replicación síncrona en standby para conmutación por error automática ante desastres. |
| **505** | Incidente SRE: Servidor Saturado | `DIAGNOSE` / `REPAIR` | Intermedio (150 XP) | `AWS_ALB`, `AWS_EC2`, `AWS_RDS` | Respuesta a incidente real de sobrecarga y rediseño resiliente. |

---

### UNIDAD 6 — ARQUITECTURAS SERVERLESS
> **Pregunta Guía:** *"¿Siempre necesito administrar servidores?"*  
> **Objetivo:** Construir aplicaciones completas basadas en funciones efímeras y bases de datos NoSQL totalmente administradas.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **601** | Ejecutar código con Lambda | `BUILDER` | Intermedio (150 XP) | `AWS_LAMBDA` | Cómputo serverless ejecutado en respuesta a invocaciones y eventos. |
| **602** | API Serverless con API Gateway + Lambda | `BUILDER` | Intermedio (150 XP) | `AWS_APIGATEWAY`, `AWS_LAMBDA` | Exposición de endpoints REST protegidos hacia funciones backend. |
| **603** | Persistencia Serverless con DynamoDB | `BUILDER` | Intermedio (150 XP) | `AWS_LAMBDA`, `AWS_DYNAMODB` | Integración de funciones serverless con base de datos de clave-valor NoSQL. |
| **604** | Arquitectura Serverless completa | `BUILDER` | Intermedio (150 XP) | `AWS_APIGATEWAY`, `AWS_LAMBDA`, `AWS_DYNAMODB`, `AWS_S3` | Aplicación web completa sin aprovisionar ni administrar infraestructura. |
| **605** | Diagnóstico: ¿Por qué falla esta arquitectura? | `DIAGNOSE` | Intermedio (150 XP) | `AWS_APIGATEWAY`, `AWS_LAMBDA` | Detectar cuellos de botella de concurrencia, permisos IAM o timeouts. |

---

### UNIDAD 7 — COMUNICACIÓN Y EVENTOS
> **Pregunta Guía:** *"¿Cómo desacoplo mis componentes?"*  
> **Objetivo:** Implementar arquitecturas dirigidas por eventos y procesamiento asíncrono con colas y tópicos pub/sub.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **701** | Colas con SQS | `BUILDER` | Intermedio (150 XP) | `AWS_EC2`, `AWS_SQS` | Desacoplamiento temporal y amortiguación de picos de carga con colas. |
| **702** | Publicación de eventos con SNS | `BUILDER` | Intermedio (150 XP) | `AWS_SNS`, `AWS_SQS`, `AWS_LAMBDA` | Patrón *Fan-Out* de mensajería pub/sub para múltiples consumidores. |
| **703** | Arquitectura Event-Driven | `BUILDER` | Intermedio (150 XP) | `AWS_EVENTBRIDGE`, `AWS_LAMBDA`, `AWS_SQS` | Enrutamiento de eventos serverless basado en reglas de contenido. |
| **704** | Reparación de un sistema acoplado | `REPAIR` | Intermedio (150 XP) | `AWS_EC2`, `AWS_SQS`, `AWS_RDS` | Transformar comunicación síncrona bloqueante en procesamiento asíncrono. |

---

### UNIDAD 8 — EDGE, DNS Y SEGURIDAD WEB
> **Pregunta Guía:** *"¿Cómo hago mi aplicación global y resistente?"*  
> **Objetivo:** Enrutamiento inteligente de DNS, aceleración en los puntos de presencia de borde y protección perimetral WAF.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **801** | DNS con Route 53 | `BUILDER` | Intermedio (150 XP) | `AWS_ROUTE53`, `AWS_ALB` | Resolución DNS y políticas de enrutamiento con health checks. |
| **802** | CDN con CloudFront | `BUILDER` | Intermedio (150 XP) | `AWS_CLOUDFRONT`, `AWS_ALB`, `AWS_S3` | Caching dinámico y estático en los puntos de presencia mundiales. |
| **803** | Protección Web con WAF | `BUILDER` | Intermedio (150 XP) | `AWS_WAF`, `AWS_CLOUDFRONT`, `AWS_ALB` | Mitigación de inyecciones SQL, ataques XSS y limitación de tasa (rate-limiting). |
| **804** | Arquitectura Web Global | `BUILDER` | Difícil (200 XP) | `AWS_ROUTE53`, `AWS_CLOUDFRONT`, `AWS_WAF`, `AWS_ALB`, `AWS_EC2` | Diseño perimetral integral y de alta resiliencia frente a ataques DDoS. |

---

### UNIDAD 9 — CONTENEDORES Y COMPUTACIÓN MODERNA
> **Pregunta Guía:** *"¿Qué alternativas existen a EC2?"*  
> **Objetivo:** Orquestar microservicios encapsulados en contenedores Docker y ejecución serverless con Fargate.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **901** | Contenedores con ECS + ECR | `BUILDER` | Intermedio (150 XP) | `AWS_ECR`, `AWS_ECS` | Almacenar imágenes Docker en ECR y desplegar tareas en ECS. |
| **902** | Ejecución Serverless con Fargate | `BUILDER` | Intermedio (150 XP) | `AWS_ECS`, `AWS_FARGATE`, `AWS_ALB` | Ejecutar contenedores sin administrar instancias subyacentes de EC2. |
| **903** | Migración EC2 $\rightarrow$ Contenedores | `REPAIR` | Difícil (200 XP) | `AWS_EC2`, `AWS_ECS`, `AWS_FARGATE` | Reemplazar una flota rígida de máquinas virtuales por tareas de microservicios elásticas. |

---

### UNIDAD 10 — OBSERVABILIDAD Y OPERACIÓN
> **Pregunta Guía:** *"¿Cómo sé que mi sistema funciona?"*  
> **Objetivo:** Recolectar métricas de rendimiento, centralizar logs de aplicación y auditar llamadas de infraestructura.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1001** | Métricas y Logs con CloudWatch | `BUILDER` | Intermedio (150 XP) | `AWS_CLOUDWATCH`, `AWS_EC2`, `AWS_RDS` | Configurar alarmas de CPU, memoria y recolección de logs de acceso. |
| **1002** | Detectar una falla mediante métricas | `DIAGNOSE` | Intermedio (150 XP) | `AWS_CLOUDWATCH`, `AWS_ALB`, `AWS_EC2` | Analizar métricas de errores HTTP 5XX para identificar el nodo degradado. |
| **1003** | Auditoría de actividad con CloudTrail | `BUILDER` | Intermedio (150 XP) | `AWS_CLOUDTRAIL`, `AWS_S3` | Registrar y retener historial inmutable de acciones realizadas en la cuenta. |
| **1004** | Arquitectura bajo incidente | `DIAGNOSE` | Difícil (200 XP) | `AWS_CLOUDWATCH`, `AWS_EC2`, `AWS_RDS` | Triaje y diagnóstico de fallo en cascada bajo condiciones de estrés. |

---

### UNIDAD 11 — AUTOMATIZACIÓN E INFRAESTRUCTURA
> **Pregunta Guía:** *"¿Cómo dejo de configurar todo manualmente?"*  
> **Objetivo:** Definir infraestructuras reproducibles mediante Infrastructure as Code (IaC) y automatizar despliegues.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1101** | Infraestructura como código con CloudFormation | `BUILDER` | Intermedio (150 XP) | `AWS_CLOUDFORMATION` | Aprovisionamiento declarativo y repetible de pilas de recursos AWS. |
| **1102** | Despliegue automatizado | `BUILDER` | Difícil (200 XP) | `AWS_CLOUDFORMATION`, `AWS_S3`, `AWS_LAMBDA` | Creación de pipeline automatizado para actualización de infraestructuras. |
| **1103** | Reparar una infraestructura inconsistente | `REPAIR` | Difícil (200 XP) | `AWS_CLOUDFORMATION`, `AWS_VPC` | Resolver errores de dependencias circulares y *drift* de configuración. |

---

### UNIDAD 12 — DESAFÍOS DE ARQUITECTURA (CAPSTONES)
> **Pregunta Guía:** *"Ahora piensa como arquitecto"*  
> **Objetivo:** Resolver problemas empresariales holísticos integrando múltiples pilares, mitigando riesgos de seguridad y optimizando costos.

| ID | Desafío | Modalidad | Dificultad | Servicios Clave | Objetivo Pedagógico |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1201** | Diseña una plataforma E-Commerce | `BUILDER` | Difícil (200 XP) | `AWS_ALB`, `AWS_EC2`, `AWS_RDS`, `AWS_S3`, `AWS_CLOUDFRONT` | Plataforma transaccional de venta masiva de alta disponibilidad. |
| **1202** | Arquitectura para tráfico impredecible | `BUILDER` | Difícil (200 XP) | `AWS_APIGATEWAY`, `AWS_LAMBDA`, `AWS_SQS`, `AWS_DYNAMODB` | Absorción elástica de picos repentinos de tráfico sin degradación. |
| **1203** | Modernización de aplicación monolítica | `REPAIR` | Difícil (200 XP) | `AWS_EC2` $\rightarrow$ `AWS_ECS` + `AWS_RDS` + `AWS_S3` | Refactorización de un monolito legacy hacia microservicios desacoplados. |
| **1204** | Diseña una arquitectura Serverless | `BUILDER` | Difícil (200 XP) | `AWS_CLOUDFRONT`, `AWS_S3`, `API_GW`, `LAMBDA`, `DYNAMODB`, `EVENTBRIDGE` | Sistema empresarial 100% Serverless y dirigido por eventos. |
| **1205** | Auditoría Well-Architected | `AUDIT` | Difícil (200 XP) | Infraestructura corporativa completa | Identificar las 5 peores vulnerabilidades contra los pilares de AWS. |
| **1206** | Incidente crítico de producción | `DIAGNOSE` | Difícil (200 XP) | Topología empresarial en caída | Diagnóstico y plan de remediación en vivo de una caída total del servicio. |

---

## 3. Plan de Despliegue en 3 Olas de Contenido

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ESTRATEGIA DE DESPLIEGUE EN OLAS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  OLA 1: Fundamentos Esenciales (Unidades 1 a 5 — 20 Desafíos)               │
│  • Cómputo, Almacenamiento (EBS/EFS/S3), Redes (VPC/Subnet/IGW/SG),         │
│    Bases de Datos (RDS Aislado) y Resiliencia (ALB/ASG/Multi-AZ).           │
│                                                                             │
│  OLA 2: Arquitecturas Modernas y Edge (Unidades 6 a 8 — 13 Desafíos)        │
│  • Serverless (API GW/Lambda/DynamoDB), Eventos (SQS/SNS/EventBridge)       │
│    y Distribución Global (Route 53/CloudFront/WAF).                         │
│                                                                             │
│  OLA 3: Operaciones, Contenedores y Capstone (Unidades 9 a 12 — 17 Desafíos)│
│  • Contenedores (ECS/Fargate/ECR), Observabilidad (CloudWatch/CloudTrail),   │
│    Automatización (CloudFormation) y Capstones de Arquitectura Integral.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Requisitos de Catálogo y Compatibilidad

1. **Nuevos Servicios a Registrar en `aws-services.json`:**
   * `AWS_EBS`, `AWS_EFS`, `AWS_SECRETS_MANAGER`, `AWS_ECS`, `AWS_ECR`, `AWS_FARGATE`, `AWS_CLOUDTRAIL`, `AWS_CLOUDFORMATION`.
2. **Compatibilidad con Motor de Evaluación:**
   * Todos los desafíos nuevos se configuran bajo el esquema declarativo estándar de `ChallengeEvaluationRules` sin requerir modificaciones en el compilador central del motor.
