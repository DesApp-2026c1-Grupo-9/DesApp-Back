'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const constraintName = 'Denuncias_moderadorId_fkey';
    try {
      await queryInterface.removeConstraint('Denuncias', constraintName);
    } catch (e) {}

    await queryInterface.sequelize.query(`
      UPDATE "Denuncias" d
      SET "moderadorId" = a.id
      FROM "Administradores" a
      WHERE a."usuarioId" = d."moderadorId"
    `);

    await queryInterface.addConstraint('Denuncias', {
      fields: ['moderadorId'],
      type: 'foreign key',
      name: constraintName,
      references: {
        table: 'Administradores',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    const constraintName = 'Denuncias_moderadorId_fkey';
    try {
      await queryInterface.removeConstraint('Denuncias', constraintName);
    } catch (e) {}

    await queryInterface.sequelize.query(`
      UPDATE "Denuncias" d
      SET "moderadorId" = u.id
      FROM "Usuarios" u
      INNER JOIN "Administradores" a ON a."usuarioId" = u.id
      WHERE a.id = d."moderadorId"
    `);

    await queryInterface.addConstraint('Denuncias', {
      fields: ['moderadorId'],
      type: 'foreign key',
      name: constraintName,
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
