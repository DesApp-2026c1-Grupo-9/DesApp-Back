'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar unique constraint a Carreras.nombre para evitar duplicados
    await queryInterface.addConstraint('Carreras', {
      type: 'unique',
      fields: ['nombre'],
      name: 'unique_carrera_nombre',
    });

    // Agregar unique constraint a PlanesDeEstudio para evitar planes duplicados por carrera
    await queryInterface.addConstraint('PlanesDeEstudio', {
      type: 'unique',
      fields: ['carreraId', 'estado'],
      name: 'unique_plan_carrera_estado',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Carreras', 'unique_carrera_nombre');
    await queryInterface.removeConstraint(
      'PlanesDeEstudio',
      'unique_plan_carrera_estado'
    );
  },
};
