'use strict';

module.exports = {
  up: async (queryInterface) => {
    const findMateriaId = async (nombre) => {
      const rows = await queryInterface.sequelize.query(
        'SELECT id FROM "Materias" WHERE nombre = ? LIMIT 1',
        {
          replacements: [nombre],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      return rows?.[0]?.id || null;
    };

    const correlativas = [
      // Licenciatura en Informatica
      ['Organización de Computadoras', 'Introducción a la Programación'],
      ['Estructuras de Datos', 'Introducción a la Programación'],
      ['Programación con Objetos I', 'Introducción a la Programación'],
      ['Bases de Datos', 'Matemática I'],
      ['Matemática II', 'Matemática I'],
      ['Inglés II', 'Inglés I'],
      ['Programación con Objetos II', 'Programación con Objetos I'],
      ['Redes de Computadoras', 'Organización de Computadoras'],
      ['Sistemas Operativos', 'Introducción a la Programación'],
      ['Sistemas Operativos', 'Organización de Computadoras'],
      ['Programación Funcional', 'Estructuras de Datos'],
      ['Construcción de Interfaces de Usuario', 'Programación con Objetos II'],
      ['Algoritmos', 'Programación Funcional'],
      ['Estrategias de Persistencia', 'Bases de Datos'],
      ['Estrategias de Persistencia', 'Programación con Objetos II'],
      ['Laboratorio de Sistemas Operativos y Redes', 'Redes de Computadoras'],
      ['Laboratorio de Sistemas Operativos y Redes', 'Sistemas Operativos'],
      ['Análisis Matemático', 'Matemática II'],
      ['Lógica y Programación', 'Matemática I'],
      ['Lógica y Programación', 'Introducción a la Programación'],
      ['Elementos de Ingeniería de Software', 'Programación con Objetos II'],
      [
        'Seguridad de la Información',
        'Laboratorio de Sistemas Operativos y Redes',
      ],
      ['Matemática III', 'Análisis Matemático'],
      ['Programación Concurrente', 'Estructuras de Datos'],
      ['Ingeniería de Requerimientos', 'Elementos de Ingeniería de Software'],
      ['Desarrollo de Aplicaciones', 'Construcción de Interfaces de Usuario'],
      ['Desarrollo de Aplicaciones', 'Estrategias de Persistencia'],
      ['Desarrollo de Aplicaciones', 'Elementos de Ingeniería de Software'],
      ['Probabilidad y Estadística', 'Matemática III'],
      [
        'Gestión de Proyectos de Desarrollo de Software',
        'Ingeniería de Requerimientos',
      ],
      ['Lenguajes Formales y Autómatas', 'Lógica y Programación'],
      ['Programación con Objetos III', 'Programación con Objetos II'],
      ['Práctica Profesional Supervisada (PPS)', 'Programación Funcional'],
      [
        'Práctica Profesional Supervisada (PPS)',
        'Laboratorio de Sistemas Operativos y Redes',
      ],
      ['Práctica Profesional Supervisada (PPS)', 'Desarrollo de Aplicaciones'],
      ['Práctica Profesional Supervisada (PPS)', 'Programación Concurrente'],
      ['Teoría de la Computación', 'Lenguajes Formales y Autómatas'],
      ['Arquitectura de Software I', 'Elementos de Ingeniería de Software'],
      ['Arquitectura de Software I', 'Desarrollo de Aplicaciones'],
      ['Arquitectura de Software I', 'Programación Concurrente'],
      [
        'Arquitectura de Software I',
        'Gestión de Proyectos de Desarrollo de Software',
      ],
      [
        'Sistemas Distribuidos y Tiempo Real',
        'Laboratorio de Sistemas Operativos y Redes',
      ],
      ['Sistemas Distribuidos y Tiempo Real', 'Programación Concurrente'],
      [
        'Tesina de Licenciatura',
        'Gestión de Proyectos de Desarrollo de Software',
      ],
      ['Tesina de Licenciatura', 'Lenguajes Formales y Autómatas'],
      ['Tesina de Licenciatura', 'Programación con Objetos III'],
      ['Características de Lenguajes de Programación', 'Lógica y Programación'],
      ['Arquitectura de Software II', 'Arquitectura de Software I'],
      ['Arquitectura de Software II', 'Sistemas Distribuidos y Tiempo Real'],
      [
        'Arquitectura de Computadoras',
        'Laboratorio de Sistemas Operativos y Redes',
      ],
      ['Parseo y generación de código', 'Lenguajes Formales y Autómatas'],
      [
        'Parseo y generación de código',
        'Características de Lenguajes de Programación',
      ],
      ['Tecnología y Sociedad', 'Ejercicio Profesional'],

      // Tecnicatura en Programacion
      [
        'Programación estructurada',
        'Introducción a lógica y problemas computacionales',
      ],
      ['Matemática para Informática II', 'Matemática para informática I'],
      ['Inglés II', 'Inglés I'],
      ['Bases de Datos', 'Matemática para informática I'],
      ['Programación con Objetos I', 'Programación estructurada'],
      ['Estructuras de Datos', 'Programación estructurada'],
      ['Programación con Objetos II', 'Programación con Objetos I'],
      ['Construcción de Interfaces de Usuario', 'Programación con Objetos II'],
      ['Estrategias de Persistencia', 'Bases de Datos'],
      ['Estrategias de Persistencia', 'Programación con Objetos II'],
      ['Elementos de Ingeniería de Software', 'Programación con Objetos II'],

      // Tecnicatura en IA
      ['Álgebra lineal', 'Matemática para informática I (IA)'],
      ['Cálculo', 'Matemática para informática I (IA)'],
      ['Inglés II (IA)', 'Inglés I (IA)'],
      [
        'Taller de Programación I',
        'Introducción a lógica y problemas computacionales (IA)',
      ],
      ['Bases de datos (IA)', 'Taller de Programación I'],
      ['Probabilidad y estadística (IA)', 'Álgebra lineal'],
      ['Probabilidad y estadística (IA)', 'Cálculo'],
      ['Taller de Programación II', 'Taller de Programación I'],
      [
        'Fundamentos de redes neuronales',
        'Introducción a la inteligencia artificial',
      ],
      ['Fundamentos de redes neuronales', 'Álgebra lineal'],
      ['Fundamentos de redes neuronales', 'Taller de Programación I'],
      ['Fundamentos de ciencias de datos', 'Probabilidad y estadística (IA)'],
      ['Fundamentos de ciencias de datos', 'Bases de datos (IA)'],
      ['Aprendizaje Automático', 'Probabilidad y estadística (IA)'],
      ['Aprendizaje Automático', 'Fundamentos de redes neuronales'],
      ['Aprendizaje Automático', 'Taller de Programación II'],
      ['Taller de Programación III', 'Taller de Programación II'],
      ['Aprendizaje Automático Avanzado', 'Aprendizaje Automático'],
      [
        'Procesamiento de Imágenes y Visión por Computadora',
        'Aprendizaje Automático',
      ],
      [
        'Procesamiento de Imágenes y Visión por Computadora',
        'Taller de Programación III',
      ],
      ['Proyecto integrador', 'Aprendizaje Automático Avanzado'],
      [
        'Proyecto integrador',
        'Procesamiento de Imágenes y Visión por Computadora',
      ],
    ];

    for (const [materia, prerrequisito] of correlativas) {
      const materiaId = await findMateriaId(materia);
      const prerrequisitoId = await findMateriaId(prerrequisito);

      if (!materiaId || !prerrequisitoId) {
        continue;
      }

      const existing = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Correlatividades" WHERE "materiaId" = ? AND "prerrequisitoId" = ? LIMIT 1',
        {
          replacements: [materiaId, prerrequisitoId],
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Correlatividades', [
          {
            materiaId,
            prerrequisitoId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  down: async () => {
    // Seeder incremental: no-op para evitar borrar correlatividades en uso.
  },
};
