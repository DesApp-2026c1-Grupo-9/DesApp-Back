'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const carreras = await queryInterface.bulkInsert('Carreras', [
      {
        nombre: 'Ingeniería en Computación',
        titulo: 'Ingeniero en Computación',
        instituto: 'Universidad de Hurlingham',
        duracion: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { returning: true });

    const carreraId = carreras[0].id;

    const planes = await queryInterface.bulkInsert('PlanesDeEstudio', [
      {
        nombre: 'Plan 2023',
        estado: 'vigente',
        carreraId: carreraId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { returning: true });

    const planId = planes[0].id;

    const materias = await queryInterface.bulkInsert('Materias', [
      { nombre: 'Matemática I', anio: 1, tipo: 'anual', cargaHoraria: 128, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Programación I', anio: 1, tipo: 'anual', cargaHoraria: 128, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Matemática II', anio: 2, tipo: 'anual', cargaHoraria: 128, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Programación II', anio: 2, tipo: 'anual', cargaHoraria: 128, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Algoritmos', anio: 2, tipo: 'cuatrimestral', cargaHoraria: 64, createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    const planMaterias = materias.map(m => ({
      planId: planId,
      materiaId: m.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('PlanMaterias', planMaterias);

    const programacionI = materias.find(m => m.nombre === 'Programación I');
    const programacionII = materias.find(m => m.nombre === 'Programación II');
    const matematicaI = materias.find(m => m.nombre === 'Matemática I');
    const matematicaII = materias.find(m => m.nombre === 'Matemática II');

    await queryInterface.bulkInsert('Correlatividades', [
      { materiaId: programacionII.id, prerrequisitoId: programacionI.id, createdAt: new Date(), updatedAt: new Date() },
      { materiaId: matematicaII.id, prerrequisitoId: matematicaI.id, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Correlatividades', null, {});
    await queryInterface.bulkDelete('PlanMaterias', null, {});
    await queryInterface.bulkDelete('Materias', null, {});
    await queryInterface.bulkDelete('PlanesDeEstudio', null, {});
    await queryInterface.bulkDelete('Carreras', null, {});
  },
};
