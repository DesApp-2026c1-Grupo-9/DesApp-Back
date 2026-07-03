'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Obtener IDs de novedades y comentarios
    const novedades = await queryInterface.sequelize.query(
      'SELECT id, "estudianteId" FROM "Novedades" ORDER BY id DESC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const comentarios = await queryInterface.sequelize.query(
      'SELECT id, "usuarioId" FROM "Comentarios" ORDER BY id DESC LIMIT 10;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!novedades || novedades.length === 0) {
      console.log('No hay novedades para agregar likes');
      return;
    }

    // Obtener IDs reales de Estudiantes
    const estudiantes = await queryInterface.sequelize.query(
      'SELECT id FROM "Estudiantes" ORDER BY id LIMIT 3;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const estudianteIds = estudiantes.map((e) => e.id);

    if (estudianteIds.length === 0) {
      console.log('No hay estudiantes para agregar likes');
      return;
    }

    // Likes en posts (solo agregar si no existen)
    for (const novedad of novedades) {
      for (const estudianteId of estudianteIds) {
        if (estudianteId !== novedad.estudianteId) {
          // Verificar si ya existe el like
          const existing = await queryInterface.sequelize.query(
            'SELECT 1 FROM "Likes" WHERE "novedadId" = ? AND "usuarioId" = ? LIMIT 1;',
            {
              replacements: [novedad.id, estudianteId],
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          if (!existing || existing.length === 0) {
            await queryInterface.bulkInsert('"Likes"', [
              {
                novedadId: novedad.id,
                usuarioId: estudianteId,
                createdAt: now,
                updatedAt: now,
              },
            ]);
          }
        }
      }
    }

    // Likes en comentarios
    if (comentarios && comentarios.length > 0) {
      for (const comentario of comentarios) {
        for (const estudianteId of estudianteIds) {
          if (estudianteId !== comentario.usuarioId) {
            // Verificar si ya existe el like
            const existing = await queryInterface.sequelize.query(
              'SELECT 1 FROM "ComentarioLikes" WHERE "comentarioId" = ? AND "usuarioId" = ? LIMIT 1;',
              {
                replacements: [comentario.id, estudianteId],
                type: Sequelize.QueryTypes.SELECT,
              }
            );

            if (!existing || existing.length === 0) {
              await queryInterface.bulkInsert('"ComentarioLikes"', [
                {
                  comentarioId: comentario.id,
                  usuarioId: estudianteId,
                  createdAt: now,
                  updatedAt: now,
                },
              ]);
            }
          }
        }
      }
    }

    // Actualizar los contadores de likes en las novedades
    await queryInterface.sequelize.query(`
      UPDATE "Novedades" n
      SET "likesCount" = (
        SELECT COUNT(*) FROM "Likes" l
        WHERE l."novedadId" = n.id
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('"Likes"', null, {});
    await queryInterface.bulkDelete('"ComentarioLikes"', null, {});
  },
};
