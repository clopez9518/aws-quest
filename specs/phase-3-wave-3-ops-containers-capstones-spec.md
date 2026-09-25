# Especificación Técnica: Fase 3 (Ola 3 — Contenedores, Operaciones, IaC y Capstones)

> **Documento de Especificación de Implementación Oficial**  
> **Fase:** Fase 3 / Ola 3 (Unidades 9 a 12 — 17 Desafíos)  
> **Estado:** Implementado / Activo  
> **Referencia Curricular:** [`specs/master-learning-path-curriculum-spec.md`](file:///c:/workspace/aws/aws-game/specs/master-learning-path-curriculum-spec.md)  
> **Auditoría Pedagógica:** [`docs/15-pedagogical-learning-experience-audit.md`](file:///c:/workspace/aws/aws-game/docs/15-pedagogical-learning-experience-audit.md)  
> **Plan de Ejecución:** [`docs/16-pedagogical-critical-fixes-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/16-pedagogical-critical-fixes-implementation-plan.md)

---

## 1. Resumen Ejecutivo y Objetivos

La **Fase 3 (Ola 3)** culmina el Master Learning Path de 12 Unidades y 50 Desafíos de AWS Quest. En esta fase se cubren las competencias más avanzadas de la arquitectura cloud:
1. **Contenedores y Computación Moderna (Unidad 9):** Empaquetado en imágenes Docker (Amazon ECR), orquestación de tareas en clústeres (Amazon ECS) y ejecución serverless sin gestión de instancias (AWS Fargate).
2. **Observabilidad y Operación Continua (Unidad 10):** Métricas, alarmas y logs con Amazon CloudWatch, auditoría de gobernanza y llamadas a API con AWS CloudTrail, y resolución de incidentes operativos.
3. **Automatización e Infrastructure as Code (Unidad 11):** Definición declarativa y repetible con AWS CloudFormation y orquestación de pipelines de despliegue.
4. **Capstones de Arquitectura Integral (Unidad 12):** Desafíos de síntesis arquitectónica empresarial de alta dificultad (200 XP) que integran los 6 pilares de AWS Well-Architected Framework: comercio masivo, tráfico impredecible, modernización de monolitos, serverless empresarial, auditorías y gestión de crisis de producción en tiempo real.

---

## 2. Convenciones de Diseño y Reglas Pedagógicas

1. **Escalera Socrática de 4 Niveles en Todas las Pistas:**
   * Nivel 1 (Reflexión / Pregunta Guía): Sin nombres de servicios (5 XP).
   * Nivel 2 (Patrón Arquitectónico): Containerization, Serverless Containers, Centralized Logging, Immutable Audit, IaC Declarative Stack, Multi-Tier Decoupling (10 XP).
   * Nivel 3 (Servicio AWS Recomendado): ECS, ECR, Fargate, CloudWatch, CloudTrail, CloudFormation (15 XP).
   * Nivel 4 (Acción Directa en Canvas): Conexiones exactas y colocación en canvas (20 XP).
2. **Desafíos de Diagnóstico y Auditoría (`DIAGNOSE` / `AUDIT` / `REPAIR`):**
   * Desafíos 903, 1002, 1004, 1103, 1203, 1205 y 1206 presentan arquitecturas defectuosas o bajo estrés para que el estudiante diagnostique la causa raíz y remedia la topología.
3. **Validación Canónica (Gold Solution Tests):**
   * Cada uno de los 17 desafíos cuenta con pruebas de integración que validan el paso de la solución dorada ($\ge 70$ puntos).

---

## 3. Catálogo de Unidades y Desafíos de la Ola 3

```text
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                   OLA 3: CONTENEDORES, OPS, IAC Y CAPSTONES (17 DESAFÍOS)             ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

  UNIDAD 9: Contenedores y Computación Moderna ("¿Qué alternativas existen a EC2?")
  ├── 901 · Contenedores con ECS + ECR (BUILDER · Intermedio · 150 XP)
  ├── 902 · Ejecución Serverless con Fargate (BUILDER · Intermedio · 150 XP)
  └── 903 · Migración de EC2 a Contenedores Fargate (REPAIR · Difícil · 200 XP)

  UNIDAD 10: Observabilidad y Operación ("¿Cómo sé que mi sistema funciona?")
  ├── 1001 · Métricas y Logs con CloudWatch (BUILDER · Intermedio · 150 XP)
  ├── 1002 · Detectar una falla mediante métricas (DIAGNOSE · Intermedio · 150 XP)
  ├── 1003 · Auditoría de actividad con CloudTrail (BUILDER · Intermedio · 150 XP)
  └── 1004 · Arquitectura bajo incidente de saturación (DIAGNOSE · Difícil · 200 XP)

  UNIDAD 11: Automatización e Infraestructura ("¿Cómo dejo de configurar manualmente?")
  ├── 1101 · Infraestructura como código con CloudFormation (BUILDER · Intermedio · 150 XP)
  ├── 1102 · Despliegue automatizado con CloudFormation (BUILDER · Difícil · 200 XP)
  └── 1103 · Reparar infraestructura inconsistente (REPAIR · Difícil · 200 XP)

  UNIDAD 12: Desafíos de Arquitectura (Capstones) ("Ahora piensa como arquitecto")
  ├── 1201 · Diseña una plataforma E-Commerce (BUILDER · Difícil · 200 XP)
  ├── 1202 · Arquitectura para tráfico impredecible (BUILDER · Difícil · 200 XP)
  ├── 1203 · Modernización de aplicación monolítica (REPAIR · Difícil · 200 XP)
  ├── 1204 · Diseña una arquitectura Serverless global (BUILDER · Difícil · 200 XP)
  ├── 1205 · Auditoría Well-Architected integral (AUDIT · Difícil · 200 XP)
  └── 1206 · Incidente crítico de producción: Caída total (DIAGNOSE · Difícil · 200 XP)
```

---

## 4. Estructura Declarativa de Contenido

```text
content/challenges/
├── unit-9/
│   ├── unit.json
│   ├── challenge-901.json
│   ├── challenge-902.json
│   └── challenge-903.json
├── unit-10/
│   ├── unit.json
│   ├── challenge-1001.json
│   ├── challenge-1002.json
│   ├── challenge-1003.json
│   └── challenge-1004.json
├── unit-11/
│   ├── unit.json
│   ├── challenge-1101.json
│   ├── challenge-1102.json
│   └── challenge-1103.json
└── unit-12/
    ├── unit.json
    ├── challenge-1201.json
    ├── challenge-1202.json
    ├── challenge-1203.json
    ├── challenge-1204.json
    ├── challenge-1205.json
    └── challenge-1206.json
```

---

## 5. Matriz de Soluciones Canónicas (Gold Solutions)

* **901 (ECS + ECR):** `AWS_ECR` $\rightarrow$ `AWS_ECS` (`CONTAINER_IMAGE`).
* **902 (Fargate + ALB):** `AWS_ALB` $\rightarrow$ `AWS_ECS` (con `AWS_FARGATE`) (`HTTP_TRAFFIC`).
* **903 (Migración EC2 $\rightarrow$ Contenedores):** Reemplazo de EC2 por clúster ECS con Fargate tras ALB.
* **1001 (CloudWatch):** `AWS_EC2` $\rightarrow$ `AWS_CLOUDWATCH`, `AWS_RDS` $\rightarrow$ `AWS_CLOUDWATCH`.
* **1002 (Diagnóstico CloudWatch):** Diagnóstico de errores 5XX en ALB mediante CloudWatch.
* **1003 (CloudTrail):** `AWS_CLOUDTRAIL` $\rightarrow$ `AWS_S3` (`AUDIT_LOGS`).
* **1004 (Incidente Cascada):** ALB + 2 EC2 + RDS Multi-AZ + CloudWatch Monitoring.
* **1101 (CloudFormation):** `AWS_CLOUDFORMATION` gestionando recursos declarativos.
* **1102 (Pipeline IaC):** `AWS_CLOUDFORMATION` aprovisionando `AWS_S3` y `AWS_LAMBDA`.
* **1103 (Repair Drift):** Resolver dependencias inconsistentes en la pila CloudFormation.
* **1201 (Capstone E-Commerce):** `AWS_CLOUDFRONT` $\rightarrow$ `AWS_ALB` $\rightarrow$ 2 `AWS_EC2` $\rightarrow$ `AWS_RDS` (Multi-AZ) + `AWS_S3`.
* **1202 (Tráfico Impredecible):** `AWS_APIGATEWAY` $\rightarrow$ `AWS_LAMBDA` $\rightarrow$ `AWS_SQS` $\rightarrow$ `AWS_DYNAMODB`.
* **1203 (Modernización Monolito):** `AWS_ALB` $\rightarrow$ `AWS_ECS` + `AWS_FARGATE` $\rightarrow$ `AWS_RDS` + `AWS_S3`.
* **1204 (Serverless Global):** `AWS_CLOUDFRONT` + `AWS_S3` + `AWS_APIGATEWAY` + `AWS_LAMBDA` + `AWS_EVENTBRIDGE` + `AWS_DYNAMODB`.
* **1205 (Auditoría Well-Architected):** WAF + ALB + 2 EC2 Multi-AZ + RDS Multi-AZ + CloudWatch.
* **1206 (Incidente Crítico Producción):** Topología completa recuperada con balanceo, auto-escalado, BD aislada y observabilidad continua.
