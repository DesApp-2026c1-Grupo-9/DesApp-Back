'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const haceUnaHora = new Date(now.getTime() - 60 * 60 * 1000);
    const haceDosDias = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Obtener materias existentes
    const materias = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM "Materias" WHERE nombre LIKE ? OR nombre LIKE ? LIMIT 5;',
      {
        replacements: ['%Programación%', '%Matemática%'],
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    const materiaProg =
      materias.find((m) => m.nombre.includes('Programación')) || materias[0];
    const materiaMat =
      materias.find((m) => m.nombre.includes('Matemática')) || materias[1];

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

    await queryInterface.bulkInsert('Novedades', [
      {
        tipo: 'posteo',
        titulo: 'Mi primer post editado',
        contenido:
          'Este post fue editado para mostrar la funcionalidad de edición. ¡Ahora se ve mucho mejor!',
        imagenUrl: null,
        materiaId: materiaProg?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        autorId: anaId, // Ana García
        editedAt: haceUnaHora,
        createdAt: haceDosDias,
        updatedAt: haceUnaHora,
      },
      {
        tipo: 'posteo',
        titulo: 'Compartiendo recursos de estudio',
        contenido:
          'Les comparto este repositorio con ejercicios resueltos de Álgebra Lineal. ¡Espero que les sirva!',
        imagenUrl: 'https://example.com/algebra-recursos.jpg',
        materiaId: materiaMat?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        autorId: carlosId, // Carlos Rodríguez
        editedAt: null,
        createdAt: haceUnaHora,
        updatedAt: haceUnaHora,
      },
      {
        tipo: 'posteo',
        titulo: 'Duda sobre correlatividades',
        contenido:
          '¿Alguien sabe si puedo cursar Programación III si tengo pendiente solo el parcial de Programación II?',
        imagenUrl: null,
        materiaId: materiaProg?.id,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 0,
        autorId: mariaId, // María González
        editedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      'Novedades',
      {
        titulo: [
          'Mi primer post editado',
          'Compartiendo recursos de estudio',
          'Duda sobre correlatividades',
        ],
      },
      {}
    );
  },
};
