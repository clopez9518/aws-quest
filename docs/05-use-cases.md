# Casos de Uso - AWS Architecture Quest

## 1. Introducción y Alcance
Este documento detalla los Casos de Uso (CU) principales para la plataforma **AWS Architecture Quest**. 
Define las interacciones clave entre el usuario (aprendiz de AWS) y el sistema, garantizando la trazabilidad con los Requisitos Funcionales (RF), Requisitos No Funcionales (RNF) y Reglas de Negocio (RN) previamente especificados.

---

## 2. Indice de Casos de Uso
* **CU-01:** Explorar Catálogo de Unidades y Desafíos
* **CU-02:** Seleccionar e Iniciar un Desafío
* **CU-03:** Diseñar Arquitectura en el Canvas (Drag & Drop)
* **CU-04:** Solicitar Pista Educativa
* **CU-05:** Enviar y Evaluar Solución de Arquitectura
* **CU-06:** Reiniciar o Restablecer Canvas
* **CU-07:** Configurar Política de Accesibilidad al Contenido
* **CU-08:** Registrarse o Iniciar Sesión (Migración de Progreso)

---

## 3. Especificación Detallada de Casos de Uso

### CU-01: Explorar Catálogo de Unidades y Desafíos

* **Actor Principal:** Usuario / Aprendiz de AWS (autenticado o en Modo Invitado).
* **Descripción:** El usuario navega por las unidades de aprendizaje temáticas y consulta los desafíos disponibles, su nivel de dificultad y su estado de avance.
* **Precondiciones:** La aplicación web está iniciada y cargada en el navegador.
* **Postcondiciones:** El usuario visualiza el catálogo de unidades y la lista de desafíos filtrados según la política de acceso activa.
* **Flujo Principal:**
  1. El usuario ingresa a la pantalla principal de la aplicación.
  2. El sistema consulta la política de accesibilidad activa (Modo Libre o Modo Progresivo).
  3. El sistema muestra la lista de unidades temáticas (IAM, EC2, Escalabilidad, RDS, etc.).
  4. El usuario selecciona una unidad temática.
  5. El sistema despliega la lista de desafíos de la unidad indicando título, nivel de dificultad (Fácil, Intermedio, Difícil, Integrador), modalidad y estado de progreso (No iniciado, En progreso, Completado, Récord de puntuación).
* **Flujos Alternativos / Excepciones:**
  * **3a. Modo Progresivo activo:** Si la política activa es Modo Progresivo, los desafíos cuyos prerrequisitos o XP mínima no hayan sido alcanzados se muestran deshabilitados con un icono de candado.
  * **3b. Modo Libre activo:** Si la política activa es Modo Libre, todos los desafíos se muestran habilitados para acceso directo.
* **Trazabilidad:** RF-01, RF-04, RN-01.

---

### CU-02: Seleccionar e Iniciar un Desafío

* **Actor Principal:** Usuario / Aprendiz de AWS.
* **Descripción:** El usuario selecciona un desafío disponible para acceder al área de trabajo y revisar la información contextual del problema a resolver.
* **Precondiciones:** El desafío seleccionado está disponible/desbloqueado en el catálogo.
* **Postcondiciones:** El área de trabajo se inicializa con la descripción del caso, los requisitos técnicos, las restricciones y el catálogo de servicios AWS permitidos.
* **Flujo Principal:**
  1. El usuario hace clic sobre un desafío disponible en el catálogo.
  2. El sistema carga la vista del escenario y presenta el panel de contexto del problema (caso prático, requisitos funcionales/técnicos y restricciones).
  3. El sistema carga el catálogo filtrado de servicios AWS disponibles para ese desafío en el panel lateral.
  4. El sistema inicializa el canvas de trabajo visual.
* **Flujos Alternativos / Excepciones:**
  * **4a. Modalidad "Fix the Architecture":** En lugar de un canvas en blanco, el sistema carga una arquitectura preexistente con errores para que el usuario la inspeccione y modifique.
* **Trazabilidad:** RF-02, RF-03, RN-03.

---

### CU-03: Diseñar Arquitectura en el Canvas (Drag & Drop)

* **Actor Principal:** Usuario / Aprendiz de AWS.
* **Descripción:** El usuario interactúa con la interfaz visual para construir su propuesta de arquitectura agregando, posicionando, conectando y configurando componentes de AWS.
* **Precondiciones:** El usuario se encuentra dentro de un desafío activo.
* **Postcondiciones:** La arquitectura en el canvas se actualiza reflejando los nodos agregados, sus conexiones y parámetros configurados.
* **Flujo Principal:**
  1. El usuario selecciona un servicio AWS desde el panel de disponibilidad y lo arrastra (Drag & Drop) hacia el canvas.
  2. El sistema valida que no se supere el límite de instancias del servicio y renderiza el componente en la posición elegida.
  3. El usuario conecta dos componentes trazando una línea entre ellos.
  4. El sistema valida la coherencia básica de la conexión y establece la relación visual.
  5. El usuario hace clic en un componente para abrir el panel de inspección y ajustar parámetros de alto nivel (ej. habilitar Multi-AZ o Auto Scaling Group).
  6. El sistema guarda la configuración local del componente en el estado transitorio de la sesión.
* **Flujos Alternativos / Excepciones:**
  * **2a. Límite de instancias alcanzado:** Si el usuario intenta agregar un componente que supera el límite permitido en el desafío, el sistema rechaza la acción e informa el límite (RN-04).
  * **4a. Conexión arquitectónicamente inválida:** Si la conexión entre dos nodos no es válida según el modelo de AWS, el sistema muestra un indicador visual de advertencia (RN-05).
  * **5a. Eliminación de componente/conexión:** El usuario selecciona un componente o conexión existente y presiona eliminar; el sistema lo remueve del canvas.
* **Trazabilidad:** RF-05, RF-06, RF-07, RF-08, RNF-01, RN-04, RN-05.

---

### CU-04: Solicitar Pista Educativa

* **Actor Principal:** Usuario / Aprendiz de AWS.
* **Descripción:** El usuario solicita orientación cuando enfrenta dificultades en la resolución del desafío.
* **Precondiciones:** El usuario está en un desafío activo que cuenta con pistas disponibles sin revelar.
* **Postcondiciones:** El sistema muestra la siguiente pista en la secuencia y registra la penalización en el puntaje del intento.
* **Flujo Principal:**
  1. El usuario presiona el botón "Solicitar Pista".
  2. El sistema muestra un mensaje de confirmación indicando el número de pista (ej. Pista 1 de 3) y la penalización de puntaje que se aplicará en el intento (ej. -5 puntos).
  3. El usuario confirma la solicitud.
  4. El sistema descuenta el puntaje correspondiente y despliega el texto de la pista en el panel lateral.
* **Flujos Alternativos / Excepciones:**
  * **1a. Sin más pistas disponibles:** Si el usuario ya reveló todas las pistas del desafío, el botón "Solicitar Pista" se muestra deshabilitado.
  * **3a. Cancelación del usuario:** Si el usuario cancela en el diálogo de confirmación, el sistema no revela la pista ni aplica penalizaciones.
* **Trazabilidad:** RF-10, RF-11, RF-12, RN-06, RN-07.

---

### CU-05: Enviar y Evaluar Solución de Arquitectura

* **Actor Principal:** Usuario / Aprendiz de AWS (autenticado o en Modo Invitado).
* **Descripción:** El usuario envía su arquitectura diseñada para someterla al motor de evaluación y recibir su calificación con retroalimentación pedagógica.
* **Precondiciones:** El canvas contiene al menos un componente agregado.
* **Postcondiciones:** El sistema calcula la puntuación final (0-100), presenta el reporte explicativo de aciertos/errores y actualiza el récord/XP del usuario si corresponde.
* **Flujo Principal:**
  1. El usuario presiona el botón "Enviar solución".
  2. El sistema bloquea temporalmente el canvas y envía el estado de la arquitectura al motor de evaluación.
  3. El motor de evaluación analiza los componentes presentes, ausentes, innecesarios, conexiones y configuraciones frente a las reglas del desafío.
  4. El sistema calcula la nota final aplicando penalizaciones por errores, servicios innecesarios y pistas utilizadas.
  5. El sistema presenta una pantalla modal de resultados con:
     * Puntuación obtenida (0 a 100).
     * Desglose de ítems aprobados y fallados.
     * Explicaciones teóricas pedagógicas para cada error (ej. explicación de Single Point of Failure).
  6. Si la nota es $\ge 70$, el sistema marca el desafío como *Completado*.
  7. Si la nota es un nuevo récord personal, el sistema actualiza la calificación guardada y otorga la XP correspondiente.
* **Flujos Alternativos / Excepciones:**
  * **6a. Desafío no aprobado (nota < 70):** El sistema indica que el intento no fue suficiente para aprobar, muestra las recomendaciones educativas y ofrece la opción de "Reintentar". No se otorga XP por intentos fallidos.
* **Trazabilidad:** RF-13, RF-14, RF-15, RF-17, RF-18, RF-19, RNF-02, RN-02, RN-08, RN-09, RN-10, RN-12.

---

### CU-06: Reiniciar o Restablecer Canvas

* **Actor Principal:** Usuario / Aprendiz de AWS.
* **Descripción:** El usuario limpia el canvas o lo restablece a su estado inicial para comenzar un nuevo enfoque de solución.
* **Precondiciones:** El usuario está en un desafío activo con componentes en el canvas.
* **Postcondiciones:** El canvas vuelve al estado inicial del desafío sin afectar la calificación récord histórica guardada.
* **Flujo Principal:**
  1. El usuario presiona el botón "Reiniciar Canvas".
  2. El sistema solicita confirmación mediante un diálogo emergente.
  3. El usuario confirma el reinicio.
  4. El sistema remueve todos los elementos agregados y restablece el canvas al estado inicial del ejercicio (vacío o con la arquitectura con fallos inicial).
* **Flujos Alternativos / Excepciones:**
  * **3a. Cancelación:** El usuario cancela la acción y el canvas mantiene su estado actual.
* **Trazabilidad:** RF-09, RN-11.

---

### CU-07: Configurar Política de Accesibilidad al Contenido

* **Actor Principal:** Usuario / Administrador.
* **Descripción:** Permite cambiar la modalidad de acceso a los desafíos entre *Modo Libre (Open Access)* y *Modo Progresivo*.
* **Precondiciones:** El usuario se encuentra en el panel de configuración de la plataforma.
* **Postcondiciones:** El sistema actualiza las reglas de disponibilidad en el catálogo de desafíos según la política elegida.
* **Flujo Principal:**
  1. El usuario o administrador accede a la sección de configuración de la experiencia.
  2. El sistema muestra la opción de política de acceso actual.
  3. El usuario selecciona la modalidad deseada (*Modo Libre* o *Modo Progresivo*).
  4. El sistema guarda la preferencia y actualiza la disponibilidad en el catálogo de unidades y desafíos de forma inmediata.
* **Trazabilidad:** RF-04, RN-01.

---

### CU-08: Registrarse o Iniciar Sesión (Migración de Progreso)

* **Actor Principal:** Usuario / Invitado.
* **Descripción:** El usuario en Modo Invitado decide crear una cuenta o autenticarse, y el sistema transfiere su progreso anónimo a su cuenta registrada permanente.
* **Precondiciones:** El usuario ha realizado actividades o completado desafíos en Modo Invitado (`isGuest: true`).
* **Postcondiciones:** El progreso anónimo, récords de puntuación y XP acumulados quedan vinculados a la cuenta registrada del usuario (`isGuest: false`).
* **Flujo Principal:**
  1. El usuario hace clic en "Guardar progreso" o "Iniciar Sesión / Registrarse".
  2. El sistema despliega el formulario de autenticación (Email/Password o Google OAuth).
  3. El usuario completa el registro o autenticación exitosamente.
  4. El sistema ejecuta una transacción que asocia los registros de `UserProgress` y `ChallengeAttempt` de la sesión anónima al usuario autenticado.
  5. El sistema actualiza el estado de la sesión, mostrando su nombre, nivel y XP conservados.
* **Flujos Alternativos / Excepciones:**
  * **3a. Error de credenciales:** El sistema informa el error y mantiene al usuario en Modo Invitado sin perder su estado local.
* **Trazabilidad:** RF-20, RN-13.

---

## 4. Matriz de Verificación y Cobertura de Casos de Uso

Esta matriz demuestra que los Casos de Uso cubren las acciones más relevantes del sistema y satisfacen los objetivos pedagógicos definidos en `01-product-requeriments.md`:

| Objetivo del Proyecto | Casos de Uso Asociados | Cobertura |
| :--- | :--- | :--- |
| **Explorar contenido y seleccionar desafíos** | CU-01, CU-02 | Completa |
| **Diseño práctico e interactivo de arquitecturas** | CU-03, CU-06 | Completa |
| **Asistencia guiada mediante pistas** | CU-04 | Completa |
| **Evaluación y retroalimentación formativa** | CU-05 | Completa |
| **Flexibilidad de accesibilidad (Libre vs. Progresivo)** | CU-07 | Completa |
| **Persistencia segura y adopción sin fricción (Modo Invitado)** | CU-08 | Completa |

---
