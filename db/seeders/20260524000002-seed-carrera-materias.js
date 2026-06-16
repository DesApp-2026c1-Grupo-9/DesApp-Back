'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const carrerasData = [
        { nombre: 'Licenciatura en Informática' },
        { nombre: 'Tecnicatura en Programación' },
        { nombre: 'Tecnicatura en Inteligencia Artificial' },
      ];

      const carrerasMap = {};
      for (const data of carrerasData) {
        const carrera = await queryInterface.sequelize.query(
          'SELECT id FROM "Carreras" WHERE nombre = ? LIMIT 1',
          {
            replacements: [data.nombre],
            type: queryInterface.sequelize.QueryTypes.SELECT,
            transaction,
          }
        );
        if (carrera.length > 0) {
          carrerasMap[data.nombre] = carrera[0].id;
        } else {
          console.warn(
            `Carrera "${data.nombre}" no encontrada. No se asignarán materias.`
          );
        }
      }

      const materiasData = {
        'Licenciatura en Informática': [
          'Matemática I',
          'Introducción a la Programación',
          'Organización de Computadoras',
          'Nuevos Entornos y Lenguajes',
          'Estructuras de Datos',
          'Programación con Objetos I',
          'Bases de Datos',
          'Inglés I',
          'Matemática II',
          'Programación con Objetos II',
          'Redes de Computadoras',
          'Sistemas Operativos',
          'Programación Funcional',
          'Construcción de Interfaces de Usuario',
          'Algoritmos',
          'Estrategias de Persistencia',
          'Laboratorio de Sistemas Operativos y Redes',
          'Análisis Matemático',
          'Lógica y Programación',
          'Elementos de Ingeniería de Software',
          'Seguridad de la Información',
          'Materia UNAHUR I',
          'Inglés II',
          'Matemática III',
          'Programación Concurrente',
          'Ingeniería de Requerimientos',
          'Desarrollo de Aplicaciones',
          'Probabilidad y Estadística',
          'Gestión de Proyectos de Desarrollo de Software',
          'Lenguajes Formales y Autómatas',
          'Programación con Objetos III',
          'Materia UNAHUR II',
          'Práctica Profesional Supervisada (PPS)',
          'Teoría de la Computación',
          'Arquitectura de Software I',
          'Sistemas Distribuidos y Tiempo Real',
          'Tesina de Licenciatura',
          'Materia Optativa I',
          'Características de Lenguajes de Programación',
          'Arquitectura de Software II',
          'Arquitectura de Computadoras',
          'Materia Optativa II',
          'Parseo y generación de código',
          'Ejercicio Profesional',
          'Tecnología y Sociedad',
        ],
        'Tecnicatura en Programación': [
          'Matemática para informática I',
          'Introducción a lógica y problemas computacionales',
          'Organización de computadoras I',
          'Nuevos entornos y lenguajes',
          'Taller de lenguajes de marcado y tecnologías web',
          'Programación estructurada',
          'Matemática para Informática II',
          'Inglés I',
          'Bases de Datos',
          'Programación con Objetos I',
          'Estructuras de Datos',
          'Materia UNAHUR',
          'Programación con Objetos II',
          'Electiva I',
          'Electiva II',
          'Inglés II',
          'Construcción de Interfaces de Usuario',
          'Estrategias de Persistencia',
          'Elementos de Ingeniería de Software',
        ],
        'Tecnicatura en Inteligencia Artificial': [
          'Matemática para informática I (IA)',
          'Introducción a lógica y problemas computacionales (IA)',
          'Introducción a la inteligencia artificial',
          'Nuevos entornos y lenguajes: la producción del conocimiento en la cultura digital',
          'Álgebra lineal',
          'Cálculo',
          'Taller de Programación I',
          'Tecnología y sociedad (IA)',
          'Inglés I (IA)',
          'Bases de datos (IA)',
          'Probabilidad y estadística (IA)',
          'Taller de Programación II',
          'Fundamentos de redes neuronales',
          'Fundamentos de ciencias de datos',
          'Aprendizaje Automático',
          'Electiva (IA)',
          'Taller de Programación III',
          'Inglés II (IA)',
          'Materia UNAHUR (IA)',
          'Aprendizaje Automático Avanzado',
          'Procesamiento de Imágenes y Visión por Computadora',
          'Proyecto integrador',
        ],
      };

      const carreraMateriasToInsert = [];

      for (const carreraNombre in materiasData) {
        const carreraId = carrerasMap[carreraNombre];
        if (!carreraId) continue;

        for (const materiaNombre of materiasData[carreraNombre]) {
          const materia = await queryInterface.sequelize.query(
            'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
            {
              replacements: [materiaNombre],
              type: queryInterface.sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          if (materia.length > 0) {
            carreraMateriasToInsert.push({
              carreraId: carreraId,
              materiaId: materia[0].id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            console.warn(
              `Materia "${materiaNombre}" no encontrada. No se asignará a "${carreraNombre}".`
            );
          }
        }
      }

      if (carreraMateriasToInsert.length > 0) {
        // Insertar solo si no existe ya (idempotente)
        for (const item of carreraMateriasToInsert) {
          const existing = await queryInterface.sequelize.query(
            'SELECT 1 FROM "CarreraMaterias" WHERE "carreraId" = ? AND "materiaId" = ? LIMIT 1',
            {
              replacements: [item.carreraId, item.materiaId],
              type: queryInterface.sequelize.QueryTypes.SELECT,
              transaction,
            }
          );
          if (!existing || existing.length === 0) {
            await queryInterface.bulkInsert('CarreraMaterias', [item], {
              transaction,
            });
          }
        }
      }

      await transaction.commit();
      console.log(
        'Seed de CarreraMaterias completado exitosamente (idempotente)'
      );
    } catch (error) {
      await transaction.rollback();
      console.error('Error en el seed de CarreraMaterias:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Para el down, queremos asegurarnos de eliminar solo las entradas creadas por este seeder
    // sin afectar otras posibles entradas manuales. Como no podemos saber los IDs
    // exactos de las materias y carreras que se usaron en el up sin un lookup,
    // y para mantener la idempotencia en el down de forma segura,
    // es mejor eliminar por el conjunto de carreras y materias que este seeder define.
    // Sin embargo, para simplificar y dado que el up es idempotente, se puede optar por
    // no tener un down que elimine selectivamente, o borrar todas las CarreraMaterias.
    // Mantenemos el comportamiento actual que no hace nada en el down
    // para evitar la eliminación accidental de datos.
    // Si se desea un borrado total, descomentar la siguiente línea:
    // await queryInterface.bulkDelete('CarreraMaterias', null, {});
  },
};
