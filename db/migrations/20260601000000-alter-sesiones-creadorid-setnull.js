'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Sesiones',
      'Sesiones_creadorId_fkey'
    );
    await queryInterface.changeColumn('Sesiones', 'creadorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addConstraint('Sesiones', {
      fields: ['creadorId'],
      type: 'foreign key',
      name: 'Sesiones_creadorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Sesiones',
      'Sesiones_creadorId_fkey'
    );
    await queryInterface.changeColumn('Sesiones', 'creadorId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addConstraint('Sesiones', {
      fields: ['creadorId'],
      type: 'foreign key',
      name: 'Sesiones_creadorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};
