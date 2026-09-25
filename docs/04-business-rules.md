# Reglas de Negocio - AWS Architecture Quest

## 1. Introducción y Alcance
Este documento define las Reglas de Negocio (RN) que rigen el comportamiento, las restricciones, los criterios de puntuación, el uso de pistas y la progresión en **AWS Architecture Quest**. 
Estas reglas garantizan la consistencia pedagógica y la equidad dentro de la plataforma educativos.

---

## 2. Estructura de Bloques de Reglas de Negocio
* **Bloque 1:** Reglas de Acceso y Progresión de Contenido
* **Bloque 2:** Reglas de Construcción y Validez de Arquitecturas
* **Bloque 3:** Reglas de Pistas y Penalizaciones
* **Bloque 4:** Reglas de Evaluación, Puntuación y Experiencia (XP)
* **Bloque 5:** Reglas de Reintentos y Persistencia

---

## 3. Especificación de Reglas de Negocio

### Bloque 1: Reglas de Acceso y Progresión de Contenido

#### RN-01: Accesibilidad de Desafíos (Política Configurable)
* **Regla:** El sistema debe soportar dos modalidades de acceso a los desafíos, configurables por el sistema o por el usuario:
  1. **Modo Libre (Open Access):** Todos los desafíos y unidades están desbloqueados y disponibles para jugar desde el primer momento.
  2. **Modo Progresivo:** Los desafíos avanzados requieren haber completado los desafíos prerrequisito o alcanzado el nivel de XP definido.
* **Resultado:** Permite adaptar la experiencia tanto para usuarios que desean un aprendizaje guiado paso a paso como para quienes prefieren explorar problemas específicos libremente.

#### RN-02: Criterio de Aprobación de un Desafío
* **Regla:** Un desafío se considerará en estado *Completado* únicamente cuando la solución enviada obtenga una calificación igual o superior a 70/100 puntos en el motor de evaluación.
* **Resultado:** Al aprobar, se marca el estado del desafío como completado y se otorga la XP correspondiente.

---

### Bloque 2: Reglas de Construcción y Validez de Arquitecturas

#### RN-03: Restricción del Catálogo por Desafío
* **Regla:** El usuario solo puede agregar al canvas los servicios de AWS que hayan sido explícitamente incluidos en el catálogo permitido para el desafío actual (pudiendo incluir servicios distractores intencionales).

#### RN-04: Límites de Instanciación de Nodos
* **Regla:** Si la definición de un desafío establece un límite máximo de instancias para un tipo de servicio (ej. máximo 2 instancias EC2 o 1 base de datos RDS), el canvas impedirá agregar componentes adicionales una vez alcanzado el límite.

#### RN-05: Coherencia de Conexiones entre Servicios
* **Regla:** Toda conexión trazada entre dos nodos en el canvas debe seguir una relación arquitectónica permitida en el modelo de AWS (ej. un Load Balancer puede conectarse a EC2 o ECS, pero no directamente a una tabla DynamoDB). Conexiones inválidas son rechazadas o marcadas como error en la evaluación.

---

### Bloque 3: Reglas de Pistas y Penalizaciones

#### RN-06: Solicitud Secuencial de Pistas
* **Regla:** Las pistas asociadas a un desafío deben solicitarse y revelarse en orden estricto (Pista 1 $\rightarrow$ Pista 2 $\rightarrow$ Pista 3).
* **Restricción:** El sistema impedirá solicitar la pista $N+1$ sin antes haber revelado la pista $N$.

#### RN-07: Deducción Acumulativa por Pistas
* **Regla:** Revelar una pista aplica un descuento directo sobre la puntuación máxima alcanzable en ese intento del desafío.
* **Cálculo:** Cada pista restará un valor predefinido de puntos (ej. Pista 1: -5 pts, Pista 2: -10 pts, Pista 3: -15 pts) sobre la nota final de la evaluación.

---

### Bloque 4: Reglas de Evaluación, Puntuación y Experiencia (XP)

#### RN-08: Penalización por Errores y Servicios Innecesarios
* **Regla:** El motor de evaluación aplicará deducciones de puntaje según dos criterios:
  1. **Servicios innecesarios:** Agregar servicios que no forman parte de la solución ni resuelven ningún requisito del desafío resta puntos.
  2. **Fallos arquitectónicos graves:** Introducir Single Points of Failure, problemas de seguridad o cuellos de botella resta puntos según la gravedad estipulada en la regla del desafío.

#### RN-09: Conservación del Récord de Puntuación (High Score)
* **Regla:** El sistema conservará y mostrará siempre la mayor puntuación histórica obtenida por el usuario en cada desafío.
* **Resultado:** Si un usuario vuelve a intentar un desafío previamente aprobado y obtiene un puntaje menor, la calificación récord guardada no se verá perjudicada ni sobrescrita a un valor inferior.

#### RN-10: Otorgamiento de XP sin Re-Farmeo
* **Regla:** Los puntos de experiencia (XP) globales del usuario aumentan únicamente al alcanzar un nuevo récord personal de calificación en un desafío.
* **Resultado:** Repetir un desafío ya completado sin superar el puntaje previo no otorgará XP adicional, evitando el "farmeo" ilimitado de puntos.

---

### Bloque 5: Reglas de Reintentos y Persistencia

#### RN-11: Reintentos Ilimitados y Aprendizaje Libre
* **Regla:** El usuario puede reintentar cualquier desafío cuantas veces lo considere necesario sin penalizaciones permanentes ni restricciones de consumo (sin sistema de vidas ni vidas limitadas).
* **Propósito:** Promover un entorno seguro donde cometer errores y experimentar forma parte del ciclo de aprendizaje.

#### RN-12: Ejecución de Reglas tras Envío Explícito
* **Regla:** Las reglas de evaluación y deducción de puntos se aplican únicamente cuando el usuario presiona el botón "Enviar solución".
* **Resultado:** El usuario puede mover, probar y reorganizar servicios libremente en el canvas sin activar evaluaciones intermedias ni penalizaciones mientras diseña su arquitectura.

#### RN-13: Migración de Progreso de Invitado a Usuario Registrado
* **Regla:** Si un usuario que interactuó en Modo Invitado decide registrarse o iniciar sesión, el sistema transfiere de forma atómica e íntegra todos sus récords de puntuación (`highScore`), historial de intentos y XP acumulados a su nueva cuenta registrada.
* **Resultado:** Garantiza que el esfuerzo educativo realizado en Modo Invitado nunca se pierda.

---

## 4. Matriz de Verificación y Cumplimiento

Esta matriz valida que las Reglas de Negocio están perfectamente alineadas con los objetivos educativos y de producto expuestos en `01-product-requeriments.md`:

| Objetivo del Proyecto (`01-product-requeriments.md`) | Reglas de Negocio Asociadas | Estado de Alineación |
| :--- | :--- | :--- |
| **Aprendizaje flexible y libre exploración vs. ruta guiada** | RN-01 | Alineado |
| **Fomentar el aprendizaje práctico basado en errores** | RN-02, RN-11, RN-12 | Alineado |
| **Construcción realista de arquitecturas AWS** | RN-03, RN-04, RN-05 | Alineado |
| **Uso responsable de pistas educativas** | RN-06, RN-07 | Alineado |
| **Evaluación justa y motivación gamificada (XP/High Score)** | RN-08, RN-09, RN-10, RN-13 | Alineado |

---


