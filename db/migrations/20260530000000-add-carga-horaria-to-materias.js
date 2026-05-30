'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Materias', 'cargaHoraria', {
      type: Sequelize.INTEGER,
      defaultValue: 6,
    });
    await queryInterface.sequelize.query(
      'UPDATE "Materias" SET "cargaHoraria" = 6 WHERE "cargaHoraria" IS NULL'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Materias', 'cargaHoraria');
  },
};
