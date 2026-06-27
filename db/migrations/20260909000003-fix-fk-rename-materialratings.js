'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'MaterialRatings',
      'MaterialRatings_usuarioId_fkey'
    );

    await queryInterface.removeIndex('MaterialRatings', 'material_rating_material_id_usuario_id');

    await queryInterface.renameColumn('MaterialRatings', 'usuarioId', 'estudianteId');

    await queryInterface.addConstraint('MaterialRatings', {
      fields: ['estudianteId'],
      type: 'foreign key',
      name: 'MaterialRatings_estudianteId_fkey',
      references: {
        table: 'Estudiantes',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('MaterialRatings', ['materialId', 'estudianteId'], {
      unique: true,
      name: 'material_rating_material_id_estudiante_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'MaterialRatings',
      'MaterialRatings_estudianteId_fkey'
    );

    await queryInterface.removeIndex('MaterialRatings', 'material_rating_material_id_estudiante_id');

    await queryInterface.renameColumn('MaterialRatings', 'estudianteId', 'usuarioId');

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

    await queryInterface.addIndex('MaterialRatings', ['materialId', 'usuarioId'], {
      unique: true,
      name: 'material_rating_material_id_usuario_id',
    });
  },
};
