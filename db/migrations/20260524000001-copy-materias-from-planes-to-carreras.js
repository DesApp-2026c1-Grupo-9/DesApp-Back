module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      INSERT INTO "CarreraMaterias" ("carreraId", "materiaId", "createdAt", "updatedAt")
      SELECT DISTINCT pe."carreraId", pm."materiaId", NOW(), NOW()
      FROM "PlanMaterias" pm
      INNER JOIN "PlanesDeEstudio" pe ON pe."id" = pm."planId"
      WHERE NOT EXISTS (
        SELECT 1 FROM "CarreraMaterias" cm
        WHERE cm."carreraId" = pe."carreraId"
        AND cm."materiaId" = pm."materiaId"
      )
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM "CarreraMaterias"');
  },
};
