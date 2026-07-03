'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Limpiar tabla antes de insertar
    await queryInterface.bulkDelete('Conexiones', null, {});

    // Obtener IDs de estudiantes
    const usuarios = await queryInterface.sequelize.query(
      'SELECT e.id FROM "Estudiantes" e INNER JOIN "Usuarios" u ON e."usuarioId" = u.id WHERE u.rol = \'estudiante\' ORDER BY e.id LIMIT 6;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (usuarios.length < 6) {
      console.log('No hay suficientes estudiantes para crear conexiones');
      return;
    }

    const ids = usuarios.map((u) => u.id);

    await queryInterface.bulkInsert('Conexiones', [
      {
        usuarioId: ids[0],
        contactoId: ids[1],
        estado: 'aceptada',
        createdAt: now,
        updatedAt: now,
      },
      {
        usuarioId: ids[0],
        contactoId: ids[2],
        estado: 'aceptada',
        createdAt: now,
        updatedAt: now,
      },
      {
        usuarioId: ids[1],
        contactoId: ids[2],
        estado: 'aceptada',
        createdAt: now,
        updatedAt: now,
      },
      {
        usuarioId: ids[3],
        contactoId: ids[0],
        estado: 'pendiente',
        createdAt: now,
        updatedAt: now,
      },
      {
        usuarioId: ids[4],
        contactoId: ids[1],
        estado: 'pendiente',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Conexiones', null, {});
  },
};
