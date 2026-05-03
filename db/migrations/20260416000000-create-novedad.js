'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Novedades', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM(
          'posteo',
          'inscripcion',
          'regularizacion',
          'aprobacion'
        ),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      autorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Novedades');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Novedades_tipo";'
    );
  },
};
