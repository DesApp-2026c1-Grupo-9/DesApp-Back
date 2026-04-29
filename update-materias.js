const { Sequelize } = require('sequelize');
const config = require('./lib/config/config').db;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
});

async function update() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const [result] = await sequelize.query(`
      UPDATE "Materias"
      SET "cargaHoraria" = CASE
        WHEN nombre = 'Matemática I' THEN 128
        WHEN nombre = 'Programación I' THEN 128
        WHEN nombre = 'Matemática II' THEN 128
        WHEN nombre = 'Programación II' THEN 128
        WHEN nombre = 'Algoritmos' THEN 64
      END
      WHERE nombre IN ('Matemática I', 'Programación I', 'Matemática II', 'Programación II', 'Algoritmos')
    `);
    console.log('Updated rows:', result);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

update();
