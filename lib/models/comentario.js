import { Model, DataTypes } from 'sequelize';

export default class Comentario extends Model {
  static init(sequelize) {
    return super.init(
      {
        contenido: {
          type: DataTypes.TEXT, // Corregido de EXT a TEXT
          allowNull: false,
        },
        novedadId: {
          type: DataTypes.INTEGER, // Corregido: removida la E extra
          allowNull: false,
        },
        usuarioId: {
          type: DataTypes.INTEGER, // Corregido: removida la E extra
          allowNull: false,
        },
        comentarioPadreId: {
          type: DataTypes.INTEGER, // Corregido: removida la E extra
          allowNull: true,
        },
        editedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Comentario',
        tableName: 'Comentarios',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Novedad, { foreignKey: 'novedadId', as: 'novedad' });
    this.belongsTo(models.Estudiante, { foreignKey: 'usuarioId', as: 'autor' });

    // Relación recursiva para manejar hilos de respuestas
    this.belongsTo(models.Comentario, {
      foreignKey: 'comentarioPadreId',
      as: 'parent',
    });
    this.hasMany(models.Comentario, {
      foreignKey: 'comentarioPadreId',
      as: 'respuestas',
    });

    // Relación para la funcionalidad de likes
    this.hasMany(models.ComentarioLike, {
      foreignKey: 'comentarioId',
      as: 'likes',
    });
  }
}
