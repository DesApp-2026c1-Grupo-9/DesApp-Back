'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Novedades_tipo" ADD VALUE 'sesion_creada';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Novedades_tipo" ADD VALUE 'sesion_cancelada';
    `);

    await queryInterface.addColumn('Novedades', 'sesionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Sesiones',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Novedades', 'sesionId');

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Novedades_tipo" RENAME TO "enum_Novedades_tipo_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Novedades_tipo" AS ENUM('posteo', 'inscripcion', 'regularizacion', 'aprobacion');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Novedades" ALTER COLUMN "tipo" TYPE "enum_Novedades_tipo" USING "tipo"::text::"enum_Novedades_tipo";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Novedades_tipo_old";
    `);
  },
};
