'use strict';

const NOMBRES_UNAHUR_101 = [
  'Materia UNAHUR',
  'Materia UNAHUR (IA)',
  'Materia UNAHUR I',
];

const NOMBRES_UNAHUR_102 = ['Materia UNAHUR II'];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Materias',
      { codigo: 'UNAHUR101' },
      { nombre: { [Sequelize.Op.in]: NOMBRES_UNAHUR_101 } }
    );

    await queryInterface.bulkUpdate(
      'Materias',
      { codigo: 'UNAHUR102' },
      { nombre: { [Sequelize.Op.in]: NOMBRES_UNAHUR_102 } }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Materias',
      { codigo: null },
      {
        [Sequelize.Op.or]: [
          {
            nombre: { [Sequelize.Op.in]: NOMBRES_UNAHUR_101 },
            codigo: 'UNAHUR101',
          },
          {
            nombre: { [Sequelize.Op.in]: NOMBRES_UNAHUR_102 },
            codigo: 'UNAHUR102',
          },
        ],
      }
    );
  },
};
