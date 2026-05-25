'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar de CarreraMaterias las materias viejas que ya no están en PlanMaterias
    await queryInterface.sequelize.query(`
      DELETE FROM "CarreraMaterias"
      WHERE "materiaId" IN (
        SELECT id FROM "Materias" WHERE nombre IN ('Programación I', 'Programación II')
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {},
};
