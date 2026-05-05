'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero limpiar avatarUrl de usuarios existentes si los hay
    await queryInterface.sequelize.query(
      'UPDATE "Usuarios" SET "avatarUrl" = NULL WHERE "avatarUrl" IS NOT NULL;'
    );

    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Juana',
        apellido: 'Azurduy',
        fechaNacimiento: '1780-07-12',
        avatarUrl: null,
        email: 'juana.azurduy@example.com',
        password: 'hashedpassword',
        rol: 'estudiante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'José',
        apellido: 'Artigas',
        fechaNacimiento: '1764-06-19',
        avatarUrl: null,
        email: 'jose.artigas@example.com',
        password: 'hashedpassword',
        rol: 'estudiante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Simón',
        apellido: 'Bolívar',
        fechaNacimiento: '1783-04-24',
        avatarUrl: null,
        email: 'simon.bolivar@example.com',
        password: 'hashedpassword',
        rol: 'estudiante',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', null, {});
  },
};
