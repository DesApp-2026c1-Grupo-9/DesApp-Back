'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const materias = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "Materias" ORDER BY id LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!materias || materias.length === 0) {
        throw new Error(
          'No hay materias. Ejecute primero el seed de datos académicos.'
        );
      }

      const usuarios = await queryInterface.sequelize.query(
        'SELECT id, nombre, apellido FROM "Usuarios" WHERE rol = \'estudiante\' ORDER BY id LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!usuarios || usuarios.length === 0) {
        throw new Error(
          'No hay usuarios estudiantes. Ejecute primero el seed de estudiantes.'
        );
      }

      const now = new Date();
      const fechaPasada = new Date('2026-06-01T10:00:00.000Z');

      await queryInterface.bulkInsert('Sesiones', [
        {
          materiaId: materias[0].id,
          creadorId: usuarios[0].id,
          tema: 'Sesión de prueba con fecha pasada',
          tipo: 'virtual',
          link: 'https://meet.google.com/test-past-session',
          ubicacion: null,
          fechaHora: fechaPasada,
          duracion: 60,
          cupos: null,
          descripcion:
            'Sesión creada por seeder para probar que la validación permite fechas pasadas al insertar directamente en la DB.',
          necesidadAprobacion: false,
          estado: 'activa',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      console.log('Seed de sesión pasada (1 de junio) completado exitosamente');
    } catch (error) {
      console.error('Error en seed-sesion-pasada:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Sesiones', {
      tema: 'Sesión de prueba con fecha pasada',
    });
  },
};
