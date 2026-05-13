# Estándares Técnicos y Habilidades Consolidadas - Grupo 9

Este documento define las reglas de desarrollo, el stack tecnológico y la arquitectura de carpetas para el Sistema de Acompañamiento Estudiantil durante el Sprint 2.

## 1. Backend (Node.js + Sequelize + Postgres)

### Stack Tecnológico
* **Runtime**: Node.js v14.15.x.
* **Framework**: Express.js para la API REST.
* **ORM**: Sequelize v5.
* **Base de Datos**: PostgreSQL 12.5 (vía Docker).
* **Transpilador**: Babel para soporte de ES6+.

### Estructura de Directorios (Backend)
El código fuente reside en `/lib` para ser transpiliado a `/dist`.
```text
/
├── bin/                # Scripts de inicio (www.js)
├── lib/                # Código fuente original
│   ├── config/         # Configuración de DB y variables de entorno
│   ├── controllers/    # Manejo de Request/Response
│   ├── db/             # Migraciones, modelos y seeders de Sequelize
│   ├── middleware/     # Seguridad (Helmet, CORS) y validaciones
│   ├── routes/         # Definición de endpoints de la API
│   └── services/       # Lógica de negocio (ej. motor de correlatividades)
├── docker/             # Persistencia de datos de Postgres
└── docker-compose.yml  # Configuración del contenedor DB
```

## 2. Endpoints para Admin (Sprint 2)

### Carreras
* `GET /api/carreras` - Listar todas las carreras
* `POST /api/carreras` - Crear nueva carrera
* `GET /api/carreras/:id` - Ver carrera específica
* `PUT /api/carreras/:id` - Actualizar carrera
* `DELETE /api/carreras/:id` - Eliminar carrera

### Materias
* `GET /api/materias` - Listar todas las materias
* `POST /api/materias` - Crear nueva materia
* `GET /api/materias/:id` - Ver materia específica
* `PUT /api/materias/:id` - Actualizar materia
* `DELETE /api/materias/:id` - Eliminar materia

### Personas (Admin)
* `GET /api/usuarios` - Listar usuarios (con filtro por rol)
* `POST /api/usuarios` - Crear nuevo usuario (estudiante, docente, admin)
* `GET /api/usuarios/:id` - Ver usuario específico
* `PUT /api/usuarios/:id` - Actualizar usuario
* `DELETE /api/usuarios/:id` - Eliminar usuario

## 3. Validaciones de Negocio

### Tamaño de Archivos
* **Regla:** Los archivos subidos no pueden superar los 25MB.
* **Validación:** Siempre en backend, no confiar en validaciones del frontend.
* **Mensaje de error:** "El archivo excede el tamaño máximo permitido (25MB)".

### Links Externos
* Validar URLs de YouTube y Google Drive.
* Almacenar tipo de link para renderizado correcto en frontend.

## 4. Instrucciones Generales
1. **No Testing:** El agente no debe ejecutar pruebas. El usuario se encarga de verificar y testear la implementación.
2. **Contexto de Archivos:** Antes de escribir código, consulta siempre el archivo de la consigna completa y el archivo de división de tareas para no exceder el alcance del Sprint actual.
3. **Consistencia de Modelos:** Los modelos de Sequelize deben ser creados considerando las necesidades de los controladores de otras features.
4. **Validación Obligatoria:** El backend siempre debe validar las reglas de negocio independientemente de las validaciones del frontend.