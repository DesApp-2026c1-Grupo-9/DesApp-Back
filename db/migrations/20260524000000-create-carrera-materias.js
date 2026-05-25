module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CarreraMaterias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      carreraId: {
        type: Sequelize.INTEGER,
        references: { model: 'Carreras', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      materiaId: {
        type: Sequelize.INTEGER,
        references: { model: 'Materias', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addConstraint('CarreraMaterias', {
      fields: ['carreraId', 'materiaId'],
      type: 'unique',
      name: 'unique_carrera_materia',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('CarreraMaterias');
  },
};
