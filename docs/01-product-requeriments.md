# Product Requirements

## 1. Product Overview

**Nombre provisional:** AWS Architecture Quest

AWS Architecture Quest es una aplicación web educativa y gamificada cuyo objetivo es ayudar a los usuarios a aprender arquitectura y servicios de Amazon Web Services (AWS) mediante la resolución de casos prácticos.

En lugar de aprender únicamente mediante preguntas teóricas, el usuario recibirá situaciones similares a problemas reales de arquitectura de software y deberá diseñar una solución utilizando un conjunto limitado de servicios AWS.

El usuario podrá seleccionar y organizar servicios dentro de una arquitectura visual, recibir una evaluación de su solución y utilizar pistas para comprender los conceptos involucrados.

El producto estará diseñado inicialmente como una aplicación web, pero su diseño deberá permitir una futura adaptación a dispositivos móviles.

---

## 2. Problem Statement

Aprender AWS puede resultar difícil cuando el aprendizaje se basa principalmente en memorizar servicios y sus características.

El producto busca resolver este problema proporcionando un entorno práctico donde el usuario pueda:

* Analizar problemas de arquitectura.
* Identificar los requisitos importantes de una solución.
* Seleccionar servicios AWS apropiados.
* Construir arquitecturas visualmente.
* Cometer errores y recibir retroalimentación.
* Comprender por qué una solución es correcta o incorrecta.
* Progresar desde conceptos básicos hasta arquitecturas complejas.

---

## 3. Product Goal

El objetivo principal es convertir el aprendizaje de AWS en una experiencia práctica y gamificada basada en resolución de problemas.

El usuario debería aprender a responder preguntas como:

> "¿Qué servicios AWS necesito para construir una aplicación que pueda soportar un aumento repentino de tráfico y mantener alta disponibilidad?"

en lugar de limitarse a memorizar:

> "¿Qué es Amazon EC2?"

---

## 4. Target Users

El producto está dirigido principalmente a:

* Personas que están aprendiendo AWS.
* Estudiantes de informática y carreras relacionadas.
* Desarrolladores que desean comprender arquitectura cloud.
* Personas que se están preparando para certificaciones AWS.
* Desarrolladores que quieren practicar diseño de arquitecturas AWS.

El nivel de dificultad deberá poder adaptarse desde usuarios principiantes hasta usuarios con conocimientos intermedios de AWS.

---

## 5. Core Gameplay Loop

El ciclo principal del juego será:

```text
Recibir caso
     ↓
Analizar requisitos
     ↓
Revisar servicios disponibles
     ↓
Construir arquitectura
     ↓
Solicitar pistas (opcional)
     ↓
Enviar solución
     ↓
Evaluar arquitectura
     ↓
Recibir explicación y puntuación
     ↓
Aprender de los errores
     ↓
Continuar al siguiente desafío
```

---

## 6. Challenges

El contenido principal del producto serán desafíos basados en situaciones prácticas.

Cada desafío deberá definir:

* Un caso o problema.
* Requisitos funcionales y técnicos.
* Restricciones.
* Servicios AWS disponibles.
* Servicios esperados o válidos.
* Relaciones necesarias entre componentes.
* Condiciones que deben cumplirse.
* Posibles errores.
* Pistas.
* Criterios de evaluación.
* Nivel de dificultad.

No todos los servicios disponibles deberán ser necesariamente utilizados.

El usuario deberá decidir qué servicios son apropiados según los requisitos del caso.

---

## 7. Architecture Builder

El usuario contará con un área visual donde podrá construir la solución mediante interacción de tipo Drag & Drop.

Ejemplo conceptual:

```text
Servicios disponibles          Arquitectura

┌──────────┐
│   EC2     │
└──────────┘

┌──────────┐                 ┌──────────────┐
│   RDS     │                 │              │
└──────────┘                 │  DROP AREA   │
                             │              │
┌──────────┐                 │              │
│   ALB    │                 └──────────────┘
└──────────┘
```

Los servicios deberán representarse de manera simplificada para que el usuario se concentre en comprender su función arquitectónica y no en detalles innecesarios de la consola de AWS.

---

## 8. AWS Service Units

El contenido estará organizado en unidades de aprendizaje.

Ejemplos:

* IAM
* EC2
* Escalabilidad
* Load Balancers
* Almacenamiento
* RDS
* Redes e infraestructura
* Seguridad
* Alta disponibilidad
* Serverless
* Mensajería
* Caché
* Monitoreo

Las unidades podrán estar disponibles en modo libre o desbloquearse progresivamente según la configuración de accesibilidad, combinándose posteriormente en desafíos integradores.

---

## 9. Difficulty Progression

Los desafíos deberán aumentar progresivamente su complejidad.

### Fácil

Problemas centrados en uno o pocos conceptos.

Ejemplo:

> Elegir el servicio adecuado para almacenar archivos.

### Intermedio

Problemas que requieren combinar varios servicios.

Ejemplo:

> Diseñar una aplicación web altamente disponible con base de datos.

### Difícil

Problemas que requieren considerar múltiples dimensiones:

* Escalabilidad.
* Alta disponibilidad.
* Seguridad.
* Costos.
* Rendimiento.
* Recuperación ante fallos.

### Desafíos integradores

El usuario deberá construir arquitecturas completas utilizando conocimientos de múltiples unidades.

---

## 10. Hint System

Los desafíos deberán ofrecer un sistema de pistas progresivas.

Las pistas deberán ayudar al usuario a razonar la solución sin revelar inmediatamente la respuesta.

Ejemplo:

```text
Pista 1:
"Piensa en cómo distribuirías las solicitudes."

        ↓

Pista 2:
"Tu aplicación tiene múltiples servidores."

        ↓

Pista 3:
"Necesitas un servicio administrado de Load Balancing."
```

El uso de pistas podrá afectar la puntuación obtenida.

---

## 11. Evaluation System

Al finalizar un desafío, el sistema deberá evaluar la arquitectura construida.

La evaluación no deberá limitarse a indicar "correcto" o "incorrecto".

Deberá proporcionar retroalimentación sobre:

* Servicios seleccionados.
* Servicios faltantes.
* Servicios innecesarios.
* Relaciones incorrectas.
* Requisitos no cumplidos.
* Problemas de seguridad.
* Problemas de escalabilidad.
* Problemas de disponibilidad.
* Otros errores relevantes para el desafío.

Ejemplo:

```text
Puntuación: 82/100

✓ ALB correctamente utilizado
✓ RDS correctamente seleccionado
✓ Base de datos no expuesta directamente

✗ Falta Auto Scaling
✗ La arquitectura tiene un único servidor EC2
```

---

## 12. Scoring and Progression

El usuario podrá obtener una puntuación por cada desafío.

La puntuación podrá considerar:

* Corrección de la arquitectura.
* Cumplimiento de requisitos.
* Uso de servicios innecesarios.
* Errores arquitectónicos.
* Uso de pistas.
* Tiempo empleado, si posteriormente se considera necesario.

El usuario podrá acumular experiencia y avanzar entre niveles, manteniendo acceso libre a los desafíos o desbloqueándolos por progreso según la modalidad configurada.

---

## 13. Types of Challenges

El producto podrá soportar diferentes tipos de desafíos.

### Architecture Builder

Construir una arquitectura desde cero.

### Fix the Architecture

Identificar y corregir errores en una arquitectura existente.

### Scaling Challenge

Resolver problemas relacionados con aumento de tráfico y escalabilidad.

### Security Challenge

Identificar y corregir problemas de seguridad.

### Cost Challenge

Diseñar una solución que cumpla los requisitos respetando un presupuesto.

### Incident Challenge

Modificar una arquitectura para solucionar un fallo o incidente.

Estas modalidades podrán incorporarse progresivamente.

---

## 14. Real-World Scenarios

Los desafíos deberán estar basados en situaciones similares a problemas reales de arquitectura.

Ejemplos:

* Aplicaciones web.
* APIs.
* Plataformas de streaming.
* Sistemas de reservas.
* Procesamiento de archivos.
* Aplicaciones con tráfico impredecible.
* Sistemas internos empresariales.
* Plataformas de comercio electrónico.
* Sistemas que requieren alta disponibilidad.
* Procesamiento asíncrono.
* Aplicaciones que necesitan recuperación ante fallos.

Los casos deberán priorizar el razonamiento arquitectónico por sobre la memorización.

---

## 15. Educational Feedback

El producto deberá explicar **por qué** una solución es correcta o incorrecta.

Cuando el usuario cometa un error, la explicación deberá relacionar el error con el concepto AWS correspondiente.

Ejemplo:

> "Tu arquitectura utiliza un único EC2. Esto genera un Single Point of Failure. Para cumplir el requisito de alta disponibilidad, puedes utilizar múltiples instancias distribuidas y un Auto Scaling Group detrás de un Load Balancer."

El objetivo es que cada error se convierta en una oportunidad de aprendizaje.

---

## 16. Content Extensibility

El sistema deberá permitir agregar nuevos desafíos y unidades sin necesidad de modificar significativamente la aplicación.

Los desafíos deberán poder definir:

* Caso.
* Servicios disponibles.
* Solución esperada.
* Reglas de validación.
* Pistas.
* Dificultad.
* Recompensas.
* Explicaciones.

Esto permitirá ampliar progresivamente el contenido educativo.

---

## 17. Future Mobile Support

La primera versión será una aplicación web.

Sin embargo, las decisiones de diseño deberán considerar una futura adaptación a dispositivos móviles.

La lógica del juego y las reglas de evaluación deberán estar separadas de la interfaz para facilitar la creación de futuros clientes, como una aplicación móvil.

---

## 18. Future AWS Deployment

El producto podrá utilizar servicios AWS para su propia infraestructura como parte del aprendizaje.

En una etapa posterior, la aplicación podrá desplegarse utilizando servicios como:

* S3
* CloudFront
* EC2 o ECS
* Application Load Balancer
* RDS
* ElastiCache
* VPC
* IAM
* CloudWatch
* Secrets Manager

El uso de estos servicios en la infraestructura real del producto no forma parte del MVP y se considera una etapa posterior.

---

## 19. MVP Scope

La primera versión deberá centrarse en validar el núcleo del producto.

### Incluido

* Aplicación web.
* Unidades de aprendizaje.
* Desafíos.
* Catálogo limitado de servicios AWS.
* Construcción de arquitecturas mediante Drag & Drop.
* Evaluación de soluciones.
* Pistas.
* Puntuación.
* Progreso básico del usuario.
* Desafíos de dificultad progresiva.

### Fuera del MVP

* Aplicación móvil.
* Ranking global.
* Sistema avanzado de logros.
* Desafíos multijugador.
* Simulación de costos AWS.
* Panel administrativo avanzado.
* Integración real con cuentas AWS.
* Despliegue completo sobre AWS.

---

## 20. Product Vision

AWS Architecture Quest busca convertirse en una plataforma donde aprender AWS signifique **resolver problemas**, no solamente estudiar servicios.

La experiencia debe llevar progresivamente al usuario desde:

```text
"¿Qué hace EC2?"
```

hasta:

```text
"Me entregaron estos requisitos.
¿Qué arquitectura AWS debería diseñar
y por qué?"
```

El producto deberá enseñar al usuario a **pensar como arquitecto cloud**, utilizando AWS como conjunto de herramientas para resolver problemas reales.
