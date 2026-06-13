'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Notificaciones', 'novedadId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Novedades',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    const enumType = 'enum_Notificaciones_tipo';
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'novedad_like'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'novedad_comentario'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'comentario_respuesta'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Notificaciones', 'novedadId');

    // Note: PostgreSQL does not support removing values from an enum.
    // The down migration cannot revert the enum changes.
  },
};
