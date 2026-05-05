'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Obtener carreras
      const carreras = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "Carreras" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const licInfoId = carreras.find(
        (c) => c.nombre === 'Licenciatura en Informática'
      )?.id;
      const tecProgId = carreras.find(
        (c) => c.nombre === 'Tecnicatura en Programación'
      )?.id;
      const licIAId = carreras.find(
        (c) => c.nombre === 'Tecnicatura en Inteligencia Artificial'
      )?.id;

      // Datos de estudiantes: [nombre, apellido, email, fecha, carreraId]
      const datos = [
        [
          'Ana',
          'García',
          'ana.garcia@estudiante.unahur.edu.ar',
          '2002-03-15',
          licInfoId,
        ],
        [
          'Carlos',
          'Rodríguez',
          'carlos.rodriguez@estudiante.unahur.edu.ar',
          '2001-07-22',
          licInfoId,
        ],
        [
          'María',
          'González',
          'maria.gonzalez@estudiante.unahur.edu.ar',
          '2003-01-10',
          licIAId,
        ],
        [
          'Juan',
          'Martínez',
          'juan.martinez@estudiante.unahur.edu.ar',
          '2002-11-05',
          tecProgId,
        ],
        [
          'Sofía',
          'López',
          'sofia.lopez@estudiante.unahur.edu.ar',
          '2002-09-18',
          licInfoId,
        ],
        [
          'Diego',
          'Fernández',
          'diego.fernandez@estudiante.unahur.edu.ar',
          '2003-04-12',
          licIAId,
        ],
        [
          'Valentina',
          'Pérez',
          'valentina.perez@estudiante.unahur.edu.ar',
          '2001-12-08',
          licInfoId,
        ],
        [
          'Tomás',
          'Silva',
          'tomas.silva@estudiante.unahur.edu.ar',
          '2003-06-25',
          licIAId,
        ],
        [
          'Camila',
          'Torres',
          'camila.torres@estudiante.unahur.edu.ar',
          '2002-02-14',
          tecProgId,
        ],
        [
          'Nicolás',
          'Morales',
          'nicolas.morales@estudiante.unahur.edu.ar',
          '2001-10-30',
          licInfoId,
        ],
      ];

      for (const [nombre, apellido, email, fecha, carreraId] of datos) {
        // Verificar si el usuario ya existe
        let usuarioId;
        const existingUser = await queryInterface.sequelize.query(
          'SELECT id FROM "Usuarios" WHERE email = $1 LIMIT 1',
          { bind: [email], type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (existingUser && existingUser.length > 0) {
          usuarioId = existingUser[0].id;
          // Actualizar sin avatar
          await queryInterface.sequelize.query(
            'UPDATE "Usuarios" SET nombre = $1, apellido = $2, "fechaNacimiento" = $3, "avatarUrl" = NULL WHERE id = $4',
            { bind: [nombre, apellido, fecha, usuarioId] }
          );
        } else {
          // Crear usuario sin foto
          await queryInterface.sequelize.query(
            `INSERT INTO "Usuarios" (nombre, apellido, email, "fechaNacimiento", "avatarUrl", password, rol, activo, "createdAt", "updatedAt") 
               VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, NOW(), NOW())`,
            {
              bind: [
                nombre,
                apellido,
                email,
                fecha,
                'password123',
                'estudiante',
                true,
              ],
            }
          );
          const newUser = await queryInterface.sequelize.query(
            'SELECT id FROM "Usuarios" WHERE email = $1 LIMIT 1',
            { bind: [email], type: queryInterface.sequelize.QueryTypes.SELECT }
          );
          usuarioId = newUser[0]?.id;
        }

        if (usuarioId) {
          // Verificar si el estudiante ya existe
          const existingEstudiante = await queryInterface.sequelize.query(
            'SELECT id FROM "Estudiantes" WHERE "usuarioId" = $1 LIMIT 1',
            {
              bind: [usuarioId],
              type: queryInterface.sequelize.QueryTypes.SELECT,
            }
          );

          if (!existingEstudiante || existingEstudiante.length === 0) {
            await queryInterface.sequelize.query(
              `INSERT INTO "Estudiantes" ("usuarioId", "perfilPublico", "mostrarEmail", "mostrarSituacionAcademica", "createdAt", "updatedAt") 
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
              {
                bind: [
                  usuarioId,
                  Math.random() > 0.5,
                  Math.random() > 0.7,
                  Math.random() > 0.3,
                ],
              }
            );
          }

          // Asignar carrera
          await queryInterface.sequelize.query(
            `INSERT INTO "EstudianteCarreras" ("estudianteId", "carreraId", "createdAt", "updatedAt") 
               SELECT e.id, ${carreraId}, NOW(), NOW() 
               FROM "Estudiantes" e 
               WHERE e."usuarioId" = ${usuarioId}
               AND NOT EXISTS (
                 SELECT 1 FROM "EstudianteCarreras" ec 
                 WHERE ec."estudianteId" = e.id AND ec."carreraId" = ${carreraId}
               )`,
            { type: queryInterface.sequelize.QueryTypes.INSERT }
          );
        }
      }
      console.log('Seed de estudiantes completado exitosamente (sin fotos)');
    } catch (error) {
      console.error('Error in seed-estudiantes:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      'DELETE FROM "EstudianteCarreras" WHERE 1=1'
    );
    await queryInterface.sequelize.query('DELETE FROM "Estudiantes" WHERE 1=1');
    await queryInterface.sequelize.query(
      'DELETE FROM "Usuarios" WHERE rol = \'estudiante\''
    );
  },
};
