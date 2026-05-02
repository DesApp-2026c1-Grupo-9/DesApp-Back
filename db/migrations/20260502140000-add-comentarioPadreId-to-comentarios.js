module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Comentarios', 'comentarioPadreId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Comentarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Comentarios', 'comentarioPadreId');
  },
};
