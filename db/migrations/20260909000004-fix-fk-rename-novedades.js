'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Novedades',
      'Novedades_autorId_fkey'
    );

    await queryInterface.renameColumn('Novedades', 'autorId', 'estudianteId');

    await queryInterface.addConstraint('Novedades', {
      fields: ['estudianteId'],
      type: 'foreign key',
      name: 'Novedades_estudianteId_fkey',
      references: {
        table: 'Estudiantes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Novedades',
      'Novedades_estudianteId_fkey'
    );

    await queryInterface.renameColumn('Novedades', 'estudianteId', 'autorId');

    await queryInterface.addConstraint('Novedades', {
      fields: ['autorId'],
      type: 'foreign key',
      name: 'Novedades_autorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};
