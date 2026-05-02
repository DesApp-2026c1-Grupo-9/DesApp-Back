const { Sequelize } = require('sequelize');
const config = require('./lib/config/config');
const db = config.db;

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  logging: false,
});

async function addColumn() {
  try {
    await sequelize.query(
      'ALTER TABLE "Comentarios" ADD COLUMN IF NOT EXISTS "comentarioPadreId" INTEGER REFERENCES "Comentarios"(id) ON DELETE SET NULL;'
    );
    console.log('Columna comentarioPadreId agregada exitosamente');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

addColumn();
