# Trabajo Práctico: Sistema de Acompañamiento de Alumnos Universitarios

## Descripción General

Desarrollar una aplicación web para acompañar a alumnos universitarios en la planificación de su trayectoria académica y en la organización de actividades de estudio colaborativas, combinando gestión académica, recomendaciones inteligentes de cursada y funcionalidades sociales para promover el aprendizaje colaborativo.

### 1. Gestión de Usuarios
Existen dos categorías de usuarios:

Estudiantes: usuarios que gestionan su foja académica, planifican cursadas, participan en sesiones de estudio y comparten materiales
Administradores: usuarios con permisos para configurar carreras, planes de estudio, moderar contenidos denunciados y gestionar parámetros globales del sistema. También pueden ver todas las cuentas, y suspender/reactivar cuentas de estudiantes.
La aplicación nace con un administrador inicial. Los administradores dan de alta otros administradores. Los estudiantes se inscriben autónomamente.

### 2. Configuración Académica (Administrativos)

#### 2.1 Gestión de Carreras
Los usuarios administradores pueden crear y mantener carreras universitarias, definiendo:

* Nombre de la carrera
* Título que otorga
* Instituto.
* Duración estimada (en años)

A su vez cada carrera puede tener uno o varios planes de estudio. Para cada plan definir:

* Un nombre, por ejemplo: Plan 2015, Plan 2020, Plan 2023.
* Estado del plan: Vigente, En transición, Discontinuado

#### 2.2 Configuración del Plan de Estudios

Para cada plan de estudios, los administrativos cargan las materias que lo conforman. En particular, es importante registrar a qué año se asocia cada materia, y si es anual o cuatrimestral. También hay que incluir las condiciones respecto de materias Unahur, niveles de inglés y créditos, y las materias optativas que pueden servir para dar créditos.

La definición de un plan incluye las correlatividades, o sea qué materias son requisitos para poder cursar otra materia.

### 3. Gestión de situación académica
Cada estudiante carga su situación académica inicial en la aplicación, o sea, qué materias tiene aprobadas y cuáles regularizadas, incluyendo el año/cuatrimestre. Incluir también las eventuales actividades por las que hubiera recibido créditos.
Para la carga inicial hay que dar dos opciones: manual o desde Excel. En el caso de Excel, hay que mostrar los eventuales errores en la planilla que se sube, y también hacer un preview y permitir que el estudiante haga correcciones antes de confirmar.

Hay que permitir que a principio de cada cuatrimestre un estudiante registre qué materias va a cursar, y a fin de cuatrimestre cómo le fue. También conviene registrar las presentaciones a finales.

A partir de esta información la aplicación puede hacer varios análisis, que se describen en el punto que sigue.

### 4. Asistente Académico
#### 4.1 Análisis de Situación Actual
El sistema provee los siguientes análisis a los usuarios estudiantes, a partir de los datos de situación académica.

* Materias en las que puede inscribirse.
* Finales pendientes, indicando cantidad de intentos previos y cuándo se vence la regularidad.
* Plus: filtro en las materias en las que puede inscribirse de acuerdo a la oferta académica, para eso los administradores tienen que cargar la oferta académica de cada período, esto se agregaría a lo indicado en el punto 3.
* Otras condiciones para recibirse: créditos faltantes, materias Unahur faltantes.
* Análisis por año de cursada: para cada año en la carrera, si está completo, y si no cuántas materias tiene aprobadas / regularizadas / faltantes (p.ej. de 6 materias de 3er año, aprobaste 2, regularizaste 1, te faltan 3, y así para cada año).
* Porcentaje de avance en la carrera.

#### 4.2 Proyecciones de Cursada
El sistema debe proyectar escenarios futuros:

**Análisis “¿Qué pasa si…?”**

O sea, responder a la pregunta “Si regularizo todas/algunas de las materias que estoy cursando, ¿a qué materias podré inscribirme el próximo cuatrimestre?”, mostrando las correlatividades que se desbloquean.

**Planificador de cursada**
A partir de una indicación de cantidad de horas que puede cursar por semana, la aplicación calcula un posible plan de cursada respetando correlatividades, incluyendo todos los períodos (cuatrimestres / años) hasta recibirse.
El estudiante, a partir de ver el plan que propone el sistema, puede realizar cambios “moviendo” las materias; la aplicación irá mostrando la carga horaria en cada cuatrimestre.

**Plus**

A medida que el estudiante va regularizando/aprobando materias, ir comparando el rendimiento del estudiante con el plan que se había planteado.
Permitir al estudiante guardar distintos planes.

### 5. Red Social Académica
#### 5.1 Perfil de Estudiante
Cada estudiante tiene un perfil configurable, que surge de sus datos personales, carrera/s que está cursando, la información acerca de su situación académica, y una foto que puede agregar.
El sistema proporciona dos opciones para la configuración de privacidad

* Perfil público: cualquier estudiante puede ver su información, con posibilidad de mostrar o no la dirección de email, y lo mismo para situación académica.
* Perfil privado: sólo contactos pueden ver detalles

#### 5.2 Sistema de Conexiones
Un estudiante puede invitar a otro para sumar a cada uno a la lista de contactos del otro.
Esto se hace enviando un mail desde la aplicación, indicando la dirección de correo a la que se envía una invitación.
Si esta dirección de correo corresponde a un usuario registrado, se envía un mail con un link de invitación. Usando este link, el destinatario puede aceptar o rechazar la invitación. Para esto tiene que estar logueado, si no lo está hay que proponer previamente el login.
Si la dirección del destinatario no corresponde a un usuario registrado, la aplicación le envía un mail al usuario que lanzó la invitación informando sobre este hecho.

Por otro lado, se tiene que ofrecer a un estudiante la posibilidad de visualizar y manejar sus contactos y las solicitudes pendientes de respuesta.

#### 5.3 Feed de Novedades
Los estudiantes pueden ver un feed con novedades de sus contactos: novedades académicas (materias a las que un contacto se inscribió, regularizó o aprobó), o posteos que puede generar cualquier usuario estudiante dentro de la aplicación.
A su vez, hay que permitir que cada estudiante elija, como parte de su perfil, si quiere que se publiquen sus eventos de inscripciones, regularizaciones y/o aprobaciones.

### 6. Sesiones de Estudio Colaborativo
Un estudiante puede proponer una sesión de estudio con:

* Materia asociada: a qué materia corresponde
* Tema específico: “Repaso para parcial”, “Resolución TP3”, “Consulta de dudas Unidad 5”
* Tipo:
    * Virtual: incluir link de videollamada (Zoom, Meet, Discord, etc.)
    * Presencial: indicar ubicación (ej: “Aula 305”, “Biblioteca central”, “Bar El Progreso”)
* Fecha y hora: día y horario de inicio
* Duración estimada: en horas y minutos.
* Cupos: cantidad máxima de participantes (opcional)
* Descripción: detalles adicionales sobre la sesión
* Necesidad de aprobar: si quien creó la sesión debe aprobar a cada participante o no.

Los otros estudiantes pueden sumarse a las sesiones a las que pueden acceder, que dependen del perfil de quien creó cada sesión: las sesiones que crea un estudiante con perfil público son accesibles para todos los estudiantes, las que crea un estudiante con perfil privado son accesibles sólo para sus contactos.
Incluir filtros que faciliten a un estudiante consultar qué sesiones hay disponibles.

Cuando un estudiante se inscribe a una sesión, si es aprobada por quien la creó (o no es necesaria la aprobación), quien se inscribe recibe un mail de confirmación con los detalles, obviamente hay que incluir la información que le permita sumarse.

Hay que prever que quien creó una sesión pueda ver sus detalles, editar o cancelar. Si se cancela, quienes se hubieran inscripto deben ser notificados.

El sistema envía recordatorios automáticos 24 horas antes de la sesión, incluyendo link/ubicación y detalles.

### 7. Repositorio de Materiales por Materia
#### 7.1 Publicación y consulta de materiales
Asociado a cada materia existe un repositorio donde los estudiantes pueden compartir materiales, que pueden ser

* Archivos: PDFs, documentos, presentaciones, imágenes
    * Tamaño máximo por archivo: 25 MB
    * Formatos permitidos: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, ZIP
* Links externos: enlaces a recursos útiles
    * YouTube (videos explicativos)
    * Google Drive / Dropbox (carpetas compartidas)
    * Sitios web educativos
    * Canales de Discord (destacados visualmente con icono especial y botón “Unirse”)
    * GitHub (repositorios de código)

Incluir la metadata que permita a los otros estudiantes buscar los materiales que les interesen, incluyendo tags/etiquetas.

Implementar también la funcionalidad necesaria para que cualquier estudiante pueda consultar los materiales publicados.

#### 7.2 Consulta y Sistema de Valoración
Los estudiantes pueden brindar una valoración sobre los materiales que consultan. Esta valoración es, sencillamente, un 👍 Pulgar arriba o 👎 Pulgar abajo.

En las búsquedas de materiales aparecen los totales y ratio (proporción de pulgares arriba) para cada material que se ve. También hay que permitir ordenar por valoración.

#### 7.3 Sistema de Denuncias
Los usuarios pueden denunciar contenido inapropiado, indicando el motivo que sale de una lista, a lo que se suma un texto para especificar detalles. Los posibles motivos son configurados por los administradores. Damos algunos ejemplos a título informativo:

* Contenido pornográfico o sexual explícito
* Lenguaje ofensivo o insultos
* Material protegido por derechos de autor
* Spam o publicidad engañosa
* Información incorrecta o engañosa

Considerar también una opción de “otro” motivo, que se especifica al generar la denuncia.

En las búsquedas de material, se tiene que mostrar si tiene denuncias pendientes o verificadas (ver punto siguiente). Un material que tenga más de N denuncias pendientes o más de M verificadas (p.ej. más de 10 denuncias pendientes o más de 3 verificadas) se considera suspendido, se pueden ver el título y otros metadatos, pero no acceder. Los valores de N y M son configurados por los administradores.

#### 7.4 Panel de Moderación (Administradores)
Los usuarios administradores evalúan las denuncias. Para ello deben poder acceder a los materiales denunciados, con el detalle de toda la información relevante para poder evaluar.
Los administradores pueden acceder a los materiales suspendidos. Incluir filtros relevantes para la búsqueda de materiales denunciados.
A partir de su evaluación, los administradores pueden confirmar o rechazar cada denuncia, notificando a quien publicó el material y a quien realizó la denuncia.

#### 7.5 Destacado Especial: Canales de Discord
Los links a canales de Discord que se cargan como materiales tienen un tratamiento especial.
En particular se debe considerar una visualización destacada: ícono distintivo, información adicional como nombre del servidor y descripción del canal, utilización de colores y estilos de Discord para mostrarlos.

### 8. Notificaciones
Prever una forma en la que cada estudiante pueda ver, dentro de la aplicación, las mismas notificaciones que recibe por email, respecto de vencimiento próximo de regularidad, eventos relacionados con sesiones, eventos relacionados con denuncia de materiales.

### 9. Reportes y Estadísticas para administrativos
Los administrativos pueden generar reportes:

**Reportes de uso del sistema:**

* Cantidad de usuarios activos
* Materias cursadas por alumno (5000 alumnos 1 materia, 15000 2 materias, etc)
* Materias aprobadas por alumno (idem anterior)
* Materias cursadas por carrera
* Materias aprobadas por carrera
* Materias con más materiales compartidos
* Sesiones de estudio creadas por período
* Materiales más valorados por materia
* Estadísticas de denuncias y moderación

**Reportes sociales:**
* Conexión entre estudiantes, o sea a cuántos estudiantes se conecta cada estudiante
* Utilización de las sesiones de estudio
* Carreras con comunidad más activa