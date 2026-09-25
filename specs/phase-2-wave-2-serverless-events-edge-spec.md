# Especificación Técnica: Fase 2 (Ola 2 — Serverless, Eventos y Edge)

> **Documento de Especificación de Implementación Oficial**  
> **Fase:** Fase 2 / Ola 2 (Unidades 6 a 8 — 13 Desafíos)  
> **Estado:** Implementado / Activo  
> **Referencia Curricular:** [`specs/master-learning-path-curriculum-spec.md`](file:///c:/workspace/aws/aws-game/specs/master-learning-path-curriculum-spec.md)  
> **Auditoría Pedagógica:** [`docs/15-pedagogical-learning-experience-audit.md`](file:///c:/workspace/aws/aws-game/docs/15-pedagogical-learning-experience-audit.md)  
> **Plan de Ejecución:** [`docs/16-pedagogical-critical-fixes-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/16-pedagogical-critical-fixes-implementation-plan.md)

---

## 1. Resumen Ejecutivo y Objetivos

La **Fase 2 (Ola 2)** amplía el currículo de AWS Quest hacia paradigmas modernos de nube: computación sin servidor (*Serverless*), integración asíncrona dirigida por eventos (*Event-Driven Architecture*) y distribución perimetral global (*Edge Networking, DNS y Web Application Firewall*).

### Objetivos Pedagógicos Centrales:
1. **Computación Efímera y Persistencia NoSQL (Unidad 6):** Comprender el cómputo reactivo basado en eventos con AWS Lambda, la exposición de APIs REST administradas con Amazon API Gateway y la persistencia de alto rendimiento con Amazon DynamoDB.
2. **Desacoplamiento y Mensajería Asíncrona (Unidad 7):** Implementar amortiguación de tráfico con colas Amazon SQS, distribución uno-a-muchos (*Fan-Out*) con Amazon SNS y enrutamiento granular de eventos mediante Amazon EventBridge.
3. **Distribución Global y Seguridad Perimetral (Unidad 8):** Gestionar resolución inteligente de nombres con Amazon Route 53, aceleración y caching en puntos de presencia (PoP) mundiales con Amazon CloudFront y filtrado de amenazas en capa 7 con AWS WAF.

---

## 2. Convenciones de Diseño y Reglas Pedagógicas

1. **Escalera Socrática de 4 Niveles en Todas las Pistas:**
   * Nivel 1 (Reflexión / Pregunta Guía): Sin nombres de servicios (5 XP).
   * Nivel 2 (Patrón Arquitectónico): Fan-Out, Dead-Letter Queues, Edge Caching, REST Proxy (10 XP).
   * Nivel 3 (Servicio AWS Recomendado): Lambda, SQS, SNS, EventBridge, Route 53, CloudFront, WAF (15 XP).
   * Nivel 4 (Acción Directa en Canvas): Conexiones exactas y colocación en canvas (20 XP).
2. **Escenario de Reparación Basado en Incidentes (Sin Spoilers):**
   * Desafíos como el 605 y 704 presentan problemas operativos reales (timeouts síncronos, acoplamiento rígido) para que el estudiante aplique el patrón de remediación adecuado.
3. **Validación Canónica (Gold Solution Tests):**
   * Cada uno de los 13 desafíos cuenta con pruebas automatizadas que verifican la aprobación con puntaje $\ge 70$ y detección de anti-patrones.

---

## 3. Catálogo de Unidades y Desafíos de la Ola 2

```text
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                      OLA 2: SERVERLESS, EVENTOS Y EDGE (13 DESAFÍOS)                  ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

  UNIDAD 6: Arquitecturas Serverless ("¿Siempre necesito administrar servidores?")
  ├── 601 · Ejecutar código con Lambda (BUILDER · Intermedio · 150 XP)
  ├── 602 · API Serverless con API Gateway + Lambda (BUILDER · Intermedio · 150 XP)
  ├── 603 · Persistencia Serverless con DynamoDB (BUILDER · Intermedio · 150 XP)
  ├── 604 · Arquitectura Serverless Completa (BUILDER · Intermedio · 150 XP)
  └── 605 · Incidente Serverless: Monolito Ineficiente (REPAIR · Intermedio · 150 XP)

  UNIDAD 7: Comunicación y Eventos ("¿Cómo desacoplo mis componentes?")
  ├── 701 · Colas con SQS (BUILDER · Intermedio · 150 XP)
  ├── 702 · Publicación de Eventos con SNS (BUILDER · Intermedio · 150 XP)
  ├── 703 · Arquitectura Event-Driven con EventBridge (BUILDER · Intermedio · 150 XP)
  └── 704 · Reparación de un Sistema Acoplado (REPAIR · Intermedio · 150 XP)

  UNIDAD 8: Edge, DNS y Seguridad Web ("¿Cómo hago mi aplicación global y resistente?")
  ├── 801 · DNS con Route 53 (BUILDER · Intermedio · 150 XP)
  ├── 802 · CDN Global con CloudFront y ALB (BUILDER · Intermedio · 150 XP)
  ├── 803 · Protección Web con WAF (BUILDER · Intermedio · 150 XP)
  └── 804 · Arquitectura Web Global Resiliente (BUILDER · Difícil · 200 XP)
```

---

## 4. Estructura Declarativa de Contenido

```text
content/challenges/
├── unit-6/
│   ├── unit.json
│   ├── challenge-601.json
│   ├── challenge-602.json
│   ├── challenge-603.json
│   ├── challenge-604.json
│   └── challenge-605.json
├── unit-7/
│   ├── unit.json
│   ├── challenge-701.json
│   ├── challenge-702.json
│   ├── challenge-703.json
│   └── challenge-704.json
└── unit-8/
    ├── unit.json
    ├── challenge-801.json
    ├── challenge-802.json
    ├── challenge-803.json
    └── challenge-804.json
```

---

## 5. Matriz de Soluciones Canónicas (Gold Solutions)

* **601 (Lambda):** Requiere `AWS_LAMBDA` (1).
* **602 (API GW + Lambda):** Requiere `AWS_APIGATEWAY` (1), `AWS_LAMBDA` (1) con conexión `INVOCATION` o `HTTP_API`.
* **603 (Lambda + DynamoDB):** Requiere `AWS_LAMBDA` (1), `AWS_DYNAMODB` (1) con conexión `DATABASE` / `API_CALL`.
* **604 (Serverless Completo):** Requiere `AWS_S3` (1), `AWS_APIGATEWAY` (1), `AWS_LAMBDA` (1), `AWS_DYNAMODB` (1) con flujo completo de invocación y persistencia.
* **605 (Repair Serverless):** Reparar arquitectura con `AWS_APIGATEWAY` + `AWS_LAMBDA` + `AWS_DYNAMODB`.
* **701 (SQS):** Requiere `AWS_EC2` (2), `AWS_SQS` (1) con conexiones `MESSAGE_QUEUE` para productor y consumidor.
* **702 (SNS Fan-Out):** Requiere `AWS_SNS` (1), `AWS_SQS` (1), `AWS_LAMBDA` (1) con conexiones desde SNS hacia ambos suscriptores.
* **703 (EventBridge):** Requiere `AWS_EVENTBRIDGE` (1), `AWS_LAMBDA` (1), `AWS_SQS` (1) con reglas de enrutamiento hacia destinos.
* **704 (Repair Sistema Acoplado):** Interponer `AWS_SQS` entre servidores desacoplados para evitar llamadas síncronas bloqueantes.
* **801 (Route 53):** Requiere `AWS_ROUTE53` (1), `AWS_ALB` (1) con conexión de enrutamiento DNS.
* **802 (CloudFront + ALB + S3):** Requiere `AWS_CLOUDFRONT` (1), `AWS_ALB` (1), `AWS_S3` (1) con conexiones de origen dinámico y estático.
* **803 (WAF):** Requiere `AWS_WAF` (1), `AWS_CLOUDFRONT` (1) o `AWS_ALB` (1) con asociación de seguridad perimetral.
* **804 (Arquitectura Web Global):** Topología integral `AWS_ROUTE53` $\rightarrow$ `AWS_CLOUDFRONT` (con `AWS_WAF`) $\rightarrow$ `AWS_ALB` $\rightarrow$ `AWS_EC2` (2).
