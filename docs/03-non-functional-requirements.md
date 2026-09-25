# Requisitos No Funcionales - AWS Architecture Quest

## 1. Introducción y Alcance
Este documento especifica los Requisitos No Funcionales (RNF) para la plataforma **AWS Architecture Quest**. Define los atributos de calidad, rendimiento, usabilidad, mantenibilidad, portabilidad y seguridad necesarios para garantizar una experiencia educativa de alta calidad.

---

## 2. Estructura de Categorías No Funcionales
* **Categoría 1:** Rendimiento y Tiempo de Respuesta
* **Categoría 2:** Usabilidad y Experiencia de Usuario (UX/UI)
* **Categoría 3:** Arquitectura, Mantenibilidad y Extensibilidad
* **Categoría 4:** Portabilidad y Compatibilidad
* **Categoría 5:** Seguridad e Integridad

---

## 3. Especificación de Requisitos No Funcionales

### Categoría 1: Rendimiento y Tiempo de Respuesta

#### RNF-01: Fluidez de la Interfaz Visual (Drag & Drop)
* **Descripción:** La interacción con el canvas visual (arrastrar, soltar, conectar nodos) debe ejecutarse de forma fluida y sin retardo perceptible.
* **Criterios de Aceptación:**
  * Las interacciones Drag & Drop se renderizan a un ritmo sostenido (60 FPS ideales, mínimo 30 FPS en dispositivos de especificación estándar).
  * La latencia de respuesta visual al mover un objeto en pantalla es inferior a 50 ms.

#### RNF-02: Tiempo de Evaluación de Soluciones
* **Descripción:** El motor de evaluación debe procesar la arquitectura del usuario y retornar los resultados en un tiempo mínimo.
* **Criterios de Aceptación:**
  * La respuesta de evaluación (puntuación + explicaciones pedagógicas) se entrega en menos de 2 segundos tras presionar "Enviar solución".

#### RNF-03: Tiempo de Carga Inicial
* **Descripción:** La aplicación web debe cargar sus recursos iniciales de forma rápida.
* **Criterios de Aceptación:**
  * El tiempo de carga inicial de la aplicación (First Contentful Paint) no debe superar los 3 segundos en conexiones de banda ancha estándar.

---

### Categoría 2: Usabilidad y Experiencia de Usuario (UX/UI)

#### RNF-04: Diseño Adaptable (Responsive Layout)
* **Descripción:** La interfaz web debe ser funcional y legible en diferentes resoluciones de pantalla orientadas a escritorio y laptop.
* **Criterios de Aceptación:**
  * La pantalla del canvas y los paneles laterales se adaptan a resoluciones desde 1280x720px en adelante sin superposición de elementos ni pérdida de controles.

#### RNF-05: Iconografía y Claridad Visual Simplificada
* **Descripción:** La representación visual de los servicios AWS debe ser limpia y fácil de identificar para no saturar al usuario con detalles innecesarios.
* **Criterios de Aceptación:**
  * Uso de iconos oficiales o estandarizados de AWS en versión simplificada.
  * Contraste de colores accesible (cumpliendo pautas WCAG 2.1 nivel AA).

#### RNF-06: Feedback Visual Inmediato de Estado
* **Descripción:** El sistema debe comunicar claramente al usuario el estado de cada acción dentro de la interfaz.
* **Criterios de Aceptación:**
  * Indicadores visuales claros para: conexiones activas, nodos seleccionados, estado de carga durante la evaluación y mensajes de error/éxito.

---

### Categoría 3: Arquitectura, Mantenibilidad y Extensibilidad

#### RNF-07: Desacoplamiento entre Lógica de Evaluación e Interfaz
* **Descripción:** El motor de evaluación y las reglas del juego deben estar completamente desacoplados del componente de interfaz gráfica de usuario.
* **Criterios de Aceptación:**
  * La lógica de validación de arquitecturas se ejecuta de forma independiente de los componentes visuales del canvas.
  * Permite reutilizar las mismas reglas de evaluación ante un cambio de interfaz o la integración de nuevos clientes (ej. cliente móvil futuro).

#### RNF-08: Formato Declarativo Estándar de Contenido
* **Descripción:** La definición de desafíos, pistas, soluciones y mensajes pedagógicos debe almacenarse en un formato estructurado y estandarizado (ej. JSON o YAML).
* **Criterios de Aceptación:**
  * Añadir o editar un desafío no requiere modificar el código fuente de la plataforma.
  * La sintaxis del archivo de definición es validada contra un esquema estricto antes de su carga.

#### RNF-09: Modularidad de Servicios AWS
* **Descripción:** El catálogo de servicios de AWS en la plataforma debe construirse de forma modular.
* **Criterios de Aceptación:**
  * Incorporar un nuevo servicio de AWS (icono, propiedades básicas, categoría) requiere únicamente su registro en el catálogo modular sin afectar los servicios existentes.

---

### Categoría 4: Portabilidad y Compatibilidad

#### RNF-10: Compatibilidad Multi-Navegador
* **Descripción:** La aplicación web debe comportarse de forma idéntica en los navegadores web modernos de mayor uso.
* **Criterios de Aceptación:**
  * Soporte completo comprobado en las versiones recientes de Google Chrome, Mozilla Firefox, Microsoft Edge y Apple Safari.
  * La funcionalidad Drag & Drop opera de manera uniforme sin requerir plugins ni extensiones externas.

#### RNF-11: Preparación para Adaptación Móvil Futura
* **Descripción:** La estructura de componentes y el diseño de la aplicación deben contemplar la facilitación de una futura versión móvil (fuera del MVP).
* **Criterios de Aceptación:**
  * Las APIs y servicios internos responden de manera agnóstica al tipo de cliente visual.
  * La lógica de interacción evita dependencias exclusivas de periféricos de escritorio cuando sea factible.

---

### Categoría 5: Seguridad e Integridad

#### RNF-12: Integridad de Reglas de Evaluación
* **Descripción:** El proceso de evaluación y las respuestas esperadas deben estar resguardadas contra la manipulación directa desde la interfaz del usuario.
* **Criterios de Aceptación:**
  * Las condiciones de victoria y criterios de puntuación se ejecutan en un contexto aislado que evita que la solución sea manipulada mediante inspección del código cliente.

#### RNF-13: Persistencia y Consistencia del Progreso
* **Descripción:** El almacenamiento del estado y puntuación del usuario debe garantizar la consistencia de los datos acumulados.
* **Criterios de Aceptación:**
  * El puntaje y la XP ganada se guardan automáticamente tras completar cada desafío.
  * Ante una interrupción inesperada (cierre de pestaña o pérdida de conexión), el usuario no pierde el progreso de desafíos previamente completados.

---

## 4. Matriz de Verificación y Cumplimiento

Esta matriz valida que los Requisitos No Funcionales responden adecuadamente al objetivo del proyecto y garantizan una excelente experiencia de usuario:

| Objetivo / Experiencia de Usuario | Requisitos No Funcionales Aplicados | Estado de Verificación |
| :--- | :--- | :--- |
| **Experiencia visual interactiva y sin fricción** | RNF-01, RNF-04, RNF-05, RNF-06 | Cumplido |
| **Retroalimentación ágil durante la práctica** | RNF-02, RNF-03 | Cumplido |
| **Plataforma mantenible y fácil de expandir con nuevo contenido** | RNF-07, RNF-08, RNF-09 | Cumplido |
| **Acceso garantizado en diferentes navegadores y preparación móvil** | RNF-10, RNF-11 | Cumplido |
| **Confianza e integridad en el puntaje y progreso acumulado** | RNF-12, RNF-13 | Cumplido |

---


