'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Admin',
        apellido: 'Inicial',
        fechaNacimiento: '1980-01-01',
        avatarUrl: 'https://example.com/admin.jpg',
        email: 'admin@desapp.com',
        password: 'hashed_admin_password',
        rol: 'administrador',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', { rol: 'administrador' }, {});
  },
};
