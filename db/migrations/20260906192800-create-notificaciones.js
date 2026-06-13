'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notificaciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
      },
      tipo: {
        type: Sequelize.ENUM(
          'sesion_creada_conexion',
          'sesion_creada_materia',
          'denuncia_recibida',
          'material_suspendido',
          'material_revocado',
          'conexion_aprobo_materia'
        ),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      actorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Usuarios', key: 'id' },
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Materias', key: 'id' },
      },
      sesionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Sesiones', key: 'id' },
      },
      denunciaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Denuncias', key: 'id' },
      },
      materialId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Materiales', key: 'id' },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Notificaciones');
  },
};
