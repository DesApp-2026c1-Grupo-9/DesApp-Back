'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PreferenciasEstudiante', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      estudianteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      publicarInscripciones: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      publicarRegularizaciones: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      publicarAprobaciones: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      perfilPublico: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      mostrarEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      mostrarSituacionAcademica: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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

    await queryInterface.addIndex('PreferenciasEstudiante', ['estudianteId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PreferenciasEstudiante');
  },
};
