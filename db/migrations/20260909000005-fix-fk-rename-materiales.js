'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Materiales',
      'Materiales_creadorId_fkey'
    );

    await queryInterface.renameColumn('Materiales', 'creadorId', 'estudianteId');

    await queryInterface.addConstraint('Materiales', {
      fields: ['estudianteId'],
      type: 'foreign key',
      name: 'Materiales_estudianteId_fkey',
      references: {
        table: 'Estudiantes',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Materiales',
      'Materiales_estudianteId_fkey'
    );

    await queryInterface.renameColumn('Materiales', 'estudianteId', 'creadorId');

    await queryInterface.addConstraint('Materiales', {
      fields: ['creadorId'],
      type: 'foreign key',
      name: 'Materiales_creadorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
