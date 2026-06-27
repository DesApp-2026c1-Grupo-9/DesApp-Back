'use strict';

const TABLE_COLUMNS = [
  { table: 'PreferenciasEstudiante', column: 'estudianteId', constraint: 'PreferenciasEstudiante_estudianteId_fkey' },
  { table: 'SesionParticipantes', column: 'estudianteId', constraint: 'SesionParticipantes_estudianteId_fkey' },
  { table: 'Likes', column: 'usuarioId', constraint: 'Likes_usuarioId_fkey' },
  { table: 'Comentarios', column: 'usuarioId', constraint: 'Comentarios_usuarioId_fkey' },
  { table: 'ComentarioLikes', column: 'usuarioId', constraint: 'ComentarioLikes_usuarioId_fkey' },
  { table: 'Denuncias', column: 'denuncianteId', constraint: 'Denuncias_denuncianteId_fkey' },
  { table: 'Sesiones', column: 'creadorId', constraint: 'Sesiones_creadorId_fkey' },
  { table: 'Conexiones', column: 'usuarioId', constraint: 'Conexiones_usuarioId_fkey' },
  { table: 'Conexiones', column: 'contactoId', constraint: 'Conexiones_contactoId_fkey' },
  { table: 'Notificaciones', column: 'usuarioId', constraint: 'Notificaciones_usuarioId_fkey' },
  { table: 'Notificaciones', column: 'actorId', constraint: 'Notificaciones_actorId_fkey' },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const tc of TABLE_COLUMNS) {
      try {
        await queryInterface.removeConstraint(tc.table, tc.constraint);
      } catch (e) {
        console.log(`Constraint ${tc.constraint} may not exist, skipping drop`);
      }

      await queryInterface.sequelize.query(`
        UPDATE "${tc.table}" t
        SET "${tc.column}" = e.id
        FROM "Estudiantes" e
        WHERE e."usuarioId" = t."${tc.column}"
      `);

      await queryInterface.addConstraint(tc.table, {
        fields: [tc.column],
        type: 'foreign key',
        name: tc.constraint,
        references: {
          table: 'Estudiantes',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    for (const tc of TABLE_COLUMNS) {
      try {
        await queryInterface.removeConstraint(tc.table, tc.constraint);
      } catch (e) {}

      await queryInterface.sequelize.query(`
        UPDATE "${tc.table}" t
        SET "${tc.column}" = u.id
        FROM "Usuarios" u
        INNER JOIN "Estudiantes" e ON e."usuarioId" = u.id
        WHERE e.id = t."${tc.column}"
      `);

      await queryInterface.addConstraint(tc.table, {
        fields: [tc.column],
        type: 'foreign key',
        name: tc.constraint,
        references: {
          table: 'Usuarios',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  },
};
