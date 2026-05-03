module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Comentarios', 'editedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Comentarios', 'editedAt');
  },
};
