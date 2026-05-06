'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SesionParticipantes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sesionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sesiones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estudianteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobado', 'rechazado'),
        defaultValue: 'pendiente',
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

    await queryInterface.addIndex('SesionParticipantes', ['sesionId', 'estudianteId'], {
      unique: true,
      name: 'sesion_participantes_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SesionParticipantes');
  },
};
