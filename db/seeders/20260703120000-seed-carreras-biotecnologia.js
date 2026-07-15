'use strict';

const CARRERAS_DATA = [
  {
    nombre: 'Licenciatura en Biotecnología',
    titulo: 'Licenciado/a en Biotecnología',
    instituto: 'Instituto de Biotecnología',
    duracion: 5,
    planNombre: 'Plan 2026 - Licenciatura en Biotecnología',
  },
  {
    nombre: 'Licenciatura en Desarrollo Agrario',
    titulo: 'Licenciado/a en Desarrollo Agrario',
    instituto: 'Instituto de Biotecnología',
    duracion: 5,
    planNombre: 'Plan 2026 - Licenciatura en Desarrollo Agrario',
  },
  {
    nombre: 'Tecnicatura Universitaria en Producción Agroecológica Periurbana',
    titulo: 'Técnico/a Universitario/a en Producción Agroecológica Periurbana',
    instituto: 'Instituto de Biotecnología',
    duracion: 3,
    planNombre:
      'Plan 2026 - Tecnicatura Universitaria en Producción Agroecológica Periurbana',
  },
  {
    nombre: 'Tecnicatura Universitaria en Viverismo',
    titulo: 'Técnico/a Universitario/a en Viverismo',
    instituto: 'Instituto de Biotecnología',
    duracion: 3,
    planNombre: 'Plan 2026 - Tecnicatura Universitaria en Viverismo',
  },
];

const CODIGOS_MATERIAS = {
  'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital':
    'NEYL101',
  'Inglés I': 'ING101',
  'Inglés II (Técnico)': 'ING102',
  'Asignatura UNAHUR I': 'UNAHUR101',
  'Asignatura UNAHUR II': 'UNAHUR102',
};

const MATERIAS_LIC_BIOTECNOLOGIA = [
  {
    nombre: 'Introducción al análisis matemático',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Introducción a la Biotecnología',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre:
      'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Química General',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Biología General',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 80,
  },
  {
    nombre: 'Matemática',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Inglés I',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 6,
  },
  {
    nombre: 'Taller de Laboratorio I',
    anio: 1,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Microbiología general',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Física I',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Química Inorgánica',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Física aplicada',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Química Orgánica',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Taller de Laboratorio II',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Higiene y Seguridad',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Técnicas analíticas e instrumentales',
    anio: 2,
    tipo: 'cuatrimestral',
    cargaHoraria: 48,
  },
  {
    nombre: 'Asignatura UNAHUR I',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Bioquímica I',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Gestión de la Calidad',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Fisicoquímica',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Introducción a la Biología Celular y Molecular',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Estadística y Diseño experimental',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Taller de Laboratorio III',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Ética y responsabilidad profesional',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Legislación y normas de laboratorio',
    anio: 3,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Programación',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Genética Molecular',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Bioquímica II',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Economía de la innovación',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Formulación y Evaluación de Proyectos',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Asignatura UNAHUR II',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 32,
  },
  {
    nombre: 'Ingeniería Genética',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Bioprocesos I',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Biotecnología médica e inmunología',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Bioinformática',
    anio: 4,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Procesos Biotecnológicos Industriales',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Biología Molecular y Celular',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 128,
  },
  {
    nombre: 'Agrobiotecnología',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Taller de Trabajo Final I',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Sociología de la ciencia',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 64,
  },
  {
    nombre: 'Inglés II',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 6,
  },
  {
    nombre: 'Biotecnología Animal',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Biotecnología Ambiental',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Biotecnología de Alimentos y Medicamentos',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
  {
    nombre: 'Taller de Trabajo Final II',
    anio: 5,
    tipo: 'cuatrimestral',
    cargaHoraria: 96,
  },
];

const CORRELATIVIDADES_BIOTECNOLOGIA = [
  { materia: 'Microbiología general', prerrequisito: 'Biología General' },
  { materia: 'Física I', prerrequisito: 'Matemática' },
  { materia: 'Química Inorgánica', prerrequisito: 'Química General' },
  { materia: 'Física aplicada', prerrequisito: 'Física I' },
  { materia: 'Química Orgánica', prerrequisito: 'Química General' },
  {
    materia: 'Taller de Laboratorio II',
    prerrequisito: 'Taller de Laboratorio I',
  },
  {
    materia: 'Técnicas analíticas e instrumentales',
    prerrequisito: 'Taller de Laboratorio I',
  },
  { materia: 'Bioquímica I', prerrequisito: 'Química Orgánica' },
  { materia: 'Bioquímica I', prerrequisito: 'Biología General' },
  { materia: 'Fisicoquímica', prerrequisito: 'Química Inorgánica' },
  {
    materia: 'Introducción a la Biología Celular y Molecular',
    prerrequisito: 'Biología General',
  },
  {
    materia: 'Estadística y Diseño experimental',
    prerrequisito: 'Matemática',
  },
  {
    materia: 'Taller de Laboratorio III',
    prerrequisito: 'Taller de Laboratorio II',
  },
  {
    materia: 'Legislación y normas de laboratorio',
    prerrequisito: 'Higiene y Seguridad',
  },
  { materia: 'Asignatura UNAHUR II', prerrequisito: 'Asignatura UNAHUR I' },
  {
    materia: 'Genética Molecular',
    prerrequisito: 'Introducción a la Biología Celular y Molecular',
  },
  { materia: 'Bioquímica II', prerrequisito: 'Bioquímica I' },
  { materia: 'Ingeniería Genética', prerrequisito: 'Genética Molecular' },
  { materia: 'Ingeniería Genética', prerrequisito: 'Bioquímica II' },
  { materia: 'Bioprocesos I', prerrequisito: 'Bioquímica II' },
  {
    materia: 'Biotecnología médica e inmunología',
    prerrequisito: 'Genética Molecular',
  },
  { materia: 'Bioinformática', prerrequisito: 'Programación' },
  {
    materia: 'Procesos Biotecnológicos Industriales',
    prerrequisito: 'Bioprocesos I',
  },
  {
    materia: 'Biología Molecular y Celular',
    prerrequisito: 'Genética Molecular',
  },
  { materia: 'Agrobiotecnología', prerrequisito: 'Ingeniería Genética' },
  { materia: 'Taller de Trabajo Final I', prerrequisito: 'Bioprocesos I' },
  { materia: 'Taller de Trabajo Final I', prerrequisito: 'Bioinformática' },
  { materia: 'Inglés II (Técnico)', prerrequisito: 'Inglés I' },
  {
    materia: 'Biotecnología Animal',
    prerrequisito: 'Biología Molecular y Celular',
  },
  { materia: 'Biotecnología Ambiental', prerrequisito: 'Bioprocesos I' },
  {
    materia: 'Biotecnología de Alimentos y Medicamentos',
    prerrequisito: 'Bioprocesos I',
  },
  {
    materia: 'Taller de Trabajo Final II',
    prerrequisito: 'Taller de Trabajo Final I',
  },
];

const ensureCarrera = async (queryInterface, transaction, data) => {
  const existente = await queryInterface.sequelize.query(
    'SELECT id FROM "Carreras" WHERE nombre = :nombre LIMIT 1',
    {
      replacements: { nombre: data.nombre },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (existente.length > 0) {
    const id = existente[0].id;
    await queryInterface.bulkUpdate(
      'Carreras',
      {
        titulo: data.titulo,
        instituto: data.instituto,
        duracion: data.duracion,
        updatedAt: new Date(),
      },
      { id },
      { transaction }
    );
    return id;
  }

  await queryInterface.bulkInsert(
    'Carreras',
    [
      {
        nombre: data.nombre,
        titulo: data.titulo,
        instituto: data.instituto,
        duracion: data.duracion,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { transaction }
  );

  const nueva = await queryInterface.sequelize.query(
    'SELECT id FROM "Carreras" WHERE nombre = :nombre LIMIT 1',
    {
      replacements: { nombre: data.nombre },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  return nueva[0].id;
};

const ensurePlanVigente = async (
  queryInterface,
  transaction,
  carreraId,
  planNombre
) => {
  const plan = await queryInterface.sequelize.query(
    'SELECT id FROM "PlanesDeEstudio" WHERE "carreraId" = :carreraId AND estado = :estado LIMIT 1',
    {
      replacements: { carreraId, estado: 'vigente' },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (plan.length > 0) {
    return plan[0].id;
  }

  await queryInterface.bulkInsert(
    'PlanesDeEstudio',
    [
      {
        nombre: planNombre,
        estado: 'vigente',
        carreraId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { transaction }
  );

  const nuevoPlan = await queryInterface.sequelize.query(
    'SELECT id FROM "PlanesDeEstudio" WHERE "carreraId" = :carreraId AND estado = :estado LIMIT 1',
    {
      replacements: { carreraId, estado: 'vigente' },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  return nuevoPlan[0].id;
};

const ensureMateria = async (queryInterface, transaction, materiaData) => {
  const existente = await queryInterface.sequelize.query(
    'SELECT id FROM "Materias" WHERE nombre = :nombre LIMIT 1',
    {
      replacements: { nombre: materiaData.nombre },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  const payload = {
    tipo: materiaData.tipo,
    cargaHoraria: materiaData.cargaHoraria,
    codigo: CODIGOS_MATERIAS[materiaData.nombre] || null,
    updatedAt: new Date(),
  };

  if (existente.length > 0) {
    const id = existente[0].id;
    await queryInterface.bulkUpdate(
      'Materias',
      payload,
      { id },
      { transaction }
    );
    return id;
  }

  await queryInterface.bulkInsert(
    'Materias',
    [
      {
        nombre: materiaData.nombre,
        ...payload,
        createdAt: new Date(),
      },
    ],
    { transaction }
  );

  const nueva = await queryInterface.sequelize.query(
    'SELECT id FROM "Materias" WHERE nombre = :nombre LIMIT 1',
    {
      replacements: { nombre: materiaData.nombre },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  return nueva[0].id;
};

const ensureCarreraMateria = async (
  queryInterface,
  transaction,
  carreraId,
  materiaId
) => {
  const existente = await queryInterface.sequelize.query(
    'SELECT 1 FROM "CarreraMaterias" WHERE "carreraId" = :carreraId AND "materiaId" = :materiaId LIMIT 1',
    {
      replacements: { carreraId, materiaId },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (existente.length > 0) return;

  await queryInterface.bulkInsert(
    'CarreraMaterias',
    [
      {
        carreraId,
        materiaId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { transaction }
  );
};

const ensurePlanMateria = async (
  queryInterface,
  transaction,
  planId,
  materiaId,
  anio
) => {
  const existente = await queryInterface.sequelize.query(
    'SELECT 1 FROM "PlanMaterias" WHERE "planId" = :planId AND "materiaId" = :materiaId LIMIT 1',
    {
      replacements: { planId, materiaId },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (existente.length > 0) {
    await queryInterface.bulkUpdate(
      'PlanMaterias',
      {
        anio,
        updatedAt: new Date(),
      },
      { planId, materiaId },
      { transaction }
    );
    return;
  }

  await queryInterface.bulkInsert(
    'PlanMaterias',
    [
      {
        planId,
        materiaId,
        anio,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { transaction }
  );
};

const ensureCorrelatividad = async (
  queryInterface,
  transaction,
  materiaId,
  prerrequisitoId
) => {
  const existente = await queryInterface.sequelize.query(
    'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = :materiaId AND "prerrequisitoId" = :prerrequisitoId LIMIT 1',
    {
      replacements: { materiaId, prerrequisitoId },
      type: queryInterface.sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (existente.length > 0) return;

  await queryInterface.bulkInsert(
    'Correlatividades',
    [
      {
        materiaId,
        prerrequisitoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    { transaction }
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const carrerasMap = new Map();
      const planesMap = new Map();

      for (const carreraData of CARRERAS_DATA) {
        const carreraId = await ensureCarrera(
          queryInterface,
          transaction,
          carreraData
        );
        const planId = await ensurePlanVigente(
          queryInterface,
          transaction,
          carreraId,
          carreraData.planNombre
        );

        carrerasMap.set(carreraData.nombre, carreraId);
        planesMap.set(carreraData.nombre, planId);
      }

      const carreraBiotecId = carrerasMap.get('Licenciatura en Biotecnología');
      const planBiotecId = planesMap.get('Licenciatura en Biotecnología');

      if (carreraBiotecId && planBiotecId) {
        const materiaIdPorNombre = new Map();

        await queryInterface.sequelize.query(
          'ALTER TABLE "PlanMaterias" DISABLE TRIGGER trg_check_materia_en_carrera',
          { transaction }
        );

        for (const materiaData of MATERIAS_LIC_BIOTECNOLOGIA) {
          const materiaId = await ensureMateria(
            queryInterface,
            transaction,
            materiaData
          );
          materiaIdPorNombre.set(materiaData.nombre, materiaId);

          await ensureCarreraMateria(
            queryInterface,
            transaction,
            carreraBiotecId,
            materiaId
          );
          await ensurePlanMateria(
            queryInterface,
            transaction,
            planBiotecId,
            materiaId,
            materiaData.anio
          );
        }

        await queryInterface.sequelize.query(
          'ALTER TABLE "PlanMaterias" ENABLE TRIGGER trg_check_materia_en_carrera',
          { transaction }
        );

        for (const correlatividad of CORRELATIVIDADES_BIOTECNOLOGIA) {
          const materiaId = materiaIdPorNombre.get(correlatividad.materia);
          const prerrequisitoId = materiaIdPorNombre.get(
            correlatividad.prerrequisito
          );

          if (!materiaId || !prerrequisitoId) continue;

          await ensureCorrelatividad(
            queryInterface,
            transaction,
            materiaId,
            prerrequisitoId
          );
        }
      }

      await transaction.commit();
      console.log(
        'Seed de carreras/materias/correlatividades de biotecnología aplicado correctamente (idempotente)'
      );
    } catch (error) {
      await transaction.rollback();
      console.error('Error aplicando seed de biotecnología:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const nombresCarrera = CARRERAS_DATA.map((c) => c.nombre);

      await queryInterface.sequelize.query(
        `
          DELETE FROM "Correlatividades"
          WHERE "materiaId" IN (
            SELECT pm."materiaId"
            FROM "PlanMaterias" pm
            INNER JOIN "PlanesDeEstudio" p ON p.id = pm."planId"
            INNER JOIN "Carreras" c ON c.id = p."carreraId"
            WHERE c.nombre IN (:nombresCarrera)
          )
          OR "prerrequisitoId" IN (
            SELECT pm."materiaId"
            FROM "PlanMaterias" pm
            INNER JOIN "PlanesDeEstudio" p ON p.id = pm."planId"
            INNER JOIN "Carreras" c ON c.id = p."carreraId"
            WHERE c.nombre IN (:nombresCarrera)
          )
        `,
        {
          replacements: { nombresCarrera },
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `
          DELETE FROM "PlanMaterias"
          WHERE "planId" IN (
            SELECT p.id
            FROM "PlanesDeEstudio" p
            INNER JOIN "Carreras" c ON c.id = p."carreraId"
            WHERE c.nombre IN (:nombresCarrera)
          )
        `,
        {
          replacements: { nombresCarrera },
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `
          DELETE FROM "CarreraMaterias"
          WHERE "carreraId" IN (
            SELECT id FROM "Carreras" WHERE nombre IN (:nombresCarrera)
          )
        `,
        {
          replacements: { nombresCarrera },
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `
          DELETE FROM "PlanesDeEstudio"
          WHERE "carreraId" IN (
            SELECT id FROM "Carreras" WHERE nombre IN (:nombresCarrera)
          )
        `,
        {
          replacements: { nombresCarrera },
          transaction,
        }
      );

      await queryInterface.bulkDelete(
        'Carreras',
        {
          nombre: { [Sequelize.Op.in]: nombresCarrera },
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
