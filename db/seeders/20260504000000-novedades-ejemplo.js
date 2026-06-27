'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener materias existentes
    const materias = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM "Materias" ORDER BY id LIMIT 10;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!materias || materias.length === 0) {
      console.log('No hay materias disponibles para asignar a las novedades');
      return;
    }

    // Asignar materias para los ejemplos
    const materiaProg =
      materias.find((m) => m.nombre.includes('Programación')) || materias[0];
    const materiaMat =
      materias.find((m) => m.nombre.includes('Matemática')) || materias[1];
    const materiaBD =
      materias.find((m) => m.nombre.includes('Bases de Datos')) || materias[2];

    // Obtener IDs de estudiantes por email
    const usuarios = await queryInterface.sequelize.query(
      `SELECT e.id, u.email FROM "Estudiantes" e INNER JOIN "Usuarios" u ON e."usuarioId" = u.id WHERE u.email IN (?, ?, ?) ORDER BY e.id`,
      {
        replacements: [
          'ana.garcia@estudiante.unahur.edu.ar',
          'carlos.rodriguez@estudiante.unahur.edu.ar',
          'maria.gonzalez@estudiante.unahur.edu.ar',
        ],
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    const anaId = usuarios.find((u) => u.email.includes('ana'))?.id;
    const carlosId = usuarios.find((u) => u.email.includes('carlos'))?.id;
    const mariaId = usuarios.find((u) => u.email.includes('maria'))?.id;

    await queryInterface.bulkInsert('Novedades', [
      {
        tipo: 'posteo',
        titulo: '¡Busco grupo de estudio para Álgebra!',
        contenido:
          'Hola a todos! Estoy buscando compañeros para armar un grupo de estudio para Álgebra. Estamos en la semana 8 y necesito reforzar espacios vectoriales. ¿Quién se suma?',
        imagenUrl: null,
        materiaId: materiaMat?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: anaId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'aprobacion',
        titulo: 'Aprobé Introducción a la Programación!',
        contenido:
          'Después de mucho esfuerzo, finalmente aprobé Introducción a la Programación con 8 puntos. ¡Muy feliz!',
        imagenUrl: null,
        materiaId: materiaProg?.id,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: carlosId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'inscripcion',
        titulo: 'Me inscribí a Bases de Datos',
        contenido:
          'Este cuatrimestre me inscribí a Bases de Datos. ¡Vamos con todo!',
        imagenUrl: null,
        materiaId: materiaBD?.id,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: anaId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'posteo',
        titulo: 'Apuntes de Programación disponibles',
        contenido:
          'Comparto mis apuntes de Programación organizados por unidades. Están en el repositorio de la materia. ¡Espero que les sirvan!',
        imagenUrl: 'https://example.com/imagen-prog.jpg',
        materiaId: materiaProg?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: mariaId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'regularizacion',
        titulo: 'Regularicé Matemática I',
        contenido:
          'Regularicé Matemática I con 7 puntos. Ahora puedo cursar materias que la tienen como correlativa.',
        imagenUrl: null,
        materiaId: materiaMat?.id,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: carlosId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'posteo',
        titulo: '¿Alguien tiene el TP2 de Programación?',
        contenido:
          'Estoy teniendo problemas con el ejercicio 3 del TP2. ¿Alguien lo pudo resolver? Me vendría bien una mano.',
        imagenUrl: null,
        materiaId: materiaProg?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        estudianteId: mariaId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Novedades', null, {});
  },
};
