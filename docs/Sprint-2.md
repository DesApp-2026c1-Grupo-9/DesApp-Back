## Sprint 2

## Miembro 1
* Implementación de administrador. Tenemos una base de api calls listas para crear materias, carreras, personas:
    * Backend: crear personas, carreras y materias
    * Frontend: panel de administrador para hacer las tareas del backend e inclusión del admin en el dropdown de selección de usuarios

## Miembro 2
* Mejoras en la UI
	* Creación de componentes reutilizables
	* Arreglar estilos
	* Creación de un theme consistente
	* Unificacion de logica repetida 
* Implementación real de repositorio de materiales. Actualmente está mockeado

## Miembro 3
* Implementación global del dropdown para selección de usuario: Actualmente el dropdown está implementado en: sesiones, feed y conexiones. Para este sprint el objetivo es que el dropdown sea un elemento común a todas las páginas y cambie el usuario/contexto en toda la app.
* Fallback en la UI cuando falle la conexión con el back: Actualemente cuando hay errores en diferentes api calls la UI puede romperse o dejar de responder. Es necesario implementar una lógica de manejo de respuestas inesperadas que muestre una página de error acorde.