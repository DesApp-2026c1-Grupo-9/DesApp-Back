'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Estudiantes', 'perfilPublico');
    await queryInterface.removeColumn('Estudiantes', 'mostrarEmail');
    await queryInterface.removeColumn('Estudiantes', 'mostrarSituacionAcademica');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Estudiantes', 'perfilPublico', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('Estudiantes', 'mostrarEmail', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('Estudiantes', 'mostrarSituacionAcademica', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};