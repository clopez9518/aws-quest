# Especificación Técnica: Fase 1 (Ola 1 — IaaS Foundations & Resiliencia)

> **Documento de Especificación de Implementación Oficial**  
> **Fase:** Fase 1 / Ola 1 (Unidades 1 a 5 — 20 Desafíos)  
> **Estado:** Implementado / Activo  
> **Referencia Curricular:** [`specs/master-learning-path-curriculum-spec.md`](file:///c:/workspace/aws/aws-game/specs/master-learning-path-curriculum-spec.md)  
> **Auditoría Pedagógica:** [`docs/15-pedagogical-learning-experience-audit.md`](file:///c:/workspace/aws/aws-game/docs/15-pedagogical-learning-experience-audit.md)  
> **Plan de Ejecución:** [`docs/16-pedagogical-critical-fixes-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/16-pedagogical-critical-fixes-implementation-plan.md)

---

## 1. Resumen Ejecutivo y Objetivos

La **Fase 1 (Ola 1)** establece los cimientos de infraestructura como servicio (IaaS), redes lógicas, persistencia estructurada y no estructurada, seguridad perimetral y alta disponibilidad en AWS Quest.

### Objetivos Pedagógicos Centrales:
1. **Diferenciación de Almacenamiento:** Distinguir claramente el propósito, ciclo de vida y rendimiento de EBS (bloque persistente mononodo), EFS (archivos compartidos multinodo) y S3 (almacenamiento masivo de objetos sin estado).
2. **Topología de Redes y Aislamiento:** Construir redes virtuales privadas (VPC), segmentación en subredes públicas/privadas, enrutamiento a Internet (IGW/NAT) y firewalls stateful (Security Groups).
3. **Seguridad y Capa de Datos:** Aprovisionamiento de bases de datos relacionales administradas (RDS), aislamiento en subredes privadas sin IP pública, conexión segura mediante Security Groups y gestión de credenciales con AWS Secrets Manager.
4. **Resiliencia y Elasticidad:** Eliminación de Puntos Únicos de Fallo (SPOF), balanceo de carga L7 con ALB, alta disponibilidad de bases de datos (Multi-AZ) y resolución de incidentes de sobrecarga operativa en roles de SRE.

---

## 2. Convenciones de Diseño y Reglas Pedagógicas

Todos los desafíos de la Ola 1 siguen los estándares formativos definidos en la auditoría:

1. **Escalera Socrática de Pistas (4 Niveles):**
   * **Nivel 1 (Reflexión / Concepto):** Guía al estudiante a preguntarse sobre el requerimiento arquitectónico sin dar nombres de servicios (Penalidad: 5 XP).
   * **Nivel 2 (Patrón Arquitectónico):** Identifica el patrón de diseño recomendado (e.g. desacoplamiento, capa de persistencia privada) (Penalidad: 10 XP).
   * **Nivel 3 (Servicio AWS Sugerido):** Señala el servicio específico del catálogo AWS adecuado para la solución (Penalidad: 15 XP).
   * **Nivel 4 (Acción Directa en Canvas):** Instrucción puntual sobre la conexión, contenedor o configuración requerida en el canvas (Penalidad: 20 XP).

2. **Desafíos de Reparación Basados en Incidentes (Sin Spoilers):**
   * En los desafíos de tipo `REPAIR` (e.g. 403, 501, 505), el título y la descripción plantean el síntoma del problema o incidente de negocio (e.g. *"Incidente: Advertencia de Cumplimiento en Persistencia"* o *"Servidor Saturado bajo Tráfico"*), evitando revelar la solución técnica directa en el enunciado.

3. **Feedback Causa-Efecto y Consolidación:**
   * Toda evaluación fallida o anti-patrón detectado devuelve: `ProductionRisk`, `WellArchitectedPillar`, y `FormativeRecommendation`.
   * Toda evaluación aprobada genera consolidación de aprendizajes: `KeyConceptsLearned` y `ArchitecturalTradeoffs`.

---

## 3. Catálogo de Unidades y Desafíos de la Ola 1

```text
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                             OLA 1: IAAS FOUNDATIONS (20 DESAFÍOS)                     ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

  UNIDAD 1: Computación y Almacenamiento ("¿Dónde vive mi aplicación?")
  ├── 101 · Mi primer servidor con EC2 (BUILDER · Fácil · 100 XP)
  ├── 102 · Persistencia: EBS (BUILDER · Fácil · 100 XP)
  ├── 103 · Archivos compartidos con EFS (BUILDER · Fácil-Med · 120 XP)
  └── 104 · Almacenamiento de objetos con S3 (BUILDER · Fácil · 100 XP)

  UNIDAD 2: Construir una Aplicación Web ("¿Cómo conecto mi aplicación con sus usuarios?")
  ├── 201 · Aplicación Web Básica (BUILDER · Fácil · 100 XP)
  ├── 202 · Separando Frontend y Backend con S3 + EC2 (BUILDER · Fácil-Med · 120 XP)
  └── 203 · Contenido Global con CloudFront + S3 (BUILDER · Intermedio · 150 XP)

  UNIDAD 3: Redes: Construir el Camino ("¿Cómo viaja el tráfico?")
  ├── 301 · Crear una VPC y sus Subnets (BUILDER · Fácil-Med · 120 XP)
  ├── 302 · Conectar la VPC a Internet (BUILDER · Intermedio · 150 XP)
  ├── 303 · Subnets Públicas y Privadas con NAT (BUILDER · Intermedio · 150 XP)
  └── 304 · Controlar el tráfico con Security Groups (BUILDER · Intermedio · 150 XP)

  UNIDAD 4: Datos y Seguridad ("¿Dónde viven los datos y quién puede acceder?")
  ├── 401 · Base de Datos con RDS (BUILDER · Intermedio · 150 XP)
  ├── 402 · Aplicación + RDS en Arquitectura de Capas (BUILDER · Intermedio · 150 XP)
  ├── 403 · Incidente de Seguridad: Base de Datos Expuesta (REPAIR · Intermedio · 150 XP)
  └── 404 · Gestión de Secretos y Credenciales (BUILDER · Intermedio · 150 XP)

  UNIDAD 5: Disponibilidad y Escalabilidad ("¿Qué pasa cuando algo falla o llega tráfico?")
  ├── 501 · Eliminar un Single Point of Failure (REPAIR · Intermedio · 150 XP)
  ├── 502 · Distribuir tráfico con ALB (BUILDER · Intermedio · 150 XP)
  ├── 503 · Escalabilidad automática con Auto Scaling (BUILDER · Intermedio · 150 XP)
  ├── 504 · Base de Datos Multi-AZ de Alta Disponibilidad (BUILDER · Intermedio · 150 XP)
  └── 505 · Incidente SRE: Servidor Saturado (REPAIR · Intermedio · 150 XP)
```

---

## 4. Estructura Declarativa de Contenido

Cada unidad reside en `content/challenges/unit-X/` con la siguiente estructura de archivos:

```text
content/challenges/
├── unit-1/
│   ├── unit.json
│   ├── challenge-101.json
│   ├── challenge-102.json
│   ├── challenge-103.json
│   └── challenge-104.json
├── unit-2/
│   ├── unit.json
│   ├── challenge-201.json
│   ├── challenge-202.json
│   └── challenge-203.json
├── unit-3/
│   ├── unit.json
│   ├── challenge-301.json
│   ├── challenge-302.json
│   ├── challenge-303.json
│   └── challenge-304.json
├── unit-4/
│   ├── unit.json
│   ├── challenge-401.json
│   ├── challenge-402.json
│   ├── challenge-403.json
│   └── challenge-404.json
└── unit-5/
    ├── unit.json
    ├── challenge-501.json
    ├── challenge-502.json
    ├── challenge-503.json
    ├── challenge-504.json
    └── challenge-505.json
```

---

## 5. Matriz de Evaluación y Soluciones Canónicas (Gold Solutions)

### Unidad 1: Computación y Almacenamiento
* **101 (EC2):** Requiere `AWS_EC2` ($1$ instancia).
* **102 (EBS):** Requiere `AWS_EC2` ($1$), `AWS_EBS` ($1$), y conexión `ATTACHED_STORAGE` entre `AWS_EC2` y `AWS_EBS`.
* **103 (EFS):** Requiere `AWS_EC2` ($2$), `AWS_EFS` ($1$), y conexiones `NFS_MOUNT` desde ambas instancias EC2 hacia EFS.
* **104 (S3):** Requiere `AWS_EC2` ($1$), `AWS_S3` ($1$), y conexión `OBJECT_STORAGE` / `HTTP_API`.

### Unidad 2: Construir una Aplicación Web
* **201 (Web Básica):** Requiere `AWS_EC2` ($1$) configurado con puerto HTTP 80 abierto en Ingress.
* **202 (S3 + EC2):** Requiere `AWS_S3` ($1$, frontend estático) y `AWS_EC2` ($1$, backend API) con conexión `HTTP_API`.
* **203 (CloudFront + S3):** Requiere `AWS_CLOUDFRONT` ($1$), `AWS_S3` ($1$), y conexión `ORIGIN` desde CloudFront hacia S3.

### Unidad 3: Redes: Construir el Camino
* **301 (VPC + Subnets):** Requiere `NET_VPC` ($1$), `NET_SUBNET` ($2$: $1$ Public, $1$ Private) dentro de la VPC.
* **302 (VPC + IGW):** Requiere `NET_VPC` ($1$), `NET_SUBNET` ($1$ Public), `NET_IGW` ($1$), conexión `ATTACHED_VPC` y regla de enrutamiento pública hacia `NET_IGW`.
* **303 (Públicas/Privadas + NAT):** Requiere `NET_VPC`, $1$ subred pública con IGW y `NET_NAT_GATEWAY`, $1$ subred privada con regla de ruteo hacia el NAT Gateway.
* **304 (Security Groups):** Requiere `NET_SECURITY_GROUP` ($1$), `AWS_EC2` ($1$) con regla de Security Group permitiendo puertos 80/443.

### Unidad 4: Datos y Seguridad
* **401 (RDS en Red Privada):** Requiere `NET_VPC`, `NET_SUBNET` (Private), `AWS_RDS` ($1$ ubicado en la subred privada).
* **402 (App + RDS Capas):** Requiere `NET_VPC`, `NET_SUBNET` (Public con EC2), `NET_SUBNET` (Private con RDS), conexión `DATABASE` y Security Group en puerto 5432.
* **403 (Repair: Aislar BD):** InitialGraph con RDS en subred pública con IGW. Solución: Mover RDS a subred privada y asociar Security Group restrictivo.
* **404 (Secrets Manager):** Requiere `AWS_EC2`, `AWS_RDS`, `AWS_SECRETS_MANAGER` con conexión segura para evitar credenciales estáticas.

### Unidad 5: Disponibilidad y Escalabilidad
* **501 (Repair: SPOF):** InitialGraph con $1$ EC2 monolítico. Solución: Agregar segundo EC2 y `AWS_ALB` distribuyendo tráfico.
* **502 (ALB + Multi-EC2):** Requiere `AWS_ALB` ($1$), `AWS_EC2` ($2$), y conexiones `HTTP_TRAFFIC` desde ALB a ambas instancias.
* **503 (Auto Scaling):** Requiere `AWS_ALB`, `AWS_EC2` configurado como Auto Scaling Group en múltiples subredes.
* **504 (RDS Multi-AZ):** Requiere `AWS_RDS` con `isMultiAz: true` en subredes privadas redundantes.
* **505 (Repair SRE: Servidor Saturado):** InitialGraph degradado. Solución: Arquitectura resiliente de 2 capas con ALB + 2 EC2 + RDS Multi-AZ.

---

## 6. Guía para Futuros Agentes y Mantenimiento

1. **Lectura de Desafíos:** Los desafíos son deserializados por `JsonChallengeContentReader` y sincronizados por `ChallengeSeeder` en la base de datos PostgreSQL/InMemory.
2. **Validación de Reglas:** Las reglas declarativas en `evaluationRules` son ejecutadas por `EvaluationEngine` (`ServicePresenceEvaluator`, `PlacementEvaluator`, `NetworkTopologyEvaluator`, `SecurityGroupEvaluator`, `ConnectionEvaluator`, `AntiPatternEvaluator`).
3. **Añadir o Modificar Desafíos:**
   - Mantener la convención de numeración (`challenge-XYZ.json` donde `X` es la unidad, e.g. 101, 302, 504).
   - Siempre registrar las 4 pistas progresivas.
   - Ejecutar la suite de pruebas de integración canónica (`dotnet test`) para validar que la solución dorada obtenga $\ge 70$ puntos y las soluciones erróneas sean rechazadas con feedback formativo.
