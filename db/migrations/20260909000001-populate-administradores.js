'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usuarios = await queryInterface.sequelize.query(
      `SELECT id FROM "Usuarios" WHERE rol = 'administrador'`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (usuarios.length > 0) {
      const records = usuarios.map((u) => ({
        usuarioId: u.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('Administradores', records);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Administradores', null, {});
  },
};
