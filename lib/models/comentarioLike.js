import { Model, DataTypes } from 'sequelize';

export default class ComentarioLike extends Model {
  static init(sequelize) {
    return super.init(
      {
        comentarioId: {
          type: DataTypes.INTEGER, // Corregido: sin la E extra
          allowNull: false,
        },
        usuarioId: {
          type: DataTypes.INTEGER, // Corregido: sin la E extra
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'ComentarioLike',
        tableName: 'ComentarioLikes',
        // El índice único garantiza la integridad: un usuario, un like por comentario
        indexes: [{ unique: true, fields: ['comentarioId', 'usuarioId'] }],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Comentario, {
      foreignKey: 'comentarioId',
      as: 'comentario',
    });
    this.belongsTo(models.Estudiante, { foreignKey: 'usuarioId', as: 'usuario' });
  }
}
