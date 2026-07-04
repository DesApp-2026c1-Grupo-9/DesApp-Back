'use strict';

const NOMBRES_NUEVOS_ENTORNOS = [
  'Nuevos Entornos y Lenguajes',
  'Nuevos entornos y lenguajes',
  'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Materias',
      { codigo: 'NEYL101' },
      {
        nombre: { [Sequelize.Op.in]: NOMBRES_NUEVOS_ENTORNOS },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'Materias',
      { codigo: null },
      {
        nombre: { [Sequelize.Op.in]: NOMBRES_NUEVOS_ENTORNOS },
        codigo: 'NEYL101',
      }
    );
  },
};
