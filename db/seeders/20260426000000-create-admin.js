'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Admin',
        apellido: 'Inicial',
        fechaNacimiento: '1980-01-01',
        avatarUrl: 'https://example.com/admin.jpg',
        email: 'admin@desapp.com',
        password: hashedPassword,
        rol: 'administrador',
        activo: true,
        genero: 'sin especificar',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const usuario = await queryInterface.sequelize.query(
      `SELECT id FROM "Usuarios" WHERE email = 'admin@desapp.com'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (usuario.length > 0) {
      await queryInterface.bulkInsert('Administradores', [
        {
          usuarioId: usuario[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Administradores', null, {});
    await queryInterface.bulkDelete('Usuarios', { rol: 'administrador' }, {});
  },
};
