'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sesiones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materias',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      creadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tema: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('virtual', 'presencial'),
        allowNull: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ubicacion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fechaHora: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duracion: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cupos: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      necesidadAprobacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      estado: {
        type: Sequelize.ENUM('activa', 'cancelada', 'finalizada'),
        defaultValue: 'activa',
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
    await queryInterface.dropTable('Sesiones');
  },
};
