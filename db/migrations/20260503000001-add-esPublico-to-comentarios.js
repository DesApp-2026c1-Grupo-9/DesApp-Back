export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Comentarios', 'esPublico', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Comentarios', 'esPublico');
}
