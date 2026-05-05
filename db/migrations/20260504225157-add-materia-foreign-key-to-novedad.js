'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Novedades', {
      type: 'foreign key',
      fields: ['materiaId'],
      references: {
        table: 'Materias',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'Novedades',
      'Novedades_materiaId_fkey'
    );
  },
};
