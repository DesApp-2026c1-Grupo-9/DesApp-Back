'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Obtener materias existentes
      const materias = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "Materias" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!materias || materias.length === 0) {
        throw new Error(
          'No hay materias. Ejecute primero el seed de datos académicos.'
        );
      }

      // Obtener usuarios estudiantes existentes
      const usuarios = await queryInterface.sequelize.query(
        'SELECT id, nombre, apellido FROM "Usuarios" WHERE rol = \'estudiante\' ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!usuarios || usuarios.length === 0) {
        throw new Error(
          'No hay usuarios estudiantes. Ejecute primero el seed de estudiantes.'
        );
      }

      console.log(
        `Encontradas ${materias.length} materias y ${usuarios.length} estudiantes`
      );

      // Crear tags únicos
      const tagsData = [
        'parcial',
        'final',
        'tp',
        'práctica',
        'teoría',
        'ejercicios',
        'resueltos',
        'examen',
        'apuntes',
        'resumen',
        'guía',
        'laboratorio',
        'proyecto',
        'explicación',
        'video',
        'documentación',
        'grupo-estudio',
      ];

      const existingTags = await queryInterface.sequelize.query(
        'SELECT nombre FROM "MaterialTags"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      const existingTagNames = existingTags.map((t) => t.nombre);

      const tagsToInsert = tagsData.filter(
        (t) => !existingTagNames.includes(t)
      );
      if (tagsToInsert.length > 0) {
        await queryInterface.bulkInsert(
          'MaterialTags',
          tagsToInsert.map((t) => ({
            nombre: t,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
      }

      // Obtener tags creados
      const allTags = await queryInterface.sequelize.query(
        'SELECT id, nombre FROM "MaterialTags"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      const getTagIds = (tagNames) => {
        return tagNames
          .map((name) => allTags.find((t) => t.nombre === name)?.id)
          .filter(Boolean);
      };

      const now = new Date();

      // Crear materiales
      const materiales = [
        // Algoritmos y Estructuras de Datos (materia 1 o similar)
        {
          titulo: 'Apuntes de Complejidad Algorítmica',
          descripcion:
            'Resumen completo de notación Big-O, complejidad temporal y espacial para exámenes',
          tipo: 'link',
          url:
            'https://drive.google.com/drive/folders/complejidad-algoritmica-2024',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[0]?.id || 1,
          creadorId: usuarios[0]?.id || 1,
          fecha: new Date('2025-03-15'),
          tagIds: getTagIds(['parcial', 'teoría', 'resumen']),
        },
        {
          titulo: 'Guía de Ejercicios Resueltos - Árboles',
          descripcion:
            'Ejercicios resueltos de árboles binarios, AVL y B para el segundo parcial',
          tipo: 'link',
          url: 'https://drive.google.com/documentos/ejercicios-arboles',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[0]?.id || 1,
          creadorId: usuarios[1]?.id || 2,
          fecha: new Date('2025-04-10'),
          tagIds: getTagIds(['tp', 'práctica', 'resueltos']),
        },
        {
          titulo: 'Video: Explicación de Grafos y Recorridos',
          descripcion:
            'Tutorial en video sobre BFS, DFS y algoritmos de caminos mínimos',
          tipo: 'link',
          url: 'https://youtube.com/watch?v=grafos-explicacion-2024',
          tipoLink: 'youtube',
          discordInfo: null,
          materiaId: materias[0]?.id || 1,
          creadorId: usuarios[2]?.id || 3,
          fecha: new Date('2025-05-01'),
          tagIds: getTagIds(['video', 'explicación', 'práctica']),
        },
        {
          titulo: 'Servidor de Estudio - Algoritmos UNH',
          descripcion:
            'Únete a nuestro servidor de Discord para estudiar juntos para los parciales',
          tipo: 'link',
          url: 'https://discord.gg/invite/algoritmos-unh2024',
          tipoLink: 'discord',
          discordInfo: { servidor: 'Algoritmos UNH', canal: 'general' },
          materiaId: materias[0]?.id || 1,
          creadorId: usuarios[3]?.id || 4,
          fecha: new Date('2025-02-20'),
          tagIds: getTagIds(['grupo-estudio', 'discord']),
        },
        {
          titulo: 'Repositorio GitHub - Implementaciones',
          descripcion:
            'Código fuente en Python y Java de los algoritmos vistos en clase',
          tipo: 'link',
          url: 'https://github.com/estudiante/algoritmos-implementaciones',
          tipoLink: 'github',
          discordInfo: null,
          materiaId: materias[0]?.id || 1,
          creadorId: usuarios[0]?.id || 1,
          fecha: new Date('2025-03-25'),
          tagIds: getTagIds(['proyecto', 'código', 'práctica']),
        },

        // Introducción a la Programación
        {
          titulo: 'Tutorial: Primeros Pasos en Python',
          descripcion:
            'Video tutorial para principiantes sobre variables, tipos de datos y operadores',
          tipo: 'link',
          url: 'https://youtube.com/watch?v=python-intro-basico',
          tipoLink: 'youtube',
          discordInfo: null,
          materiaId: materias[1]?.id || 2,
          creadorId: usuarios[1]?.id || 2,
          fecha: new Date('2025-02-10'),
          tagIds: getTagIds(['video', 'teoría', 'explicación']),
        },
        {
          titulo: 'Apuntes de Funciones y Procedimientos',
          descripción:
            'Resumen de funciones, parámetros, retorno y alcance de variables',
          tipo: 'link',
          url: 'https://drive.google.com/apuntes-funciones-python',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[1]?.id || 2,
          creadorId: usuarios[2]?.id || 3,
          fecha: new Date('2025-03-05'),
          tagIds: getTagIds(['parcial', 'teoría', 'resumen']),
        },
        {
          titulo: 'Ejercicios de Estructuras Condicionales',
          descripcion:
            'Practica con if-else y switch. Incluye soluciones explicadas',
          tipo: 'link',
          url: 'https://drive.google.com/ejercicios-condicionales',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[1]?.id || 2,
          creadorId: usuarios[4]?.id || 5,
          fecha: new Date('2025-04-15'),
          tagIds: getTagIds(['ejercicios', 'práctica', 'resueltos']),
        },
        {
          titulo: 'Discord: Grupo de Estudio Python',
          descripcion:
            'Servidor de Discord para compartir recursos y resolver dudas',
          tipo: 'link',
          url: 'https://discord.gg/invite/python-coders-2024',
          tipoLink: 'discord',
          discordInfo: { servidor: 'Python Coders', canal: 'ayuda' },
          materiaId: materias[1]?.id || 2,
          creadorId: usuarios[5]?.id || 6,
          fecha: new Date('2025-01-25'),
          tagIds: getTagIds(['grupo-estudio', 'discord']),
        },

        // Análisis Matemático I
        {
          titulo: 'Resumen de Límites y Continuidad',
          descripcion:
            'Apuntes teóricos del primer tema del curso con ejemplos',
          tipo: 'link',
          url: 'https://drive.google.com/limites-continuidad-am1',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[2]?.id || 3,
          creadorId: usuarios[0]?.id || 1,
          fecha: new Date('2025-03-01'),
          tagIds: getTagIds(['parcial', 'teoría', 'apuntes']),
        },
        {
          titulo: 'Derivadas - Guía Completa',
          descripcion:
            'Todas las reglas de derivación explicadas con ejemplos paso a paso',
          tipo: 'link',
          url: 'https://youtube.com/watch?v=derivadas-completo-am1',
          tipoLink: 'youtube',
          discordInfo: null,
          materiaId: materias[2]?.id || 3,
          creadorId: usuarios[3]?.id || 4,
          fecha: new Date('2025-04-20'),
          tagIds: getTagIds(['video', 'teoría', 'explicación']),
        },
        {
          titulo: 'Ejercicios Resueltos de Integrales',
          descripcion:
            'Selección de integrales resueltas para el segundo parcial',
          tipo: 'link',
          url: 'https://drive.google.com/integrales-resueltas-am1',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[2]?.id || 3,
          creadorId: usuarios[6]?.id || 7,
          fecha: new Date('2025-05-10'),
          tagIds: getTagIds(['tp', 'ejercicios', 'resueltos']),
        },
        {
          titulo: 'Documentación de Mathematica',
          descripcion:
            'Recursos oficiales para usar Mathematica en análisis matemático',
          tipo: 'link',
          url: 'https://github.com/mathematica-docs/am1-recursos',
          tipoLink: 'github',
          discordInfo: null,
          materiaId: materias[2]?.id || 3,
          creadorId: usuarios[7]?.id || 8,
          fecha: new Date('2025-02-28'),
          tagIds: getTagIds(['documentación', 'práctica', 'guía']),
        },

        // Física I
        {
          titulo: 'Apuntes de Cinemática',
          descripcion:
            'Resumen de movimiento rectilíneo, caída libre y movimiento parabólico',
          tipo: 'link',
          url: 'https://drive.google.com/cinematica-fisica1',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[3]?.id || 4,
          creadorId: usuarios[2]?.id || 3,
          fecha: new Date('2025-03-10'),
          tagIds: getTagIds(['parcial', 'teoría', 'resumen']),
        },
        {
          titulo: 'Videos de Experimentos de Laboratorio',
          descripcion:
            'Grabaciones de los experimentos de física realizados en el laboratorio',
          tipo: 'link',
          url: 'https://youtube.com/watch?v=fisica-laboratorio-2024',
          tipoLink: 'youtube',
          discordInfo: null,
          materiaId: materias[3]?.id || 4,
          creadorId: usuarios[8]?.id || 9,
          fecha: new Date('2025-04-05'),
          tagIds: getTagIds(['video', 'laboratorio', 'práctica']),
        },
        {
          titulo: 'Formulario de Física I',
          descripcion: 'Todas las fórmulas importantes organizadas por tema',
          tipo: 'link',
          url: 'https://drive.google.com/formulario-fisica1',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[3]?.id || 4,
          creadorId: usuarios[9]?.id || 10,
          fecha: new Date('2025-05-01'),
          tagIds: getTagIds(['examen', 'resumen', 'guía']),
        },

        // Sistemas Operativos
        {
          titulo: 'Resumen de Gestión de Procesos',
          descripcion:
            'Estados de un proceso, PCB, scheduling y cambios de contexto',
          tipo: 'link',
          url: 'https://drive.google.com/procesos-sistemas-operativos',
          tipoLink: 'drive',
          discordInfo: null,
          materiaId: materias[4]?.id || 5,
          creadorId: usuarios[1]?.id || 2,
          fecha: new Date('2025-04-01'),
          tagIds: getTagIds(['parcial', 'teoría', 'apuntes']),
        },
        {
          titulo: 'Tutorial de Comandos Linux',
          descripcion:
            'Video tutorial de los comandos más utilizados en la terminal',
          tipo: 'link',
          url: 'https://youtube.com/watch?v=linux-comandos-basicos',
          tipoLink: 'youtube',
          discordInfo: null,
          materiaId: materias[4]?.id || 5,
          creadorId: usuarios[3]?.id || 4,
          fecha: new Date('2025-02-15'),
          tagIds: getTagIds(['video', 'práctica', 'guía']),
        },
        {
          titulo: 'Repositorio de Scripts Shell',
          descripcion:
            'Colección de scripts útiles para automatización en Linux',
          tipo: 'link',
          url: 'https://github.com/so-scripts/shell-scripts-2024',
          tipoLink: 'github',
          discordInfo: null,
          materiaId: materias[4]?.id || 5,
          creadorId: usuarios[4]?.id || 5,
          fecha: new Date('2025-03-20'),
          tagIds: getTagIds(['proyecto', 'código', 'práctica']),
        },
        {
          titulo: 'Discord: Comunidad de SO',
          descripcion:
            'Únete para compartir recursos y resolver dudas de sistemas operativos',
          tipo: 'link',
          url: 'https://discord.gg/invite/sistemas-op-comunidad',
          tipoLink: 'discord',
          discordInfo: { servidor: 'SO Comunidad', canal: 'recursos' },
          materiaId: materias[4]?.id || 5,
          creadorId: usuarios[5]?.id || 6,
          fecha: new Date('2025-01-30'),
          tagIds: getTagIds(['grupo-estudio', 'discord']),
        },
        {
          titulo: 'Artículo: Memoria Virtual y Paginación',
          descripcion:
            'Explicación detallada de memoria virtual, páginas y tabla de páginas',
          tipo: 'link',
          url: 'https://example.com/memoria-virtual-paginacion',
          tipoLink: 'web',
          discordInfo: null,
          materiaId: materias[4]?.id || 5,
          creadorId: usuarios[6]?.id || 7,
          fecha: new Date('2025-05-05'),
          tagIds: getTagIds(['teoría', 'documentación', 'explicación']),
        },
      ];

      // Insertar materiales
      const insertedMateriales = await queryInterface.bulkInsert(
        'Materiales',
        materiales.map((m) => ({
          titulo: m.titulo,
          descripcion: m.descripcion,
          tipo: m.tipo,
          url: m.url,
          nombreArchivo: null,
          tamanho: null,
          tipoLink: m.tipoLink,
          discordInfo: m.discordInfo ? JSON.stringify(m.discordInfo) : null,
          materiaId: m.materiaId,
          creadorId: m.creadorId,
          fecha: m.fecha,
          createdAt: now,
          updatedAt: now,
        })),
        { returning: true }
      );

      console.log(`Creados ${insertedMateriales.length} materiales`);

      // Obtener los IDs de los materiales insertados para crear las relaciones
      const createdMateriales = await queryInterface.sequelize.query(
        'SELECT id, titulo FROM "Materiales" ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Crear relaciones material-tag
      const materialTags = [];
      materiales.forEach((m, index) => {
        if (m.tagIds && m.tagIds.length > 0 && createdMateriales[index]) {
          m.tagIds.forEach((tagId) => {
            materialTags.push({
              materialId: createdMateriales[index].id,
              tagId: tagId,
              createdAt: now,
              updatedAt: now,
            });
          });
        }
      });

      if (materialTags.length > 0) {
        await queryInterface.bulkInsert('MaterialMaterialTags', materialTags);
        console.log(`Creadas ${materialTags.length} relaciones material-tag`);
      }

      // Crear ratings (votos de usuarios en materiales)
      const ratings = [
        // Material 1 (Complejidad) - tiene rating
        {
          materialId: createdMateriales[0].id,
          usuarioId: usuarios[1]?.id || 2,
          valor: 1,
        },
        {
          materialId: createdMateriales[0].id,
          usuarioId: usuarios[2]?.id || 3,
          valor: 1,
        },
        {
          materialId: createdMateriales[0].id,
          usuarioId: usuarios[3]?.id || 4,
          valor: 1,
        },
        {
          materialId: createdMateriales[0].id,
          usuarioId: usuarios[4]?.id || 5,
          valor: -1,
        },

        // Material 4 (Discord) - muy popular
        {
          materialId: createdMateriales[3].id,
          usuarioId: usuarios[0]?.id || 1,
          valor: 1,
        },
        {
          materialId: createdMateriales[3].id,
          usuarioId: usuarios[1]?.id || 2,
          valor: 1,
        },
        {
          materialId: createdMateriales[3].id,
          usuarioId: usuarios[2]?.id || 3,
          valor: 1,
        },
        {
          materialId: createdMateriales[3].id,
          usuarioId: usuarios[5]?.id || 6,
          valor: 1,
        },
        {
          materialId: createdMateriales[3].id,
          usuarioId: usuarios[7]?.id || 8,
          valor: 1,
        },

        // Material 7 (Python) - liked
        {
          materialId: createdMateriales[5].id,
          usuarioId: usuarios[3]?.id || 4,
          valor: 1,
        },
        {
          materialId: createdMateriales[5].id,
          usuarioId: usuarios[4]?.id || 5,
          valor: 1,
        },
        {
          materialId: createdMateriales[5].id,
          usuarioId: usuarios[8]?.id || 9,
          valor: 1,
        },

        // Material 10 (Discord Python) - liked
        {
          materialId: createdMateriales[8].id,
          usuarioId: usuarios[0]?.id || 1,
          valor: 1,
        },
        {
          materialId: createdMateriales[8].id,
          usuarioId: usuarios[2]?.id || 3,
          valor: 1,
        },

        // Material 15 (Videos lab) - liked
        {
          materialId: createdMateriales[13].id,
          usuarioId: usuarios[1]?.id || 2,
          valor: 1,
        },
        {
          materialId: createdMateriales[13].id,
          usuarioId: usuarios[5]?.id || 6,
          valor: 1,
        },
        {
          materialId: createdMateriales[13].id,
          usuarioId: usuarios[9]?.id || 10,
          valor: 1,
        },

        // Material 19 (Discord SO) - liked
        {
          materialId: createdMateriales[17].id,
          usuarioId: usuarios[1]?.id || 2,
          valor: 1,
        },
        {
          materialId: createdMateriales[17].id,
          usuarioId: usuarios[3]?.id || 4,
          valor: 1,
        },
        {
          materialId: createdMateriales[17].id,
          usuarioId: usuarios[6]?.id || 7,
          valor: 1,
        },

        // Algunos downvote para probar
        {
          materialId: createdMateriales[2].id,
          usuarioId: usuarios[5]?.id || 6,
          valor: -1,
        },
        {
          materialId: createdMateriales[9].id,
          usuarioId: usuarios[8]?.id || 9,
          valor: -1,
        },
      ];

      if (ratings.length > 0) {
        await queryInterface.bulkInsert(
          'MaterialRatings',
          ratings.map((r) => ({
            materialId: r.materialId,
            usuarioId: r.usuarioId,
            valor: r.valor,
            createdAt: now,
            updatedAt: now,
          }))
        );
        console.log(`Creados ${ratings.length} ratings`);
      }

      console.log('Seed de materiales completado exitosamente');
    } catch (error) {
      console.error('Error in seed-materiales:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MaterialRatings', null, {});
    await queryInterface.bulkDelete('MaterialMaterialTags', null, {});
    await queryInterface.bulkDelete('Materiales', null, {});
  },
};
