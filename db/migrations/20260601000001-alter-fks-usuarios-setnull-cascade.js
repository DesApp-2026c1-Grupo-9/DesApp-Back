'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Materiales.creadorId -> SET NULL (materials remain, creator becomes null)
    await queryInterface.removeConstraint(
      'Materiales',
      'Materiales_creadorId_fkey'
    );
    await queryInterface.changeColumn('Materiales', 'creadorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addConstraint('Materiales', {
      fields: ['creadorId'],
      type: 'foreign key',
      name: 'Materiales_creadorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // MaterialRatings.usuarioId -> CASCADE (user ratings deleted with user)
    await queryInterface.removeConstraint(
      'MaterialRatings',
      'MaterialRatings_usuarioId_fkey'
    );
    await queryInterface.addConstraint('MaterialRatings', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'MaterialRatings_usuarioId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Denuncias.denuncianteId -> CASCADE (denuncias deleted with denunciante)
    await queryInterface.removeConstraint(
      'Denuncias',
      'Denuncias_denuncianteId_fkey'
    );
    await queryInterface.addConstraint('Denuncias', {
      fields: ['denuncianteId'],
      type: 'foreign key',
      name: 'Denuncias_denuncianteId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // Denuncias.moderadorId -> SET NULL (denuncia remains, moderator becomes null)
    const constraintName = 'Denuncias_moderadorId_fkey';
    try {
      await queryInterface.removeConstraint('Denuncias', constraintName);
    } catch (e) {
      // constraint may not exist if it was never added
    }
    await queryInterface.changeColumn('Denuncias', 'moderadorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
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

  down: async (queryInterface, Sequelize) => {
    // Revert Materiales.creadorId
    await queryInterface.removeConstraint(
      'Materiales',
      'Materiales_creadorId_fkey'
    );
    await queryInterface.changeColumn('Materiales', 'creadorId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addConstraint('Materiales', {
      fields: ['creadorId'],
      type: 'foreign key',
      name: 'Materiales_creadorId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
    });

    // Revert MaterialRatings.usuarioId
    await queryInterface.removeConstraint(
      'MaterialRatings',
      'MaterialRatings_usuarioId_fkey'
    );
    await queryInterface.addConstraint('MaterialRatings', {
      fields: ['usuarioId'],
      type: 'foreign key',
      name: 'MaterialRatings_usuarioId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
    });

    // Revert Denuncias.denuncianteId
    await queryInterface.removeConstraint(
      'Denuncias',
      'Denuncias_denuncianteId_fkey'
    );
    await queryInterface.addConstraint('Denuncias', {
      fields: ['denuncianteId'],
      type: 'foreign key',
      name: 'Denuncias_denuncianteId_fkey',
      references: {
        table: 'Usuarios',
        field: 'id',
      },
    });

    // Revert Denuncias.moderadorId
    const constraintName = 'Denuncias_moderadorId_fkey';
    try {
      await queryInterface.removeConstraint('Denuncias', constraintName);
    } catch (e) {}
    await queryInterface.addConstraint('Denuncias', {
      fields: ['moderadorId'],
      type: 'foreign key',
      name: constraintName,
      references: {
        table: 'Usuarios',
        field: 'id',
      },
    });
  },
};
