'use strict';

// Mapeo de nombres de materias a códigos consistentes
// Las materias equivalentes en diferentes carreras tienen el MISMO código
const CODIGOS_MATERIAS = {
  'Inglés I': 'ING101',
  'Inglés I (IA)': 'ING101',
  'Inglés II': 'ING102',
  'Inglés II (IA)': 'ING102',
  'Bases de Datos': 'BD101',
  'Bases de datos (IA)': 'BD101',
  'Programación con Objetos I': 'POO101',
  'Programación con Objetos II': 'POO102',
  'Programación Estructurada': 'PROG101',
  'Matemática I': 'MAT101',
  'Matemática para informática I': 'MAT101',
  'Matemática para informática I (IA)': 'MAT101',
  'Matemática II': 'MAT102',
  'Matemática para Informática II': 'MAT102',
  'Matemática III': 'MAT103',
  'Introducción a la Programación': 'PROG100',
  'Introducción a lógica y problemas computacionales': 'LOG101',
  'Introducción a lógica y problemas computacionales (IA)': 'LOG101',
  'Sistemas Operativos': 'SO101',
  'Redes de Computadoras': 'RED101',
  'Organización de Computadoras': 'ORG101',
  'Construcción de Interfaces de Usuario': 'UI101',
  'Estructuras de Datos': 'ED101',
  'Estrategias de Persistencia': 'PERS101',
  'Elementos de Ingeniería de Software': 'ING_SW101',
  'Probabilidad y Estadística': 'PROB101',
  'Probabilidad y estadística (IA)': 'PROB101',
  'Materia UNAHUR': 'UNAHUR101',
  'Materia UNAHUR (IA)': 'UNAHUR101',
  'Materia UNAHUR I': 'UNAHUR101',
  'Materia UNAHUR II': 'UNAHUR102',
  'Nuevos Entornos y Lenguajes': 'NEYL101',
  'Nuevos entornos y lenguajes': 'NEYL101',
  'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital':
    'NEYL101',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Definir carreras
    const carrerasData = [
      {
        nombre: 'Licenciatura en Informática',
        titulo: 'Licenciado en Informática',
        instituto: 'Universidad Nacional de Hurlingham',
        duracion: 5,
      },
      {
        nombre: 'Tecnicatura en Programación',
        titulo: 'Técnico en Programación',
        instituto: 'Universidad Nacional de Hurlingham',
        duracion: 3,
      },
      {
        nombre: 'Tecnicatura en Inteligencia Artificial',
        titulo: 'Técnico en Inteligencia Artificial',
        instituto: 'Universidad Nacional de Hurlingham',
        duracion: 3,
      },
    ];

    // Crear carreras (idempotente)
    const carreras = [];
    for (const data of carrerasData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Carreras" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        carreras.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('Carreras', [
          {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "Carreras" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        carreras.push({ id: nuevo[0].id, ...data });
      }
    }

    // Crear planes de estudio (idempotente)
    const planesData = [
      {
        nombre: 'Plan 2026 - Licenciatura en Informática',
        carreraId: carreras[0].id,
      },
      {
        nombre: 'Plan 2026 - Tecnicatura en Programación',
        carreraId: carreras[1].id,
      },
      {
        nombre: 'Plan 2026 - Tecnicatura en IA',
        carreraId: carreras[2].id,
      },
    ];

    const planes = [];
    for (const data of planesData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "PlanesDeEstudio" WHERE "carreraId" = ? AND estado = ? LIMIT 1',
        {
          replacements: [data.carreraId, 'vigente'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        planes.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('PlanesDeEstudio', [
          {
            nombre: data.nombre,
            estado: 'vigente',
            carreraId: data.carreraId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "PlanesDeEstudio" WHERE "carreraId" = ? AND estado = ? LIMIT 1',
          {
            replacements: [data.carreraId, 'vigente'],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        planes.push({ id: nuevo[0].id, ...data });
      }
    }

    const [planLicInfo, planTecProg, planLicIA] = planes;

    // Materias Licenciatura en Informática
    const materiasLicInfoData = [
      { nombre: 'Matemática I', anio: 1, tipo: 'cuatrimestral' },
      {
        nombre: 'Introducción a la Programación',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Organización de Computadoras',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Nuevos Entornos y Lenguajes', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Estructuras de Datos', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Programación con Objetos I', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Bases de Datos', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Inglés I', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Matemática II', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Programación con Objetos II', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Redes de Computadoras', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Sistemas Operativos', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Programación Funcional', anio: 2, tipo: 'cuatrimestral' },
      {
        nombre: 'Construcción de Interfaces de Usuario',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Algoritmos', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Estrategias de Persistencia', anio: 2, tipo: 'cuatrimestral' },
      {
        nombre: 'Laboratorio de Sistemas Operativos y Redes',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Análisis Matemático', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Lógica y Programación', anio: 3, tipo: 'cuatrimestral' },
      {
        nombre: 'Elementos de Ingeniería de Software',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Seguridad de la Información', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Materia UNAHUR I', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Inglés II', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Matemática III', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Programación Concurrente', anio: 3, tipo: 'cuatrimestral' },
      {
        nombre: 'Ingeniería de Requerimientos',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Desarrollo de Aplicaciones', anio: 3, tipo: 'cuatrimestral' },
      { nombre: 'Probabilidad y Estadística', anio: 4, tipo: 'cuatrimestral' },
      {
        nombre: 'Gestión de Proyectos de Desarrollo de Software',
        anio: 4,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Lenguajes Formales y Autómatas',
        anio: 4,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Programación con Objetos III',
        anio: 4,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Materia UNAHUR II', anio: 4, tipo: 'cuatrimestral' },
      {
        nombre: 'Práctica Profesional Supervisada (PPS)',
        anio: 4,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Teoría de la Computación', anio: 4, tipo: 'cuatrimestral' },
      { nombre: 'Arquitectura de Software I', anio: 4, tipo: 'cuatrimestral' },
      {
        nombre: 'Sistemas Distribuidos y Tiempo Real',
        anio: 4,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Tesina de Licenciatura', anio: 5, tipo: 'anual' },
      { nombre: 'Materia Optativa I', anio: 5, tipo: 'cuatrimestral' },
      {
        nombre: 'Características de Lenguajes de Programación',
        anio: 5,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Arquitectura de Software II', anio: 5, tipo: 'cuatrimestral' },
      {
        nombre: 'Arquitectura de Computadoras',
        anio: 5,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Materia Optativa II', anio: 5, tipo: 'cuatrimestral' },
      {
        nombre: 'Parseo y generación de código',
        anio: 5,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Ejercicio Profesional', anio: 5, tipo: 'cuatrimestral' },
      { nombre: 'Tecnología y Sociedad', anio: 5, tipo: 'cuatrimestral' },
    ];

    const materiasLicInfo = [];
    for (const data of materiasLicInfoData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        materiasLicInfo.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('Materias', [
          {
            nombre: data.nombre,
            tipo: data.tipo,
            codigo: CODIGOS_MATERIAS[data.nombre] || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        materiasLicInfo.push({ id: nuevo[0].id, ...data });
      }
    }

    // Materias Tecnicatura en Programación
    const materiasTecProgData = [
      {
        nombre: 'Matemática para informática I',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Introducción a lógica y problemas computacionales',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Organización de computadoras I',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Nuevos entornos y lenguajes', anio: 1, tipo: 'cuatrimestral' },
      {
        nombre: 'Taller de lenguajes de marcado y tecnologías web',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Programación estructurada', anio: 1, tipo: 'cuatrimestral' },
      {
        nombre: 'Matemática para Informática II',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Inglés I', anio: 1, tipo: 'cuatrimestral' },
      {
        nombre: 'Bases de Datos',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Programación con Objetos I',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Estructuras de Datos',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Materia UNAHUR',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Programación con Objetos II',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Electiva I', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Electiva II', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Inglés II', anio: 2, tipo: 'cuatrimestral' },
      {
        nombre: 'Construcción de Interfaces de Usuario',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Estrategias de Persistencia',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Elementos de Ingeniería de Software',
        anio: 3,
        tipo: 'cuatrimestral',
      },
    ];

    const materiasTecProg = [];
    for (const data of materiasTecProgData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        materiasTecProg.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('Materias', [
          {
            nombre: data.nombre,
            tipo: data.tipo,
            codigo: CODIGOS_MATERIAS[data.nombre] || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        materiasTecProg.push({ id: nuevo[0].id, ...data });
      }
    }

    // Materias Tecnicatura en IA
    const materiasLicIAData = [
      {
        nombre: 'Matemática para informática I (IA)',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Introducción a lógica y problemas computacionales (IA)',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Introducción a la inteligencia artificial',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      {
        nombre:
          'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
        anio: 1,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Álgebra lineal', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Cálculo', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Taller de Programación I', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Tecnología y sociedad (IA)', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Inglés I (IA)', anio: 1, tipo: 'cuatrimestral' },
      { nombre: 'Bases de datos (IA)', anio: 2, tipo: 'cuatrimestral' },
      {
        nombre: 'Probabilidad y estadística (IA)',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Taller de Programación II', anio: 2, tipo: 'cuatrimestral' },
      {
        nombre: 'Fundamentos de redes neuronales',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Fundamentos de ciencias de datos',
        anio: 2,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Aprendizaje Automático', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Electiva (IA)', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Taller de Programación III', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Inglés II (IA)', anio: 2, tipo: 'cuatrimestral' },
      { nombre: 'Materia UNAHUR (IA)', anio: 3, tipo: 'cuatrimestral' },
      {
        nombre: 'Aprendizaje Automático Avanzado',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      {
        nombre: 'Procesamiento de Imágenes y Visión por Computadora',
        anio: 3,
        tipo: 'cuatrimestral',
      },
      { nombre: 'Proyecto integrador', anio: 3, tipo: 'cuatrimestral' },
    ];

    const materiasLicIA = [];
    for (const data of materiasLicIAData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
        {
          replacements: [data.nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        materiasLicIA.push({ id: existing[0].id, ...data });
      } else {
        await queryInterface.bulkInsert('Materias', [
          {
            nombre: data.nombre,
            tipo: data.tipo,
            codigo: CODIGOS_MATERIAS[data.nombre] || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        const nuevo = await queryInterface.sequelize.query(
          'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
          }
        );
        materiasLicIA.push({ id: nuevo[0].id, ...data });
      }
    }

    // Asignar materias a carreras en CarreraMaterias (idempotente)
    const carreraMateriasData = [
      ...materiasLicInfo.map((m) => ({
        carreraId: planLicInfo.carreraId,
        materiaId: m.id,
      })),
      ...materiasTecProg.map((m) => ({
        carreraId: planTecProg.carreraId,
        materiaId: m.id,
      })),
      ...materiasLicIA.map((m) => ({
        carreraId: planLicIA.carreraId,
        materiaId: m.id,
      })),
    ];

    for (const data of carreraMateriasData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "CarreraMaterias" WHERE "carreraId" = ? AND "materiaId" = ? LIMIT 1',
        {
          replacements: [data.carreraId, data.materiaId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('CarreraMaterias', [
          {
            carreraId: data.carreraId,
            materiaId: data.materiaId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }

    // Deshabilitar trigger temporalmente para insertar PlanMaterias en bloque
    await queryInterface.sequelize.query(`
      ALTER TABLE "PlanMaterias" DISABLE TRIGGER trg_check_materia_en_carrera;
    `);

    // Asignar materias a planes de estudio (idempotente)
    const planMateriasData = [
      ...materiasLicInfo.map((m) => ({
        planId: planLicInfo.id,
        materiaId: m.id,
        anio: m.anio,
      })),
      ...materiasTecProg.map((m) => ({
        planId: planTecProg.id,
        materiaId: m.id,
        anio: m.anio,
      })),
      ...materiasLicIA.map((m) => ({
        planId: planLicIA.id,
        materiaId: m.id,
        anio: m.anio,
      })),
    ];

    for (const data of planMateriasData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "PlanMaterias" WHERE "planId" = ? AND "materiaId" = ? LIMIT 1',
        {
          replacements: [data.planId, data.materiaId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('PlanMaterias', [
          {
            planId: data.planId,
            materiaId: data.materiaId,
            anio: data.anio,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }

    // Re-habilitar trigger después de insertar PlanMaterias
    await queryInterface.sequelize.query(`
      ALTER TABLE "PlanMaterias" ENABLE TRIGGER trg_check_materia_en_carrera;
    `);

    // Correlatividades Licenciatura en Informática (idempotente)
    const findMateria = (materias, nombre) =>
      materias.find((m) => m.nombre === nombre);

    const correlatividadesLicInfoData = [
      {
        materia: 'Organización de Computadoras',
        prerrequisito: 'Introducción a la Programación',
      },
      {
        materia: 'Estructuras de Datos',
        prerrequisito: 'Introducción a la Programación',
      },
      {
        materia: 'Programación con Objetos I',
        prerrequisito: 'Introducción a la Programación',
      },
      { materia: 'Bases de Datos', prerrequisito: 'Matemática I' },
      { materia: 'Matemática II', prerrequisito: 'Matemática I' },
      { materia: 'Inglés II', prerrequisito: 'Inglés I' },
      {
        materia: 'Programación con Objetos II',
        prerrequisito: 'Programación con Objetos I',
      },
      {
        materia: 'Redes de Computadoras',
        prerrequisito: 'Organización de Computadoras',
      },
      {
        materia: 'Sistemas Operativos',
        prerrequisito: 'Introducción a la Programación',
      },
      {
        materia: 'Sistemas Operativos',
        prerrequisito: 'Organización de Computadoras',
      },
      {
        materia: 'Programación Funcional',
        prerrequisito: 'Estructuras de Datos',
      },
      {
        materia: 'Construcción de Interfaces de Usuario',
        prerrequisito: 'Programación con Objetos II',
      },
      { materia: 'Algoritmos', prerrequisito: 'Programación Funcional' },
      {
        materia: 'Estrategias de Persistencia',
        prerrequisito: 'Bases de Datos',
      },
      {
        materia: 'Estrategias de Persistencia',
        prerrequisito: 'Programación con Objetos II',
      },
      {
        materia: 'Laboratorio de Sistemas Operativos y Redes',
        prerrequisito: 'Redes de Computadoras',
      },
      {
        materia: 'Laboratorio de Sistemas Operativos y Redes',
        prerrequisito: 'Sistemas Operativos',
      },
      { materia: 'Análisis Matemático', prerrequisito: 'Matemática II' },
      { materia: 'Lógica y Programación', prerrequisito: 'Matemática I' },
      {
        materia: 'Lógica y Programación',
        prerrequisito: 'Introducción a la Programación',
      },
      {
        materia: 'Elementos de Ingeniería de Software',
        prerrequisito: 'Programación con Objetos II',
      },
      {
        materia: 'Seguridad de la Información',
        prerrequisito: 'Laboratorio de Sistemas Operativos y Redes',
      },
      { materia: 'Matemática III', prerrequisito: 'Análisis Matemático' },
      {
        materia: 'Programación Concurrente',
        prerrequisito: 'Estructuras de Datos',
      },
      {
        materia: 'Ingeniería de Requerimientos',
        prerrequisito: 'Elementos de Ingeniería de Software',
      },
      {
        materia: 'Desarrollo de Aplicaciones',
        prerrequisito: 'Construcción de Interfaces de Usuario',
      },
      {
        materia: 'Desarrollo de Aplicaciones',
        prerrequisito: 'Estrategias de Persistencia',
      },
      {
        materia: 'Desarrollo de Aplicaciones',
        prerrequisito: 'Elementos de Ingeniería de Software',
      },
      {
        materia: 'Probabilidad y Estadística',
        prerrequisito: 'Matemática III',
      },
      {
        materia: 'Gestión de Proyectos de Desarrollo de Software',
        prerrequisito: 'Ingeniería de Requerimientos',
      },
      {
        materia: 'Lenguajes Formales y Autómatas',
        prerrequisito: 'Lógica y Programación',
      },
      {
        materia: 'Programación con Objetos III',
        prerrequisito: 'Programación con Objetos II',
      },
      {
        materia: 'Práctica Profesional Supervisada (PPS)',
        prerrequisito: 'Programación Funcional',
      },
      {
        materia: 'Práctica Profesional Supervisada (PPS)',
        prerrequisito: 'Laboratorio de Sistemas Operativos y Redes',
      },
      {
        materia: 'Práctica Profesional Supervisada (PPS)',
        prerrequisito: 'Desarrollo de Aplicaciones',
      },
      {
        materia: 'Práctica Profesional Supervisada (PPS)',
        prerrequisito: 'Programación Concurrente',
      },
      {
        materia: 'Teoría de la Computación',
        prerrequisito: 'Lenguajes Formales y Autómatas',
      },
      {
        materia: 'Arquitectura de Software I',
        prerrequisito: 'Elementos de Ingeniería de Software',
      },
      {
        materia: 'Arquitectura de Software I',
        prerrequisito: 'Desarrollo de Aplicaciones',
      },
      {
        materia: 'Arquitectura de Software I',
        prerrequisito: 'Programación Concurrente',
      },
      {
        materia: 'Arquitectura de Software I',
        prerrequisito: 'Gestión de Proyectos de Desarrollo de Software',
      },
      {
        materia: 'Sistemas Distribuidos y Tiempo Real',
        prerrequisito: 'Laboratorio de Sistemas Operativos y Redes',
      },
      {
        materia: 'Sistemas Distribuidos y Tiempo Real',
        prerrequisito: 'Programación Concurrente',
      },
      {
        materia: 'Tesina de Licenciatura',
        prerrequisito: 'Gestión de Proyectos de Desarrollo de Software',
      },
      {
        materia: 'Tesina de Licenciatura',
        prerrequisito: 'Lenguajes Formales y Autómatas',
      },
      {
        materia: 'Tesina de Licenciatura',
        prerrequisito: 'Programación con Objetos III',
      },
      {
        materia: 'Características de Lenguajes de Programación',
        prerrequisito: 'Lógica y Programación',
      },
      {
        materia: 'Arquitectura de Software II',
        prerrequisito: 'Arquitectura de Software I',
      },
      {
        materia: 'Arquitectura de Software II',
        prerrequisito: 'Sistemas Distribuidos y Tiempo Real',
      },
      {
        materia: 'Arquitectura de Computadoras',
        prerrequisito: 'Laboratorio de Sistemas Operativos y Redes',
      },
      {
        materia: 'Parseo y generación de código',
        prerrequisito: 'Lenguajes Formales y Autómatas',
      },
      {
        materia: 'Parseo y generación de código',
        prerrequisito: 'Características de Lenguajes de Programación',
      },
      {
        materia: 'Tecnología y Sociedad',
        prerrequisito: 'Ejercicio Profesional',
      },
    ]
      .map((c) => ({
        materiaId: findMateria(materiasLicInfo, c.materia)?.id,
        prerrequisitoId: findMateria(materiasLicInfo, c.prerrequisito)?.id,
      }))
      .filter((c) => c.materiaId && c.prerrequisitoId);

    for (const data of correlatividadesLicInfoData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = ? AND "prerrequisitoId" = ? LIMIT 1',
        {
          replacements: [data.materiaId, data.prerrequisitoId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Correlatividades', [
          {
            materiaId: data.materiaId,
            prerrequisitoId: data.prerrequisitoId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }

    // Correlatividades Tecnicatura en Programación
    const correlatividadesTecProgData = [
      {
        materia: 'Programación estructurada',
        prerrequisito: 'Introducción a lógica y problemas computacionales',
      },
      {
        materia: 'Matemática para Informática II',
        prerrequisito: 'Matemática para informática I',
      },
      {
        materia: 'Inglés II',
        prerrequisito: 'Inglés I',
      },
      {
        materia: 'Bases de Datos',
        prerrequisito: 'Matemática para informática I',
      },
      {
        materia: 'Programación con Objetos I',
        prerrequisito: 'Programación estructurada',
      },
      {
        materia: 'Estructuras de Datos',
        prerrequisito: 'Programación estructurada',
      },
      {
        materia: 'Programación con Objetos II',
        prerrequisito: 'Programación con Objetos I',
      },
      {
        materia: 'Construcción de Interfaces de Usuario',
        prerrequisito: 'Programación con Objetos II',
      },
      {
        materia: 'Estrategias de Persistencia',
        prerrequisito: 'Bases de Datos',
      },
      {
        materia: 'Estrategias de Persistencia',
        prerrequisito: 'Programación con Objetos II',
      },
      {
        materia: 'Elementos de Ingeniería de Software',
        prerrequisito: 'Programación con Objetos II',
      },
    ]
      .map((c) => ({
        materiaId: findMateria(materiasTecProg, c.materia)?.id,
        prerrequisitoId: findMateria(materiasTecProg, c.prerrequisito)?.id,
      }))
      .filter((c) => c.materiaId && c.prerrequisitoId);

    for (const data of correlatividadesTecProgData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = ? AND "prerrequisitoId" = ? LIMIT 1',
        {
          replacements: [data.materiaId, data.prerrequisitoId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Correlatividades', [
          {
            materiaId: data.materiaId,
            prerrequisitoId: data.prerrequisitoId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }

    // Correlatividades Tecnicatura en IA
    const correlatividadesLicIAData = [
      {
        materia: 'Álgebra lineal',
        prerrequisito: 'Matemática para informática I (IA)',
      },
      {
        materia: 'Cálculo',
        prerrequisito: 'Matemática para informática I (IA)',
      },
      { materia: 'Inglés II (IA)', prerrequisito: 'Inglés I (IA)' },
      {
        materia: 'Taller de Programación I',
        prerrequisito: 'Introducción a lógica y problemas computacionales (IA)',
      },
      {
        materia: 'Bases de datos (IA)',
        prerrequisito: 'Taller de Programación I',
      },
      {
        materia: 'Probabilidad y estadística (IA)',
        prerrequisito: 'Álgebra lineal',
      },
      { materia: 'Probabilidad y estadística (IA)', prerrequisito: 'Cálculo' },
      {
        materia: 'Taller de Programación II',
        prerrequisito: 'Taller de Programación I',
      },
      {
        materia: 'Fundamentos de redes neuronales',
        prerrequisito: 'Introducción a la inteligencia artificial',
      },
      {
        materia: 'Fundamentos de redes neuronales',
        prerrequisito: 'Álgebra lineal',
      },
      {
        materia: 'Fundamentos de redes neuronales',
        prerrequisito: 'Taller de Programación I',
      },
      {
        materia: 'Fundamentos de ciencias de datos',
        prerrequisito: 'Probabilidad y estadística (IA)',
      },
      {
        materia: 'Fundamentos de ciencias de datos',
        prerrequisito: 'Bases de datos (IA)',
      },
      {
        materia: 'Aprendizaje Automático',
        prerrequisito: 'Probabilidad y estadística (IA)',
      },
      {
        materia: 'Aprendizaje Automático',
        prerrequisito: 'Fundamentos de redes neuronales',
      },
      {
        materia: 'Aprendizaje Automático',
        prerrequisito: 'Taller de Programación II',
      },
      {
        materia: 'Taller de Programación III',
        prerrequisito: 'Taller de Programación II',
      },
      {
        materia: 'Aprendizaje Automático Avanzado',
        prerrequisito: 'Aprendizaje Automático',
      },
      {
        materia: 'Procesamiento de Imágenes y Visión por Computadora',
        prerrequisito: 'Aprendizaje Automático',
      },
      {
        materia: 'Procesamiento de Imágenes y Visión por Computadora',
        prerrequisito: 'Taller de Programación III',
      },
      {
        materia: 'Proyecto integrador',
        prerrequisito: 'Aprendizaje Automático Avanzado',
      },
      {
        materia: 'Proyecto integrador',
        prerrequisito: 'Procesamiento de Imágenes y Visión por Computadora',
      },
    ]
      .map((c) => ({
        materiaId: findMateria(materiasLicIA, c.materia)?.id,
        prerrequisitoId: findMateria(materiasLicIA, c.prerrequisito)?.id,
      }))
      .filter((c) => c.materiaId && c.prerrequisitoId);

    for (const data of correlatividadesLicIAData) {
      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = ? AND "prerrequisitoId" = ? LIMIT 1',
        {
          replacements: [data.materiaId, data.prerrequisitoId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Correlatividades', [
          {
            materiaId: data.materiaId,
            prerrequisitoId: data.prerrequisitoId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }

    console.log(
      'Seed de datos académicos completado exitosamente (idempotente)'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Correlatividades', null, {});
    await queryInterface.bulkDelete('PlanMaterias', null, {});
    await queryInterface.bulkDelete('Materias', null, {});
    await queryInterface.bulkDelete('PlanesDeEstudio', null, {});
    await queryInterface.bulkDelete('Carreras', null, {});
  },
};
