'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Obtener materiales existentes
      const materiales = await queryInterface.sequelize.query(
        'SELECT id, titulo FROM "Materiales" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!materiales || materiales.length < 5) {
        throw new Error(
          'No hay suficientes materiales. Ejecute primero el seed de materiales.'
        );
      }

      // Obtener usuarios estudiantes
      const estudiantes = await queryInterface.sequelize.query(
        'SELECT id, nombre, apellido FROM "Usuarios" WHERE rol = \'estudiante\' ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!estudiantes || estudiantes.length < 5) {
        throw new Error(
          'No hay suficientes estudiantes. Ejecute primero el seed de estudiantes.'
        );
      }

      // Obtener administrador
      const admin = await queryInterface.sequelize.query(
        'SELECT id FROM "Usuarios" WHERE rol = \'administrador\' LIMIT 1',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Obtener motivos de denuncia
      const motivos = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "MotivosDenuncia" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!motivos || motivos.length === 0) {
        throw new Error(
          'No hay motivos de denuncia. Ejecute primero las migraciones.'
        );
      }

      console.log(
        `Encontrados ${materiales.length} materiales, ${estudiantes.length} estudiantes, ${motivos.length} motivos`
      );

      const adminId = admin?.[0]?.id || 1;
      const now = new Date();

      // Función helper para obtener motivo por nombre
      const motivoId = (nombre) => {
        const m = motivos.find((m) => m.nombre.includes(nombre));
        return m?.id || motivos[0].id;
      };

      // =========================================================
      // 1. CREAR DENUNCIAS
      // =========================================================
      const denuncias = [
        // --- Material 1: "Apuntes de Complejidad Algorítmica"
        // Denuncias pendientes (no llegan al umbral de 10)
        {
          materialId: materiales[0].id,
          denuncianteId: estudiantes[4].id,
          motivoId: motivoId('derechos de autor'),
          detalle:
            'Este material parece copiado de un sitio web sin atribución',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },
        {
          materialId: materiales[0].id,
          denuncianteId: estudiantes[7].id,
          motivoId: motivoId('Información incorrecta'),
          detalle: 'Varios conceptos de notación Big-O están mal explicados',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },

        // --- Material 2: "Guía de Ejercicios Resueltos - Árboles"
        // Denuncia confirmada (se verificó, se suspende porque M=1)
        {
          materialId: materiales[1].id,
          denuncianteId: estudiantes[2].id,
          motivoId: motivoId('derechos de autor'),
          detalle:
            'Los ejercicios fueron copiados del libro de Cormen sin permiso',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-20'),
        },
        {
          materialId: materiales[1].id,
          denuncianteId: estudiantes[5].id,
          motivoId: motivoId('Spam'),
          detalle: 'Tiene publicidad de un curso pago al final del documento',
          estado: 'rechazada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-21'),
        },

        // --- Material 3: "Video: Explicación de Grafos y Recorridos"
        // Denuncia rechazada
        {
          materialId: materiales[2].id,
          denuncianteId: estudiantes[1].id,
          motivoId: motivoId('Información incorrecta'),
          detalle:
            'El video dice que BFS solo funciona para árboles, lo cual es incorrecto',
          estado: 'rechazada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-18'),
        },

        // --- Material 8: "Discord: Grupo de Estudio Python"
        // 10 denuncias pendientes (alcanza N_DENUNCIAS_PENDIENTES >= 10)
        {
          materialId: materiales[7].id,
          denuncianteId: estudiantes[3].id,
          motivoId: motivoId('Spam'),
          detalle: 'El servidor de Discord tiene publicidad engañosa',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },
        {
          materialId: materiales[7].id,
          denuncianteId: estudiantes[6].id,
          motivoId: motivoId('Lenguaje ofensivo'),
          detalle: 'En el canal de ayuda usan lenguaje inapropiado',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },
        {
          materialId: materiales[7].id,
          denuncianteId: estudiantes[9].id,
          motivoId: motivoId('derechos de autor'),
          detalle: 'Comparten materiales con copyright sin permiso',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },

        // --- Material 10: "Resumen de Límites y Continuidad"
        // Denuncia confirmada (se verificó)
        {
          materialId: materiales[9].id,
          denuncianteId: estudiantes[4].id,
          motivoId: motivoId('Información incorrecta'),
          detalle: 'Varias fórmulas de límites están mal escritas',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-25'),
        },

        // --- Material 4: "Servidor de Estudio - Algoritmos UNH"
        // Denuncia confirmada en material de Discord
        {
          materialId: materiales[3].id,
          denuncianteId: estudiantes[5].id,
          motivoId: motivoId('Spam'),
          detalle: 'El servidor de Discord promociona contenido no educativo',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-27'),
        },

        // --- Material 16: "Formulario de Física I"
        // Denuncia confirmada
        {
          materialId: materiales[14].id,
          denuncianteId: estudiantes[0].id,
          motivoId: motivoId('derechos de autor'),
          detalle:
            'El formulario contiene imágenes extraídas de un libro con copyright',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-28'),
        },

        // --- Material 17: "Resumen de Gestión de Procesos"
        // Una confirmada (solo 1 para probar el umbral M_DENUNCIAS_VERIFICADAS)
        {
          materialId: materiales[15].id,
          denuncianteId: estudiantes[3].id,
          motivoId: motivoId('derechos de autor'),
          detalle:
            'Copiado textual del libro de Sistemas Operativos de Silberschatz',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-22'),
        },
        {
          materialId: materiales[15].id,
          denuncianteId: estudiantes[7].id,
          motivoId: motivoId('Información incorrecta'),
          detalle: 'El diagrama de estados de procesos tiene errores graves',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },

        // --- Material 19: "Discord: Comunidad de SO"
        // Mezcla de estados
        {
          materialId: materiales[17].id,
          denuncianteId: estudiantes[2].id,
          motivoId: motivoId('Spam'),
          detalle:
            'El servidor promociona contenido no relacionado con la materia',
          estado: 'confirmada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-26'),
        },
        {
          materialId: materiales[17].id,
          denuncianteId: estudiantes[5].id,
          motivoId: motivoId('Lenguaje ofensivo'),
          detalle: 'Hay mensajes con insultos en el canal general',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        },

        // --- Material 6: "Apuntes de Funciones y Procedimientos"
        // Denuncia revocada
        {
          materialId: materiales[5].id,
          denuncianteId: estudiantes[9].id,
          motivoId: motivoId('Información incorrecta'),
          detalle:
            'Decía que los apuntes estaban mal pero en realidad estaban bien',
          estado: 'revocada',
          moderadorId: adminId,
          fechaModeracion: new Date('2025-05-30'),
        },
      ];

      // Agregar denuncias pendientes restantes para alcanzar el umbral N (10 total)
      const indicesUsados = [3, 6, 9];
      const otrosEstudiantes = estudiantes.filter(
        (_, idx) => !indicesUsados.includes(idx)
      );
      for (let i = 0; i < 7 && i < otrosEstudiantes.length; i++) {
        denuncias.push({
          materialId: materiales[7].id,
          denuncianteId: otrosEstudiantes[i].id,
          motivoId: motivoId('Spam'),
          detalle: 'Reporte automático por contenido sospechoso',
          estado: 'pendiente',
          moderadorId: null,
          fechaModeracion: null,
        });
      }

      await queryInterface.bulkInsert(
        'Denuncias',
        denuncias.map((d) => ({
          materialId: d.materialId,
          denuncianteId: d.denuncianteId,
          motivoId: d.motivoId,
          detalle: d.detalle,
          estado: d.estado,
          moderadorId: d.moderadorId,
          fechaModeracion: d.fechaModeracion,
          createdAt: now,
          updatedAt: now,
        }))
      );

      console.log(`Creadas ${denuncias.length} denuncias`);

      // =========================================================
      // 2. MARCAR MATERIALES COMO SUSPENDIDOS
      // =========================================================
      // Según la config:
      // M_DENUNCIAS_VERIFICADAS = 1 -> 1 confirmada alcanza para suspender
      // N_DENUNCIAS_PENDIENTES = 10 -> 10 pendientes alcanzan para suspender
      //
      // Suspendidos por denuncias verificadas:
      // - Material 2 (Guía Árboles): tiene 1 confirmada
      // - Material 4 (Servidor Algoritmos - Discord): tiene 1 confirmada
      // - Material 11 (Resumen Límites): tiene 1 confirmada
      // - Material 17 (Formulario Física): tiene 1 confirmada
      // - Material 18 (Resumen Procesos): tiene 1 confirmada
      // - Material 20 (Discord SO): tiene 1 confirmada
      //
      // Suspendidos por cantidad de pendientes:
      // - Material 8 (Discord Python): tiene 10 pendientes
      const materialesSuspendidos = [
        materiales[1].id, // Guía de Ejercicios Resueltos - Árboles (verificada)
        materiales[3].id, // Servidor de Estudio - Algoritmos UNH, Discord (verificada)
        materiales[7].id, // Discord: Grupo de Estudio Python (pendientes)
        materiales[9].id, // Resumen de Límites y Continuidad (verificada)
        materiales[14].id, // Formulario de Física I (verificada)
        materiales[15].id, // Resumen de Gestión de Procesos (verificada)
        materiales[17].id, // Discord: Comunidad de SO (verificada)
      ];

      for (const matId of materialesSuspendidos) {
        await queryInterface.sequelize.query(
          'UPDATE "Materiales" SET suspendido = true, "suspendidoEn" = NOW() WHERE id = $1',
          { bind: [matId] }
        );
      }

      console.log(
        `Suspendidos ${materialesSuspendidos.length} materiales automáticamente`
      );

      // =========================================================
      // 3. CREAR ALGUNAS NOTIFICACIONES DE MODERACIÓN
      // =========================================================
      const tables = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'Notificaciones'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (tables && tables.length > 0) {
        const notificaciones = [
          {
            usuarioId: estudiantes[0].id,
            tipo: 'material_suspendido',
            titulo:
              'Tu material "Formulario de Física I" ha sido suspendido por infringir derechos de autor.',
            leido: false,
            materialId: materiales[14].id,
            createdAt: new Date('2025-05-28'),
            updatedAt: new Date('2025-05-28'),
          },
        ];

        await queryInterface.bulkInsert(
          'Notificaciones',
          notificaciones.map((n) => ({
            ...n,
            actorId: null,
            materiaId: null,
            sesionId: null,
            denunciaId: null,
          }))
        );
        console.log(`Creadas ${notificaciones.length} notificaciones`);
      }

      console.log('Seed de moderación completado exitosamente');
    } catch (error) {
      console.error('Error in seed-moderacion:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Limpiar notificaciones de moderación si existen
    try {
      const tables = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = 'Notificaciones'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      if (tables && tables.length > 0) {
        await queryInterface.bulkDelete('Notificaciones', {
          tipo: 'material_suspendido',
        });
      }
    } catch (e) {
      // ignore
    }
    await queryInterface.bulkDelete('Denuncias', null, {});
    await queryInterface.sequelize.query(
      'UPDATE "Materiales" SET suspendido = false, "suspendidoEn" = NULL WHERE suspendido = true'
    );
  },
};
