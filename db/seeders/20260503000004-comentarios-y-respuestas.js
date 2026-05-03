'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const hace30Min = new Date(now.getTime() - 30 * 60 * 1000);
    const hace1Hora = new Date(now.getTime() - 60 * 60 * 1000);
    const hace15Min = new Date(now.getTime() - 15 * 60 * 1000);

    // Obtener algunos IDs de novedades existentes
    const novedades = await queryInterface.sequelize.query(
      'SELECT id FROM "Novedades" ORDER BY id LIMIT 6;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (novedades.length === 0) {
      console.log('No hay novedades para agregar comentarios');
      return;
    }

    // Usar los primeros IDs disponibles
    const novedadId1 = novedades[0]?.id;
    const novedadId2 = novedades[1]?.id || novedades[0]?.id;
    const novedadId3 = novedades[2]?.id || novedades[0]?.id;

    // Insertar comentarios principales
    const comentarios = await queryInterface.bulkInsert(
      '"Comentarios"',
      [
        // Comentarios en la primera novedad
        {
          contenido: '¡Qué buen post! Me ayudó mucho.',
          novedadId: novedadId1,
          usuarioId: 2,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace1Hora,
          updatedAt: hace1Hora,
        },
        {
          contenido: 'Totalmente de acuerdo, muy útil.',
          novedadId: novedadId1,
          usuarioId: 3,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace30Min,
          updatedAt: hace30Min,
        },
        // Comentarios en la segunda novedad
        {
          contenido: '¡Gracias por compartir! Justo necesitaba esto.',
          novedadId: novedadId2,
          usuarioId: 1,
          comentarioPadreId: null,
          editedAt: null,
          createdAt: hace30Min,
          updatedAt: hace30Min,
        },
        {
          contenido: 'Muéstrame dónde está el repo porfa.',
          novedadId: novedadId2,
          usuarioId: 3,
          comentarioPadreId: null,
          editedAt: new Date(now.getTime() - 10 * 60 * 1000),
          createdAt: hace1Hora,
          updatedAt: new Date(now.getTime() - 10 * 60 * 1000),
        },
        // Comentario editado en la tercera novedad
        {
          contenido:
            'Creo que sí, yo cursé así el cuatrimestre pasado. Fijate en el plan de estudios.',
          novedadId: novedadId3,
          usuarioId: 2,
          comentarioPadreId: null,
          editedAt: hace30Min,
          createdAt: hace1Hora,
          updatedAt: hace30Min,
        },
      ],
      { returning: true }
    );

    // Buscar el ID del primer comentario para agregar una respuesta
    const comentarioPadre = await queryInterface.sequelize.query(
      'SELECT id FROM "Comentarios" WHERE contenido LIKE ? AND "novedadId" = ? LIMIT 1;',
      {
        replacements: ['¡Qué buen post!%', novedadId1],
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (comentarioPadre[0]?.id) {
      // Insertar respuesta
      await queryInterface.bulkInsert('"Comentarios"', [
        {
          contenido: 'Gracias! Me costó pero valió la pena editarlo.',
          novedadId: novedadId1,
          usuarioId: 1,
          comentarioPadreId: comentarioPadre[0].id,
          editedAt: null,
          createdAt: hace15Min,
          updatedAt: hace15Min,
        },
      ]);
    }

    // Actualizar los contadores de comentarios en TODAS las novedades (incluye comentarios y respuestas)
    await queryInterface.sequelize.query(`
      UPDATE "Novedades" n
      SET "comentariosCount" = (
        SELECT COUNT(*) FROM "Comentarios" c
        WHERE c."novedadId" = n.id
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('"Comentarios"', null, {});
  },
};
