export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Comentarios', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    contenido: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    novedadId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Novedades',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    usuarioId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.addIndex('Comentarios', ['novedadId']);
  await queryInterface.addIndex('Comentarios', ['usuarioId']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Comentarios');
}
