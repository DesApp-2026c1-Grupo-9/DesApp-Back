'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_Denuncias_estado\" ADD VALUE IF NOT EXISTS 'revocada'"
    );
  },

  down: async (queryInterface, Sequelize) => {
  },
};
