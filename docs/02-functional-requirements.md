# Requisitos Funcionales - AWS Architecture Quest

## 1. Introducción y Alcance
Este documento detalla los Requisitos Funcionales (RF) para la plataforma **AWS Architecture Quest**, derivados del documento de visión de producto `01-product-requeriments.md`. 
Define los comportamientos, funcionalidades y capacidades que el sistema debe ofrecer para cumplir con la experiencia educativa gamificada.

---

## 2. Estructura de Módulos Funcionales
* **Módulo 1:** Navegación, Unidades de Aprendizaje y Desafíos
* **Módulo 2:** Constructor de Arquitecturas (Architecture Builder)
* **Módulo 3:** Sistema de Pistas
* **Módulo 4:** Motor de Evaluación y Retroalimentación Educativa
* **Módulo 5:** Puntuación y Progresión del Usuario
* **Módulo 6:** Extensibilidad de Contenido

---

## 3. Especificación de Requisitos Funcionales

### Módulo 1: Navegación, Unidades de Aprendizaje y Desafíos

#### RF-01: Catálogo de Unidades de Aprendizaje
* **Descripción:** El sistema debe mostrar un catálogo visual con las unidades temáticas de AWS (ej. IAM, EC2, Escalabilidad, RDS, Serverless, etc.).
* **Criterios de Aceptación:**
  * Muestra el título de la unidad, descripción, temas cubiertos y estado de progreso del usuario.
  * Muestra los desafíos pertenecientes a cada unidad.

#### RF-02: Detalle y Contexto del Desafío
* **Descripción:** El sistema debe presentar al usuario toda la información contextual de un desafío antes y durante la resolución.
* **Criterios de Aceptación:**
  * Muestra el caso práctico / problema de la vida real a resolver.
  * Define explícitamente los requisitos técnicos, funcionales y restricciones de la arquitectura requerida.
  * Muestra el nivel de dificultad (Fácil, Intermedio, Difícil, Integrador).
  * Lista el conjunto limitado de servicios AWS disponibles para ese escenario.

#### RF-03: Modalidades de Desafío
* **Descripción:** El sistema debe permitir jugar distintas modalidades de desafíos educativos.
* **Criterios de Aceptación:**
  * **Architecture Builder (MVP):** El usuario construye la arquitectura desde un espacio en blanco.
  * **Fix the Architecture (MVP):** El usuario recibe una arquitectura previa con errores arquitectónicos que debe identificar y corregir.
  * El sistema debe permitir extender a otras modalidades en el futuro (Scaling, Security, Cost, Incident).

#### RF-04: Gestión de Acceso y Progresión de Contenido (Modo Libre / Progresivo)
* **Descripción:** El sistema debe permitir configurar la política de accesibilidad al contenido, soportando tanto la exploración libre como el desbloqueo por progresión.
* **Criterios de Aceptación:**
  * Soporta la selección entre el **Modo Libre (Open Access)** (todos los desafíos y unidades disponibles desde el inicio) y el **Modo Progresivo** (desafíos avanzados requieren prerrequisitos o XP acumulada).
  * En Modo Progresivo, las unidades/desafíos de nivel inicial están desbloqueados por defecto y los avanzados se habilitan al aprobar los prerrequisitos correspondientes.

---

### Módulo 2: Constructor de Arquitecturas (Architecture Builder)

#### RF-05: Canvas Visual Interactivo (Drag & Drop)
* **Descripción:** El sistema debe proveer un área visual interactiva donde el usuario puede arrastrar y soltar servicios de AWS para construir la arquitectura.
* **Criterios de Aceptación:**
  * Permite arrastrar servicios desde el panel de disponibilidad hacia el canvas.
  * Permite mover, reposicionar y eliminar componentes dentro del canvas.

#### RF-06: Paleta de Servicios AWS Filtrada
* **Descripción:** El sistema debe mostrar un panel con los servicios de AWS habilitados específicamente para el desafío en curso, consumidos desde el catálogo maestro (`AwsService`).
* **Criterios de Aceptación:**
  * Muestra tarjetas/iconos de servicios estandarizados y simplificados con su nombre y categoría.
  * Respeta la configuración del desafío (`ChallengeService`), indicando límites máximos de instancias por componente y permitiendo la inclusión de servicios distractores.
  * Impide el uso de servicios no incluidos en la configuración del desafío actual.

#### RF-07: Conexión y Relación entre Componentes
* **Descripción:** El sistema debe permitir al usuario trazar relaciones/conexiones visuales entre los servicios agregados al canvas.
* **Criterios de Aceptación:**
  * Permite conectar componentes indicando flujo o dependencia (ej. ALB $\rightarrow$ EC2, EC2 $\rightarrow$ RDS).
  * Permite seleccionar y eliminar conexiones existentes.

#### RF-08: Inspección de Componentes y Propiedades Básicas
* **Descripción:** El sistema debe permitir al usuario inspeccionar y ajustar propiedades simplificadas de los nodos colocados en la arquitectura.
* **Criterios de Aceptación:**
  * Permite seleccionar un nodo en el canvas para ver su función.
  * Permite ajustar parámetros arquitectónicos de alto nivel cuando el desafío lo requiera (ej. indicar si RDS es Multi-AZ o si EC2 está dentro de un Auto Scaling Group).

#### RF-09: Control de Estado del Canvas
* **Descripción:** El sistema debe ofrecer controles para gestionar el estado del trabajo en el canvas.
* **Criterios de Aceptación:**
  * Permite reiniciar/limpiar el canvas para comenzar desde cero.
  * En la modalidad *Fix the Architecture*, permite restablecer el canvas a la arquitectura inicial con errores.

---

### Módulo 3: Sistema de Pistas (Hint System)

#### RF-10: Revelación Secuencial de Pistas
* **Descripción:** El sistema debe ofrecer pistas progresivas a solicitud del usuario durante el desarrollo de un desafío.
* **Criterios de Aceptación:**
  * Las pistas se entregan de forma ordenada y secuencial (Pista 1 $\rightarrow$ Pista 2 $\rightarrow$ Pista 3).
  * No es posible revelar una pista avanzada sin haber desbloqueado previamente la anterior.

#### RF-11: Formato Educativo de Pistas
* **Descripción:** El contenido de las pistas debe estar diseñado para guiar el razonamiento arquitectónico sin entregar directamente la respuesta completa.
* **Criterios de Aceptación:**
  * Las primeras pistas sugieren preguntas o conceptos a considerar.
  * Las últimas pistas ofrecen sugerencias más concretas sobre tipos de servicio o patrones.

#### RF-12: Impacto del Uso de Pistas en la Puntuación
* **Descripción:** El sistema debe registrar las pistas utilizadas para calcular el impacto correspondiente en la calificación final.
* **Criterios de Aceptación:**
  * Cada pista revelada aplica una penalización configurable sobre el puntaje final del desafío.
  * El sistema advierte al usuario sobre la penalización de puntaje antes de revelar una pista.

---

### Módulo 4: Motor de Evaluación y Retroalimentación Educativa

#### RF-13: Envío y Validación de la Solución
* **Descripción:** El sistema debe proveer una acción explícita para enviar la arquitectura armada y solicitar su evaluación.
* **Criterios de Aceptación:**
  * Dispone de un botón visible "Enviar solución" en la interfaz del desafío.
  * Valida la arquitectura actual del canvas procesando componentes, conexiones y parámetros configurados frente a las reglas definidas para el desafío.

#### RF-14: Evaluación de Criterios y Errores Arquitectónicos
* **Descripción:** El motor de evaluación debe realizar un desglose cualitativo y cuantitativo de la solución presentada.
* **Criterios de Aceptación:**
  * Evalúa presencia de servicios requeridos, servicios faltantes y servicios innecesarios/distractores.
  * Evalúa la corrección de las relaciones y conexiones entre componentes.
  * Detecta problemas arquitectónicos específicos (ej. Single Point of Failure, exposición pública no deseada de bases de datos, falta de escalabilidad o redundancia).

#### RF-15: Retroalimentación Explicativa de Conceptos AWS
* **Descripción:** El sistema debe explicar **por qué** cada aspecto de la solución es correcto o incorrecto, vinculándolo a conceptos de AWS.
* **Criterios de Aceptación:**
  * Presenta un desglose detallado con ítems aprobados y fallados.
  * Cada ítem fallado incluye un mensaje educativo que explica la buena práctica o concepto AWS involucrado (ej. *"Tu arquitectura usa una sola instancia EC2, lo que genera un Single Point of Failure..."*).

#### RF-16: Ciclo de Reintento y Aprendizaje
* **Descripción:** El sistema debe permitir al usuario ajustar su diseño y reintentar la solución tras analizar la retroalimentación.
* **Criterios de Aceptación:**
  * Tras mostrar los resultados, el usuario puede retornar al canvas conservando su intento anterior para corregirlo.
  * Permite realizar múltiples envíos hasta alcanzar la solución satisfactoria.

---

### Módulo 5: Puntuación y Progresión del Usuario

#### RF-17: Cálculo de Puntuación de Desafío
* **Descripción:** El sistema debe calcular un puntaje numérico (de 0 a 100) tras evaluar el intento del usuario en un desafío.
* **Criterios de Aceptación:**
  * El puntaje premia el cumplimiento de requisitos y la corrección de la arquitectura.
  * Descuenta puntos por servicios innecesarios, fallos de arquitectura y uso de pistas.

#### RF-18: Registro del Estado de Progreso del Usuario
* **Descripción:** El sistema debe guardar el estado de resolución y la calificación máxima alcanzada por el usuario en cada desafío.
* **Criterios de Aceptación:**
  * Almacena el estado de cada desafío (*No intentado*, *En progreso*, *Completado*).
  * Mantiene el récord de la mejor puntuación obtenida por el usuario en cada desafío.

#### RF-19: Acumulación de Experiencia (XP) y Nivel de Usuario
* **Descripción:** El sistema debe otorgar puntos de experiencia (XP) al usuario según su desempeño en los desafíos.
* **Criterios de Aceptación:**
  * Otorga XP en función de la puntuación obtenida al completar un desafío.
  * Muestra el nivel actual del usuario según la suma de XP acumulada.

#### RF-20: Gestión de Sesión y Modo Invitado (Guest Mode)
* **Descripción:** El sistema debe permitir el acceso inmediato mediante sesión de invitado anónima y soportar el registro/login posterior con migración de progreso.
* **Criterios de Aceptación:**
  * Permite interactuar con los desafíos y canvas inmediatamente como invitado (`isGuest: true`) sin exigir formulario de registro previo.
  * Permite registrar una cuenta permanente (email/password o Google OAuth) y transferir automáticamente el récord, historial y XP acumulados como invitado a la cuenta registrada.

---

### Módulo 6: Extensibilidad de Contenido

#### RF-21: Estructura Declarativa de Desafíos
* **Descripción:** El sistema debe soportar la definición de unidades y desafíos mediante estructuras de datos estandarizadas y declarativas.
* **Criterios de Aceptación:**
  * La definición de un desafío abarca: caso/problema, requisitos, servicios habilitados, reglas de validación, solución de referencia, pistas progresivas, explicaciones pedagógicas y XP a otorgar.

#### RF-22: Carga Dinámica de Nuevos Desafíos
* **Descripción:** El sistema debe poder interpretar y renderizar nuevos desafíos y unidades de aprendizaje sin requerir cambios en el código principal de la aplicación.
* **Criterios de Aceptación:**
  * Al añadir una nueva definición de desafío válida, la interfaz lo muestra automáticamente en el catálogo correspondiente y habilita su evaluación.

---

## 4. Matriz de Verificación y Trazabilidad (Cumplimiento de Objetivos)

Esta sección verifica que los Requisitos Funcionales definidos cumplen plenamente con la visión y objetivos establecidos en `01-product-requeriments.md`:

| Objetivo del Producto (`01-product-requeriments.md`) | Requisitos Funcionales Asociados | Estado de Cobertura |
| :--- | :--- | :--- |
| **Aprender AWS resolviendo casos prácticos reales** | RF-01, RF-02, RF-03 | Cubierto |
| **Construcción visual e interactiva de arquitecturas** | RF-05, RF-06, RF-07, RF-08, RF-09 | Cubierto |
| **Orientar el razonamiento mediante pistas graduadas** | RF-10, RF-11, RF-12 | Cubierto |
| **Evaluación cuantitativa y retroalimentación pedagógica** | RF-13, RF-14, RF-15, RF-16 | Cubierto |
| **Experiencia gamificada y progresión de aprendizaje** | RF-04, RF-17, RF-18, RF-19, RF-20 | Cubierto |
| **Ampliar catálogo de desafíos fácilmente** | RF-21, RF-22 | Cubierto |

---





