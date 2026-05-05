'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Obtener materias existentes
      const materias = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "Materias" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!materias || materias.length === 0) {
        throw new Error('No hay materias. Ejecute primero el seed de datos académicos.');
      }

      // Obtener usuarios estudiantes existentes
      const usuarios = await queryInterface.sequelize.query(
        'SELECT id, nombre, apellido, email FROM "Usuarios" WHERE rol = \'estudiante\' ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!usuarios || usuarios.length === 0) {
        throw new Error('No hay usuarios estudiantes. Ejecute primero el seed de estudiantes.');
      }

      console.log(`Encontradas ${materias.length} materias y ${usuarios.length} estudiantes`);

      const now = new Date();
      const mañana = new Date(now);
      mañana.setDate(mañana.getDate() + 1);
      const proximaSemana = new Date(now);
      proximaSemana.setDate(proximaSemana.getDate() + 7);
      const enDosSemanas = new Date(now);
      enDosSemanas.setDate(enDosSemanas.getDate() + 14);

      // Crear sesiones de estudio
      const sesiones = await queryInterface.bulkInsert(
        'Sesiones',
        [
          {
            materiaId: materias[0].id, // Matemática I
            creadorId: usuarios[0].id, // Ana García
            tema: 'Repaso integral para primer parcial',
            tipo: 'presencial',
            ubicacion: 'Aula 204, Universidad de Hurlingham',
            link: null,
            fechaHora: mañana,
            duracion: 120,
            cupos: 5,
            descripcion: 'Repasaremos límites, derivadas y aplicaciones. Traer apuntes y calculadora.',
            necesidadAprobacion: false,
            estado: 'activa',
            createdAt: now,
            updatedAt: now,
          },
          {
            materiaId: materias[1].id, // Programación I
            creadorId: usuarios[1].id, // Carlos Rodríguez
            tema: 'Práctica de algoritmos y estructuras de control',
            tipo: 'virtual',
            link: 'https://meet.google.com/abc-defg-hij',
            ubicacion: null,
            fechaHora: proximaSemana,
            duracion: 90,
            cupos: 8,
            descripcion: 'Vamos a resolver ejercicios de la guía 3. Nivel principiante.',
            necesidadAprobacion: true,
            estado: 'activa',
            createdAt: now,
            updatedAt: now,
          },
          {
            materiaId: materias[2].id, // Matemática II
            creadorId: usuarios[2].id, // María González
            tema: 'Series y sucesiones - Ejercicios avanzados',
            tipo: 'virtual',
            link: 'https://zoom.us/j/1234567890',
            ubicacion: null,
            fechaHora: enDosSemanas,
            duracion: 150,
            cupos: null, // Sin límite
            descripcion: 'Sesión de nivel avanzado. Traer ejercicios resueltos para discutir.',
            necesidadAprobacion: false,
            estado: 'activa',
            createdAt: now,
            updatedAt: now,
          },
          {
            materiaId: materias[3].id, // Programación II
            creadorId: usuarios[3].id, // Juan Martínez
            tema: 'Introducción a bases de datos con Node.js',
            tipo: 'presencial',
            ubicacion: 'Biblioteca Central, Sala de Computadoras',
            link: null,
            fechaHora: mañana,
            duracion: 180,
            cupos: 6,
            descripcion: 'Trabajaremos con PostgreSQL y Sequelize. Bring your laptop!',
            necesidadAprobacion: true,
            estado: 'activa',
            createdAt: now,
            updatedAt: now,
          },
          {
            materiaId: materias[4].id, // Algoritmos
            creadorId: usuarios[4].id, // Sofía López
            tema: 'Análisis de complejidad temporal y espacial',
            tipo: 'virtual',
            link: 'https://teams.microsoft.com/l/meetup-join/abc123',
            ubicacion: null,
            fechaHora: proximaSemana,
            duracion: 100,
            cupos: 10,
            descripcion: 'Estudiaremos Notación O, Omega y Theta con ejemplos prácticos.',
            necesidadAprobacion: false,
            estado: 'activa',
            createdAt: now,
            updatedAt: now,
          },
        ],
        { returning: true }
      );

      console.log(`Creadas ${sesiones.length} sesiones de estudio`);

      // Crear participantes para las sesiones
      const participantes = [];

      // Sesión 1 (Matemática I): Ana + 3 participantes
      participantes.push(
        { sesionId: sesiones[0].id, estudianteId: usuarios[1].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[0].id, estudianteId: usuarios[4].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[0].id, estudianteId: usuarios[6].id, estado: 'pendiente', createdAt: now, updatedAt: now }
      );

      // Sesión 2 (Programación I): Carlos + 2 participantes (necesita aprobación)
      participantes.push(
        { sesionId: sesiones[1].id, estudianteId: usuarios[2].id, estado: 'pendiente', createdAt: now, updatedAt: now },
        { sesionId: sesiones[1].id, estudianteId: usuarios[5].id, estado: 'pendiente', createdAt: now, updatedAt: now }
      );

      // Sesión 3 (Matemática II): María + 4 participantes
      participantes.push(
        { sesionId: sesiones[2].id, estudianteId: usuarios[0].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[2].id, estudianteId: usuarios[3].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[2].id, estudianteId: usuarios[7].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[2].id, estudianteId: usuarios[9].id, estado: 'rechazado', createdAt: now, updatedAt: now }
      );

      // Sesión 4 (Programación II): Juan + 2 participantes (necesita aprobación)
      participantes.push(
        { sesionId: sesiones[3].id, estudianteId: usuarios[4].id, estado: 'pendiente', createdAt: now, updatedAt: now },
        { sesionId: sesiones[3].id, estudianteId: usuarios[8].id, estado: 'pendiente', createdAt: now, updatedAt: now }
      );

      // Sesión 5 (Algoritmos): Sofía + 3 participantes
      participantes.push(
        { sesionId: sesiones[4].id, estudianteId: usuarios[1].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[4].id, estudianteId: usuarios[3].id, estado: 'aprobado', createdAt: now, updatedAt: now },
        { sesionId: sesiones[4].id, estudianteId: usuarios[7].id, estado: 'aprobado', createdAt: now, updatedAt: now }
      );

      await queryInterface.bulkInsert('SesionParticipantes', participantes);

      console.log(`Creados ${participantes.length} participantes en sesiones`);
      console.log('Seed de sesiones completado exitosamente');
    } catch (error) {
      console.error('Error in seed-sesiones:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SesionParticipantes', null, {});
    await queryInterface.bulkDelete('Sesiones', null, {});
  },
};
