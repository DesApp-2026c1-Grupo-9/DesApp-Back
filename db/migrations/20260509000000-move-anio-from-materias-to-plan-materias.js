'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PlanMaterias', 'anio', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "PlanMaterias" pm
      SET "anio" = m."anio"
      FROM "Materias" m
      WHERE pm."materiaId" = m."id"
    `);

    await queryInterface.removeColumn('Materias', 'anio');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Materias', 'anio', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Materias" m
      SET "anio" = pm."anio"
      FROM "PlanMaterias" pm
      WHERE pm."materiaId" = m."id"
    `);

    await queryInterface.removeColumn('PlanMaterias', 'anio');
  },
};
