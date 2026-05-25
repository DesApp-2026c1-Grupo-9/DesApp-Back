'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EstudianteMaterias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      estudianteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Estudiantes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      materiaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Materias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estado: {
        type: Sequelize.ENUM(
          'aprobada',
          'regularizada',
          'cursando',
          'no_cursada'
        ),
        allowNull: false,
        defaultValue: 'no_cursada',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex(
      'EstudianteMaterias',
      ['estudianteId', 'materiaId'],
      {
        unique: true,
        name: 'estudiante_materia_unique',
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('EstudianteMaterias');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_EstudianteMaterias_estado";'
    );
  },
};
