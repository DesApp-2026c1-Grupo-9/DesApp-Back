export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ComentarioLikes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    comentarioId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Comentarios',
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

  await queryInterface.addIndex('ComentarioLikes', ['comentarioId']);
  await queryInterface.addIndex('ComentarioLikes', ['usuarioId']);
  await queryInterface.addIndex(
    'ComentarioLikes',
    ['comentarioId', 'usuarioId'],
    {
      unique: true,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ComentarioLikes');
}
