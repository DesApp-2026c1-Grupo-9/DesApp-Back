'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('PreferenciasEstudiante', [
      {
        estudianteId: 1,
        publicarInscripciones: true,
        publicarRegularizaciones: true,
        publicarAprobaciones: true,
        perfilPublico: true,
        mostrarEmail: false,
        mostrarSituacionAcademica: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        estudianteId: 2,
        publicarInscripciones: true,
        publicarRegularizaciones: false,
        publicarAprobaciones: true,
        perfilPublico: false,
        mostrarEmail: false,
        mostrarSituacionAcademica: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        estudianteId: 3,
        publicarInscripciones: false,
        publicarRegularizaciones: false,
        publicarAprobaciones: false,
        perfilPublico: true,
        mostrarEmail: true,
        mostrarSituacionAcademica: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('PreferenciasEstudiante', null, {});
  },
};
