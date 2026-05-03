'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const haceUnaHora = new Date(now.getTime() - 60 * 60 * 1000);
    const haceDosDias = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('Novedades', [
      {
        tipo: 'posteo',
        titulo: 'Mi primer post editado',
        contenido:
          'Este post fue editado para mostrar la funcionalidad de edición. ¡Ahora se ve mucho mejor!',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 3,
        comentariosCount: 2,
        autorId: 1,
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
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 5,
        comentariosCount: 3,
        autorId: 2,
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
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        comentariosCount: 1,
        autorId: 3,
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
