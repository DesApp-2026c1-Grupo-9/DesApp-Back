'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const upsertCarrera = async (data) => {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Carreras" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      if (existing && existing.length > 0) return existing[0].id;
      const result = await queryInterface.bulkInsert(
        'Carreras',
        [{ ...data, createdAt: now, updatedAt: now }],
        { returning: true }
      );
      return result[0].id;
    };

    const licInfoId = await upsertCarrera({
      nombre: 'Licenciatura en Informática',
      titulo: 'Licenciado en Informática',
      instituto: 'Universidad de Hurlingham',
      duracion: 4,
    });
    await upsertCarrera({
      nombre: 'Tecnicatura en Programación',
      titulo: 'Técnico en Programación',
      instituto: 'Universidad de Hurlingham',
      duracion: 3,
    });
    await upsertCarrera({
      nombre: 'Tecnicatura en Inteligencia Artificial',
      titulo: 'Técnico en Inteligencia Artificial',
      instituto: 'Universidad de Hurlingham',
      duracion: 3,
    });

    const existingPlan = await queryInterface.sequelize.query(
      'SELECT id FROM "PlanesDeEstudio" WHERE "carreraId" = ? AND nombre = ? LIMIT 1',
      {
        replacements: [licInfoId, 'Plan 2023'],
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );
    let planId;
    if (existingPlan && existingPlan.length > 0) {
      planId = existingPlan[0].id;
    } else {
      const result = await queryInterface.bulkInsert(
        'PlanesDeEstudio',
        [
          {
            nombre: 'Plan 2023',
            estado: 'vigente',
            carreraId: licInfoId,
            createdAt: now,
            updatedAt: now,
          },
        ],
        { returning: true }
      );
      planId = result[0].id;
    }

    const materiasData = [
      { nombre: 'Matemática I', anio: 1, tipo: 'anual' },
      { nombre: 'Programación I', anio: 1, tipo: 'anual' },
      { nombre: 'Matemática II', anio: 2, tipo: 'anual' },
      { nombre: 'Programación II', anio: 2, tipo: 'anual' },
      { nombre: 'Algoritmos', anio: 2, tipo: 'cuatrimestral' },
    ];

    const materias = [];
    for (const data of materiasData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      if (existing && existing.length > 0) {
        materias.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('Materias', [
          {
            nombre: data.nombre,
            tipo: data.tipo,
            createdAt: now,
            updatedAt: now,
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        materias.push({ id: nuevo[0].id, ...data });
      }
    }

    for (const m of materias) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "PlanMaterias" WHERE "planId" = ? AND "materiaId" = ? LIMIT 1',
        {
          replacements: [planId, m.id],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('PlanMaterias', [
          {
            planId,
            materiaId: m.id,
            anio: m.anio,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    }

    const findMateria = (nombre) => materias.find((m) => m.nombre === nombre);
    const correls = [
      { materia: 'Programación II', prerrequisito: 'Programación I' },
      { materia: 'Matemática II', prerrequisito: 'Matemática I' },
    ];
    for (const c of correls) {
      const materiaId = findMateria(c.materia)?.id;
      const prerrequisitoId = findMateria(c.prerrequisito)?.id;
      if (!materiaId || !prerrequisitoId) continue;
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = ? AND "prerrequisitoId" = ? LIMIT 1',
        {
          replacements: [materiaId, prerrequisitoId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Correlatividades', [
          { materiaId, prerrequisitoId, createdAt: now, updatedAt: now },
        ]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Correlatividades', null, {});
    await queryInterface.bulkDelete('PlanMaterias', null, {});
    await queryInterface.bulkDelete('Materias', null, {});
    await queryInterface.bulkDelete('PlanesDeEstudio', null, {});
    await queryInterface.bulkDelete('Carreras', null, {});
  },
};
