const { Sequelize, DataTypes } = require('sequelize');
const config = require('./lib/config/config').db;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: console.log,
});

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if data already exists
    const [carreras] = await sequelize.query('SELECT COUNT(*) as count FROM "Carreras"');
    if (carreras[0].count > 0) {
      console.log('Data already exists, skipping seed');
      return;
    }

    // Insert Carrera
    const [carreraResult] = await sequelize.query(`
      INSERT INTO "Carreras" (nombre, titulo, instituto, duracion, "createdAt", "updatedAt")
      VALUES ('Ingeniería en Computación', 'Ingeniero en Computación', 'Universidad de Hurlingham', 5, NOW(), NOW())
      RETURNING id
    `);
    const carreraId = carreraResult[0].id;
    console.log('Created Carrera with id:', carreraId);

    // Insert PlanDeEstudio
    const [planResult] = await sequelize.query(`
      INSERT INTO "PlanesDeEstudio" (nombre, estado, "carreraId", "createdAt", "updatedAt")
      VALUES ('Plan 2023', 'vigente', ${carreraId}, NOW(), NOW())
      RETURNING id
    `);
    const planId = planResult[0].id;
    console.log('Created Plan with id:', planId);

    // Insert Materias with cargaHoraria
    const materias = [
      { nombre: 'Matemática I', anio: 1, tipo: 'anual', cargaHoraria: 128 },
      { nombre: 'Programación I', anio: 1, tipo: 'anual', cargaHoraria: 128 },
      { nombre: 'Matemática II', anio: 2, tipo: 'anual', cargaHoraria: 128 },
      { nombre: 'Programación II', anio: 2, tipo: 'anual', cargaHoraria: 128 },
      { nombre: 'Algoritmos', anio: 2, tipo: 'cuatrimestral', cargaHoraria: 64 },
    ];

    for (const materia of materias) {
      const [result] = await sequelize.query(`
        INSERT INTO "Materias" (nombre, anio, tipo, "cargaHoraria", "createdAt", "updatedAt")
        VALUES ('${materia.nombre}', ${materia.anio}, '${materia.tipo}', ${materia.cargaHoraria}, NOW(), NOW())
        RETURNING id
      `);
      materia.id = result[0].id;
      console.log(`Created Materia: ${materia.nombre} with id: ${materia.id}`);
    }

    // Insert PlanMateria (junction table)
    for (const materia of materias) {
      await sequelize.query(`
        INSERT INTO "PlanMaterias" ("planId", "materiaId", "createdAt", "updatedAt")
        VALUES (${planId}, ${materia.id}, NOW(), NOW())
      `);
    }
    console.log('Created PlanMateria entries');

    // Insert Correlatividades
    const programacionI = materias.find(m => m.nombre === 'Programación I');
    const programacionII = materias.find(m => m.nombre === 'Programación II');
    const matematicaI = materias.find(m => m.nombre === 'Matemática I');
    const matematicaII = materias.find(m => m.nombre === 'Matemática II');

    await sequelize.query(`
      INSERT INTO "Correlatividades" ("materiaId", "prerrequisitoId", "createdAt", "updatedAt")
      VALUES (${programacionII.id}, ${programacionI.id}, NOW(), NOW()),
             (${matematicaII.id}, ${matematicaI.id}, NOW(), NOW())
    `);
    console.log('Created Correlatividades');

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await sequelize.close();
  }
}

seed();
