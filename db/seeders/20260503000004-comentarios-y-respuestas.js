'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const hace1Hora = new Date(now.getTime() - 60 * 60 * 1000);
    const hace30Min = new Date(now.getTime() - 30 * 60 * 1000);
    const hace15Min = new Date(now.getTime() - 15 * 60 * 1000);
    const hace10Min = new Date(now.getTime() - 10 * 60 * 1000);

    // Obtener IDs de usuarios por email
    const usuarios = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Usuarios" WHERE email IN (?, ?, ?) ORDER BY id`,
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

    // Obtener posts NO automáticos con sus autores
    const posts = await queryInterface.sequelize.query(
      `SELECT n.id as "novedadId", n."autorId"
       FROM "Novedades" n
       WHERE n."esAutomatica" = false
       ORDER BY n.id
       LIMIT 3;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (posts.length < 3) {
      console.log('No hay suficientes posts no automáticos');
      return;
    }

    // Identificar el post de cada autor
    const postAna = posts.find((p) => p.autorId === anaId);
    const postCarlos = posts.find((p) => p.autorId === carlosId);
    const postMaria = posts.find((p) => p.autorId === mariaId);

    // Conexiones que se crearán después (seed 9):
    //   Ana ↔ Carlos, Ana ↔ María, Carlos ↔ María
    // Cada post recibe comentarios de las conexiones de su autor

    const comentarios = await queryInterface.bulkInsert(
      '"Comentarios"',
      [
        // Post de Ana → comentarios de Carlos y María (conexiones de Ana)
        {
          contenido: '¡Qué buen post! Me ayudó mucho.',
          novedadId: postAna?.novedadId,
          usuarioId: mariaId,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace1Hora,
          updatedAt: hace1Hora,
        },
        {
          contenido: 'Totalmente de acuerdo, muy útil.',
          novedadId: postAna?.novedadId,
          usuarioId: carlosId,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace15Min,
          updatedAt: hace15Min,
        },
        // Post de Carlos → comentarios de Ana y María (conexiones de Carlos)
        {
          contenido: 'Gracias por compartir, justo lo estaba necesitando.',
          novedadId: postCarlos?.novedadId,
          usuarioId: mariaId,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace30Min,
          updatedAt: hace30Min,
        },
        {
          contenido: 'Mostrame dónde está el repo porfa.',
          novedadId: postCarlos?.novedadId,
          usuarioId: anaId,
          comentarioPadreId: null,
          editedAt: hace10Min,
          createdAt: hace1Hora,
          updatedAt: hace10Min,
        },
        // Post de María → comentario de Ana (conexión de María)
        {
          contenido:
            'Creo que sí, yo cursé así el cuatrimestre pasado. Fijate en el plan de estudios.',
          novedadId: postMaria?.novedadId,
          usuarioId: anaId,
          comentarioPadreId: null,
          editedAt: hace30Min,
          createdAt: hace1Hora,
          updatedAt: hace30Min,
        },
      ],
      { returning: true }
    );

    // Respuesta al primer comentario del post de Ana (hecho por María)
    const primerComentario = await queryInterface.sequelize.query(
      `SELECT id FROM "Comentarios" WHERE "novedadId" = ? ORDER BY id LIMIT 1;`,
      {
        replacements: [postAna?.novedadId],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (primerComentario[0]?.id) {
      await queryInterface.bulkInsert('"Comentarios"', [
        {
          contenido: 'Gracias! Me costó pero valió la pena editarlo.',
          novedadId: postAna?.novedadId,
          usuarioId: anaId,
          comentarioPadreId: primerComentario[0].id,
          editedAt: null,
          createdAt: hace15Min,
          updatedAt: hace15Min,
        },
      ]);
    }

    // Actualizar contadores de comentarios en TODAS las novedades (incluye respuestas)
    const todasLasNovedades = await queryInterface.sequelize.query(
      `SELECT id FROM "Novedades";`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const n of todasLasNovedades) {
      await queryInterface.sequelize.query(
        `UPDATE "Novedades" SET "comentariosCount" = (
           SELECT COUNT(*) FROM "Comentarios" WHERE "novedadId" = ?
         ) WHERE id = ?;`,
        { replacements: [n.id, n.id] }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('"Comentarios"', null, {});
  },
};
