'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // La tabla SequelizeData puede no existir en DB fresh (seeders nunca corridos)
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_catalog.pg_tables
          WHERE schemaname = 'public' AND tablename = 'SequelizeData'
        ) THEN
          DELETE FROM "SequelizeData"
          WHERE name = '20260426000001-seed-academic-data.js';
        END IF;
      END
      $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // No se puede restaurar un delete sin backup
  },
};
