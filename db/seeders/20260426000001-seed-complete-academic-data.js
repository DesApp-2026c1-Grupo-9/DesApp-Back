'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear las 3 carreras
    const carreras = await queryInterface.bulkInsert(
      'Carreras',
      [
        {
          nombre: 'Licenciatura en Informática',
          titulo: 'Licenciado en Informática',
          instituto: 'Universidad Nacional de Hurlingham',
          duracion: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Tecnicatura en Programación',
          titulo: 'Técnico en Programación',
          instituto: 'Universidad Nacional de Hurlingham',
          duracion: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Tecnicatura en Inteligencia Artificial',
          titulo: 'Licenciado en Inteligencia Artificial',
          instituto: 'Universidad Nacional de Hurlingham',
          duracion: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // Crear planes de estudio
    const planes = await queryInterface.bulkInsert(
      'PlanesDeEstudio',
      [
        {
          nombre: 'Plan 2026 - Licenciatura en Informática',
          estado: 'vigente',
          carreraId: carreras[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Plan 2026 - Tecnicatura en Programación',
          estado: 'vigente',
          carreraId: carreras[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Plan 2026 - Tecnicatura en IA',
          estado: 'vigente',
          carreraId: carreras[2].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    const [planLicInfo, planTecProg, planLicIA] = planes;

    // MATERIAS LICENCIATURA EN INFORMÁTICA
    const materiasLicInfo = await queryInterface.bulkInsert(
      'Materias',
      [
        // 1° año
        {
          nombre: 'Matemática I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Introducción a la Programación',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Organización de Computadoras',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Nuevos Entornos y Lenguajes',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Estructuras de Datos',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación con Objetos I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Bases de Datos',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // 2° año
        {
          nombre: 'Matemática II',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación con Objetos II',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Redes de Computadoras',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Sistemas Operativos',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación Funcional',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Construcción de Interfaces de Usuario',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Algoritmos',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Estrategias de Persistencia',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Laboratorio de Sistemas Operativos y Redes',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // 3° año
        {
          nombre: 'Análisis Matemático',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Lógica y Programación',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Elementos de Ingeniería de Software',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Seguridad de la Información',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia UNAHUR I',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés II',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Matemática III',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación Concurrente',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Ingeniería de Requerimientos',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Desarrollo de Aplicaciones',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // 4° año
        {
          nombre: 'Probabilidad y Estadística',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Gestión de Proyectos de Desarrollo de Software',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Lenguajes Formales y Autómatas',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación con Objetos III',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia UNAHUR II',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Práctica Profesional Supervisada (PPS)',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Teoría de la Computación',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Arquitectura de Software I',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Sistemas Distribuidos y Tiempo Real',
          anio: 4,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // 5° año
        {
          nombre: 'Tesina de Licenciatura',
          anio: 5,
          tipo: 'anual',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia Optativa I',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Características de Lenguajes de Programación',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Arquitectura de Software II',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Arquitectura de Computadoras',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia Optativa II',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Parseo y generación de código',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Ejercicio Profesional',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Tecnología y Sociedad',
          anio: 5,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // MATERIAS TECNICATURA EN PROGRAMACIÓN
    const materiasTecProg = await queryInterface.bulkInsert(
      'Materias',
      [
        {
          nombre: 'Matemática para informática I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Introducción a lógica y problemas computacionales',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Organización de computadoras I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Nuevos entornos y lenguajes',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Taller de lenguajes de marcado y tecnologías web',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación estructurada',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Matemática para Informática II',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés I (Tecnicatura)',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Bases de Datos (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación de objetos I (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Estructuras de datos (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia UNAHUR (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Programación de objetos II (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Electiva I',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Electiva II',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés II (Tecnicatura)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Construcción de interfaces de usuario (Tecnicatura)',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Estrategias de persistencia (Tecnicatura)',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Elementos de ingeniería de software (Tecnicatura)',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // MATERIAS LICENCIATURA EN IA
    const materiasLicIA = await queryInterface.bulkInsert(
      'Materias',
      [
        {
          nombre: 'Matemática para informática I (IA)',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Introducción a lógica y problemas computacionales (IA)',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Introducción a la inteligencia artificial',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre:
            'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Álgebra lineal',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Cálculo',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Taller de Programación I',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Tecnología y sociedad (IA)',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés I (IA)',
          anio: 1,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Bases de datos (IA)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Probabilidad y estadística (IA)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Taller de Programación II',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Fundamentos de redes neuronales',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Fundamentos de ciencias de datos',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Aprendizaje Automático',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Electiva (IA)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Taller de Programación III',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Inglés II (IA)',
          anio: 2,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Materia UNAHUR (IA)',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Aprendizaje Automático Avanzado',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Procesamiento de Imágenes y Visión por Computadora',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Proyecto integrador',
          anio: 3,
          tipo: 'cuatrimestral',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // Asignar materias a planes de estudio
    const planMateriasLicInfo = materiasLicInfo.map((m) => ({
      planId: planLicInfo.id,
      materiaId: m.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const planMateriasTecProg = materiasTecProg.map((m) => ({
      planId: planTecProg.id,
      materiaId: m.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const planMateriasLicIA = materiasLicIA.map((m) => ({
      planId: planLicIA.id,
      materiaId: m.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('PlanMaterias', [
      ...planMateriasLicInfo,
      ...planMateriasTecProg,
      ...planMateriasLicIA,
    ]);

    // CORRELATIVIDADES LICENCIATURA EN INFORMÁTICA
    const correlatividadesLicInfo = [];

    // Primer año como base
    const matI = materiasLicInfo.find((m) => m.nombre === 'Matemática I');
    const introProg = materiasLicInfo.find(
      (m) => m.nombre === 'Introducción a la Programación'
    );
    const orgComp = materiasLicInfo.find(
      (m) => m.nombre === 'Organización de Computadoras'
    );
    const estructDatos = materiasLicInfo.find(
      (m) => m.nombre === 'Estructuras de Datos'
    );
    const progObjI = materiasLicInfo.find(
      (m) => m.nombre === 'Programación con Objetos I'
    );
    const bdatos = materiasLicInfo.find((m) => m.nombre === 'Bases de Datos');
    const inglesI = materiasLicInfo.find((m) => m.nombre === 'Inglés I');

    // Segundo año
    const matII = materiasLicInfo.find((m) => m.nombre === 'Matemática II');
    const inglesII = materiasLicInfo.find((m) => m.nombre === 'Inglés II');
    const progObjII = materiasLicInfo.find(
      (m) => m.nombre === 'Programación con Objetos II'
    );
    const redes = materiasLicInfo.find(
      (m) => m.nombre === 'Redes de Computadoras'
    );
    const sisOp = materiasLicInfo.find(
      (m) => m.nombre === 'Sistemas Operativos'
    );
    const algoritmos = materiasLicInfo.find((m) => m.nombre === 'Algoritmos');
    const interfaces = materiasLicInfo.find(
      (m) => m.nombre === 'Construcción de Interfaces de Usuario'
    );
    const persistencia = materiasLicInfo.find(
      (m) => m.nombre === 'Estrategias de Persistencia'
    );

    // Correlatividades realistas
    correlatividadesLicInfo.push(
      { materiaId: matII.id, prerrequisitoId: matI.id },
      { materiaId: inglesII.id, prerrequisitoId: inglesI.id }, // Inglés II requiere Inglés I
      { materiaId: estructDatos.id, prerrequisitoId: introProg.id },
      { materiaId: progObjI.id, prerrequisitoId: introProg.id },
      { materiaId: progObjII.id, prerrequisitoId: progObjI.id },
      { materiaId: algoritmos.id, prerrequisitoId: estructDatos.id },
      { materiaId: interfaces.id, prerrequisitoId: progObjII.id },
      { materiaId: persistencia.id, prerrequisitoId: bdatos.id },
      { materiaId: persistencia.id, prerrequisitoId: progObjII.id },
      { materiaId: redes.id, prerrequisitoId: orgComp.id },
      { materiaId: sisOp.id, prerrequisitoId: orgComp.id }
    );

    await queryInterface.bulkInsert(
      'Correlatividades',
      correlatividadesLicInfo.map((c) => ({
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // CORRELATIVIDADES TECNICATURA EN PROGRAMACIÓN
    const correlatividadesTecProg = [];

    const matInfoI = materiasTecProg.find(
      (m) => m.nombre === 'Matemática para informática I'
    );
    const logicaProb = materiasTecProg.find(
      (m) => m.nombre === 'Introducción a lógica y problemas computacionales'
    );
    const progEst = materiasTecProg.find(
      (m) => m.nombre === 'Programación estructurada'
    );
    const matInfoII = materiasTecProg.find(
      (m) => m.nombre === 'Matemática para Informática II'
    );
    const progObjITec = materiasTecProg.find(
      (m) => m.nombre === 'Programación de objetos I (Tecnicatura)'
    );
    const progObjIITec = materiasTecProg.find(
      (m) => m.nombre === 'Programación de objetos II (Tecnicatura)'
    );
    const inglesITec = materiasTecProg.find(
      (m) => m.nombre === 'Inglés I (Tecnicatura)'
    );
    const inglesIITec = materiasTecProg.find(
      (m) => m.nombre === 'Inglés II (Tecnicatura)'
    );

    correlatividadesTecProg.push(
      { materiaId: matInfoII.id, prerrequisitoId: matInfoI.id },
      { materiaId: inglesIITec.id, prerrequisitoId: inglesITec.id }, // Inglés II requiere Inglés I
      { materiaId: progEst.id, prerrequisitoId: logicaProb.id },
      { materiaId: progObjITec.id, prerrequisitoId: progEst.id },
      { materiaId: progObjIITec.id, prerrequisitoId: progObjITec.id }
    );

    await queryInterface.bulkInsert(
      'Correlatividades',
      correlatividadesTecProg.map((c) => ({
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // CORRELATIVIDADES LICENCIATURA EN IA
    const correlatividadesLicIA = [];

    const matInfoIIA = materiasLicIA.find(
      (m) => m.nombre === 'Matemática para informática I (IA)'
    );
    const tallerProgI = materiasLicIA.find(
      (m) => m.nombre === 'Taller de Programación I'
    );
    const algebra = materiasLicIA.find((m) => m.nombre === 'Álgebra lineal');
    const calculo = materiasLicIA.find((m) => m.nombre === 'Cálculo');
    const introIA = materiasLicIA.find(
      (m) => m.nombre === 'Introducción a la inteligencia artificial'
    );
    const probEstIA = materiasLicIA.find(
      (m) => m.nombre === 'Probabilidad y estadística (IA)'
    );
    const tallerProgII = materiasLicIA.find(
      (m) => m.nombre === 'Taller de Programación II'
    );
    const redesNeuro = materiasLicIA.find(
      (m) => m.nombre === 'Fundamentos de redes neuronales'
    );
    const aprendAuto = materiasLicIA.find(
      (m) => m.nombre === 'Aprendizaje Automático'
    );
    const inglesIIA = materiasLicIA.find((m) => m.nombre === 'Inglés I (IA)');
    const inglesIIIA = materiasLicIA.find((m) => m.nombre === 'Inglés II (IA)');

    correlatividadesLicIA.push(
      { materiaId: algebra.id, prerrequisitoId: matInfoIIA.id },
      { materiaId: calculo.id, prerrequisitoId: matInfoIIA.id },
      { materiaId: inglesIIIA.id, prerrequisitoId: inglesIIA.id }, // Inglés II (IA) requiere Inglés I (IA)
      {
        materiaId: tallerProgI.id,
        prerrequisitoId: materiasLicIA.find(
          (m) =>
            m.nombre ===
            'Introducción a lógica y problemas computacionales (IA)'
        ).id,
      },
      { materiaId: probEstIA.id, prerrequisitoId: algebra.id },
      { materiaId: probEstIA.id, prerrequisitoId: calculo.id },
      { materiaId: tallerProgII.id, prerrequisitoId: tallerProgI.id },
      { materiaId: redesNeuro.id, prerrequisitoId: introIA.id },
      { materiaId: redesNeuro.id, prerrequisitoId: algebra.id },
      { materiaId: redesNeuro.id, prerrequisitoId: tallerProgI.id },
      { materiaId: aprendAuto.id, prerrequisitoId: probEstIA.id },
      { materiaId: aprendAuto.id, prerrequisitoId: redesNeuro.id }
    );

    await queryInterface.bulkInsert(
      'Correlatividades',
      correlatividadesLicIA.map((c) => ({
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // RELACIONES ESTUDIANTE-CARRERA
    // Obtener los estudiantes existentes
    const estudiantesExistentes = await queryInterface.sequelize.query(
      'SELECT id FROM "Estudiantes"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    console.log('Estudiantes encontrados:', estudiantesExistentes.length);

    if (estudiantesExistentes.length > 0) {
      // Asignar Diego Fernández (id 6) a Tecnicatura en IA
      const diego = estudiantesExistentes.find((e) => e.id === 6);
      if (diego) {
        await queryInterface.bulkInsert('EstudianteCarreras', [
          {
            estudianteId: 6,
            carreraId: carreras[2].id, // Tecnicatura en IA
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        console.log('Diego Fernández asignado a Tecnicatura en IA');
      }

      // Asignar otros estudiantes a diferentes carreras
      const otrosEstudiantes = estudiantesExistentes.filter((e) => e.id !== 6);
      const relacionesAdicionales = [];

      for (let i = 0; i < otrosEstudiantes.length && i < 6; i++) {
        const carreraIndex = i % 3; // Distribuir entre las 3 carreras
        relacionesAdicionales.push({
          estudianteId: otrosEstudiantes[i].id,
          carreraId: carreras[carreraIndex].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (relacionesAdicionales.length > 0) {
        await queryInterface.bulkInsert(
          'EstudianteCarreras',
          relacionesAdicionales
        );
        console.log(
          `${relacionesAdicionales.length} estudiantes adicionales asignados a carreras`
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('EstudianteCarreras', null, {});
    await queryInterface.bulkDelete('Correlatividades', null, {});
    await queryInterface.bulkDelete('PlanMaterias', null, {});
    await queryInterface.bulkDelete('Materias', null, {});
    await queryInterface.bulkDelete('PlanesDeEstudio', null, {});
    await queryInterface.bulkDelete('Carreras', null, {});
  },
};
