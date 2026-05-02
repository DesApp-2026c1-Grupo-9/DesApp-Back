'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Novedades', [
      {
        tipo: 'posteo',
        titulo: '¡Busco grupo de estudio para Álgebra!',
        contenido:
          'Hola a todos! Estoy buscando compañeros para armar un grupo de estudio para Álgebra. Estamos en la semana 8 y necesito reforzar espacios vectoriales. ¿Quién se suma?',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        autorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'aprobacion',
        titulo: 'Aprobé Cálculo II!',
        contenido:
          'Después de mucho esfuerzo, finalmente aprobé Cálculo II con 8 puntos. ¡Muy feliz!',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        autorId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'inscripcion',
        titulo: 'Me inscribí a Programación III',
        contenido:
          'Este cuatrimestre me inscribí a Programación III. ¡Vamos con todo!',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        autorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'posteo',
        titulo: 'Apuntes de Física I disponibles',
        contenido:
          'Comparto mis apuntes de Física I organizados por unidades. Están en el repositorio de la materia. ¡Espero que les sirvan!',
        imagenUrl: 'https://example.com/imagen-fisica.jpg',
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        autorId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'regularizacion',
        titulo: 'Regularicé Estadística',
        contenido:
          'Regularicé Estadística con 7 puntos. Ahora puedo cursar materias que la tienen como correlativa.',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: true,
        likesCount: 0,
        autorId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'posteo',
        titulo: '¿Alguien tiene el TP2 de Programación II?',
        contenido:
          'Estoy teniendo problemas con el ejercicio 3 del TP2. ¿Alguien lo pudo resolver? Me vendría bien una mano.',
        imagenUrl: null,
        materiaId: null,
        visible: true,
        esAutomatica: false,
        likesCount: 0,
        autorId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Novedades', null, {});
  },
};
