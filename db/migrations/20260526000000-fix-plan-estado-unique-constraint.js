'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'PlanesDeEstudio',
      'unique_plan_carrera_estado'
    );
    // Partial unique index: solo un plan vigente por carrera,
    // pero múltiples transición/discontinuado
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX "unique_plan_vigente_por_carrera"
      ON "PlanesDeEstudio" ("carreraId")
      WHERE "estado" = 'vigente'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "unique_plan_vigente_por_carrera"
    `);
    await queryInterface.addConstraint('PlanesDeEstudio', {
      type: 'unique',
      fields: ['carreraId', 'estado'],
      name: 'unique_plan_carrera_estado',
    });
  },
};
