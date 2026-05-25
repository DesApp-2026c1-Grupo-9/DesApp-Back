'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION check_materia_en_carrera()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM "CarreraMaterias" cm
          JOIN "PlanesDeEstudio" p ON p.id = NEW."planId"
          WHERE cm."carreraId" = p."carreraId"
          AND cm."materiaId" = NEW."materiaId"
        ) THEN
          RAISE EXCEPTION 'La materia (id: %) no está asignada a la carrera del plan (id: %)',
            NEW."materiaId", (SELECT "carreraId" FROM "PlanesDeEstudio" WHERE id = NEW."planId");
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_check_materia_en_carrera
      BEFORE INSERT ON "PlanMaterias"
      FOR EACH ROW EXECUTE FUNCTION check_materia_en_carrera();
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_check_materia_en_carrera ON "PlanMaterias";
    `);
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS check_materia_en_carrera();
    `);
  },
};
