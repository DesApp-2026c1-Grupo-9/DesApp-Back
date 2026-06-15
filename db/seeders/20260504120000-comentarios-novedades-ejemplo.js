'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const hace1Hora = new Date(now.getTime() - 60 * 60 * 1000);
    const hace30Min = new Date(now.getTime() - 30 * 60 * 1000);
    const hace15Min = new Date(now.getTime() - 15 * 60 * 1000);

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

    // Obtener posts NO automáticos que NO tienen ningún comentario
    const postsSinComentarios = await queryInterface.sequelize.query(
      `SELECT n.id as "novedadId", n."autorId"
       FROM "Novedades" n
       WHERE n."esAutomatica" = false
         AND NOT EXISTS (
           SELECT 1 FROM "Comentarios" c WHERE c."novedadId" = n.id
         )
       ORDER BY n.id;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (postsSinComentarios.length === 0) {
      console.log('Todos los posts no automáticos ya tienen comentarios');
      return;
    }

    const nuevosComentarios = [];

    for (const post of postsSinComentarios) {
      let usuarioIdComentario = null;

      // Asignar un comentarista que sea conexión del autor
      // Conexiones aceptadas: Ana↔Carlos, Ana↔María, Carlos↔María
      if (post.autorId === anaId) {
        usuarioIdComentario = mariaId;
      } else if (post.autorId === carlosId) {
        usuarioIdComentario = anaId;
      } else if (post.autorId === mariaId) {
        usuarioIdComentario = anaId;
      }

      if (!usuarioIdComentario) continue;

      const contenidos = [
        'Qué interesante, gracias por compartir!',
        'Me sirve un montón, gracias!',
        'Buenísimo, justo venía a preguntar esto.',
        'Coincido totalmente, muy buena iniciativa.',
        'Yo también pasé por eso, ánimo!',
      ];
      const contenido = contenidos[post.novedadId % contenidos.length];

      nuevosComentarios.push({
        contenido,
        novedadId: post.novedadId,
        usuarioId: usuarioIdComentario,
        comentarioPadreId: null,
        editedAt: null,
        createdAt: new Date(hace1Hora.getTime() - post.novedadId * 60000),
        updatedAt: new Date(hace1Hora.getTime() - post.novedadId * 60000),
      });
    }

    if (nuevosComentarios.length > 0) {
      await queryInterface.bulkInsert('"Comentarios"', nuevosComentarios);
    }

    // Actualizar contadores de comentarios en las novedades afectadas
    for (const post of postsSinComentarios) {
      await queryInterface.sequelize.query(
        `UPDATE "Novedades" SET "comentariosCount" = (
           SELECT COUNT(*) FROM "Comentarios" WHERE "novedadId" = ?
         ) WHERE id = ?;`,
        { replacements: [post.novedadId, post.novedadId] }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No eliminamos nada porque el down del seeder original ya lo hace
  },
};
