'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear usuarios para estudiantes
    const usuarios = await queryInterface.bulkInsert(
      'Usuarios',
      [
        {
          nombre: 'Ana',
          apellido: 'García',
          email: 'ana.garcia@estudiante.unahur.edu.ar',
          fechaNacimiento: '2002-03-15',
          avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos.rodriguez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2001-07-22',
          avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'María',
          apellido: 'González',
          email: 'maria.gonzalez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2003-01-10',
          avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Juan',
          apellido: 'Martínez',
          email: 'juan.martinez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2002-11-05',
          avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Sofía',
          apellido: 'López',
          email: 'sofia.lopez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2002-09-18',
          avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Diego',
          apellido: 'Fernández',
          email: 'diego.fernandez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2003-04-12',
          avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Valentina',
          apellido: 'Pérez',
          email: 'valentina.perez@estudiante.unahur.edu.ar',
          fechaNacimiento: '2001-12-08',
          avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Tomás',
          apellido: 'Silva',
          email: 'tomas.silva@estudiante.unahur.edu.ar',
          fechaNacimiento: '2003-06-25',
          avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Camila',
          apellido: 'Torres',
          email: 'camila.torres@estudiante.unahur.edu.ar',
          fechaNacimiento: '2002-02-14',
          avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Nicolás',
          apellido: 'Morales',
          email: 'nicolas.morales@estudiante.unahur.edu.ar',
          fechaNacimiento: '2001-10-30',
          avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
          password: 'password123',
          rol: 'estudiante',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // Crear estudiantes
    const estudiantes = await queryInterface.bulkInsert(
      'Estudiantes',
      usuarios.map((usuario) => ({
        usuarioId: usuario.id,
        perfilPublico: Math.random() > 0.5,
        mostrarEmail: Math.random() > 0.7,
        mostrarSituacionAcademica: Math.random() > 0.3,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      { returning: true }
    );

    // Obtener las carreras creadas
    const carreras = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM "Carreras" ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const licInfo = carreras.find(
      (c) => c.nombre === 'Licenciatura en Informática'
    );
    const tecProg = carreras.find(
      (c) => c.nombre === 'Tecnicatura en Programación'
    );
    const licIA = carreras.find(
      (c) => c.nombre === 'Licenciatura en Inteligencia Artificial'
    );

    // Asignar estudiantes a carreras de manera realista
    const estudianteCarreras = [
      // Estudiantes de años anteriores en Licenciatura
      { estudianteId: estudiantes[0].id, carreraId: licInfo.id }, // Ana - 3er año
      { estudianteId: estudiantes[1].id, carreraId: licInfo.id }, // Carlos - 3er año
      { estudianteId: estudiantes[4].id, carreraId: licInfo.id }, // Sofía - 3er año
      { estudianteId: estudiantes[6].id, carreraId: licInfo.id }, // Valentina - 4to año
      { estudianteId: estudiantes[9].id, carreraId: licInfo.id }, // Nicolás - 4to año

      // Estudiantes recientes en diferentes carreras
      { estudianteId: estudiantes[2].id, carreraId: licIA.id }, // María - 2do año IA
      { estudianteId: estudiantes[5].id, carreraId: licIA.id }, // Diego - 2do año IA
      { estudianteId: estudiantes[7].id, carreraId: licIA.id }, // Tomás - 2do año IA

      // Estudiantes en Tecnicatura
      { estudianteId: estudiantes[3].id, carreraId: tecProg.id }, // Juan - 2do año Tecnicatura
      { estudianteId: estudiantes[8].id, carreraId: tecProg.id }, // Camila - 2do año Tecnicatura
    ];

    await queryInterface.bulkInsert(
      'EstudianteCarreras',
      estudianteCarreras.map((ec) => ({
        ...ec,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('EstudianteCarreras', null, {});
    await queryInterface.bulkDelete('Estudiantes', null, {});
    await queryInterface.bulkDelete('Usuarios', { rol: 'estudiante' }, {});
  },
};
