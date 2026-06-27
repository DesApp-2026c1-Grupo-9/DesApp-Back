const { Sequelize } = require('sequelize');
const config = require('./lib/config/config');
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: false,
  }
);
(async () => {
  await sequelize.authenticate();
  const [mat] = await sequelize.query(
    `SELECT m.id, m.titulo, m."estudianteId", e.id as real_estudianteId, e."usuarioId", u.nombre, u.apellido FROM "Materiales" m LEFT JOIN "Estudiantes" e ON e.id = m."estudianteId" LEFT JOIN "Usuarios" u ON u.id = e."usuarioId" ORDER BY m.id`
  );
  console.log('=== MATERIALES ===');
  console.table(mat);
  const [users] = await sequelize.query(
    `SELECT u.id as usuario_id, u.nombre, u.apellido, e.id as estudiante_id FROM "Usuarios" u INNER JOIN "Estudiantes" e ON e."usuarioId" = u.id ORDER BY u.id`
  );
  console.log('=== USUARIOS / ESTUDIANTES ===');
  console.table(users);
  await sequelize.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
