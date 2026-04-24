# Estándares Técnicos y Habilidades Consolidadas - Grupo 9

Este documento define las reglas de desarrollo, el stack tecnológico y la arquitectura de carpetas para el Sistema de Acompañamiento Estudiantil durante el Sprint 1 (16/04/2026 - 07/05/2026).

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