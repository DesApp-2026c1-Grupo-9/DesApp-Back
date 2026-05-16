'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE "PreferenciasEstudiante"
      SET "visibleEnDescubrir" = true
      WHERE "visibleEnDescubrir" IS NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
  },
};