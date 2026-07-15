# DesApp-Back — API del Sistema de Acompañamiento de Alumnos

Backend del proyecto **Sistema de Acompañamiento de Alumnos Universitarios** para la materia Desarrollo de Aplicaciones (UNahur).

## Stack

- Node.js + Express
- Sequelize + PostgreSQL
- Autenticación con JWT
- Cloudinary (almacenamiento de archivos)
- Jest + Supertest (tests)
- Docker Compose (base de datos)

## Estructura

- `lib/controllers/` — Lógica de negocio
- `lib/models/` — Modelos Sequelize
- `lib/routes/` — Definición de rutas
- `lib/middleware/` — Middlewares (auth, validación, etc.)
- `lib/config/` — Configuración de base de datos
- `db/migrations/` — Migraciones
- `db/seeders/` — Datos de prueba
- `test/` — Tests

## Configuración inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno base (base de datos)
cp .env.example .env.development

# 3. Crear .env.development.local con credenciales sensibles
#    (está en .gitignore, no se sube al repo)
```

Agregar al `.env.development.local`:

```env
# Cloudinary (subir archivos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Brevo / SMTP (envío de emails)
SMTP_PASS=tu_api_key_de_brevo
EMAIL_FROM=remitente@ejemplo.com

# Redirigir emails de notificación (opcional, útil en dev)
DEV_EMAIL_TO=destino@ejemplo.com

# JWT
JWT_SECRET=un-segredo-seguro
```

```bash
# 4. Migraciones y datos de prueba
npm run db:init
npm run db:seed

# 5. Levantar servidor
npm start

# 6. Correr tests
npm test
```
