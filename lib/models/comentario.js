import { Model, DataTypes } from 'sequelize';

export default class Comentario extends Model {
  static init(sequelize) {
    return super.init(
      {
        contenido: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        novedadId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
    this.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor' });
  }
}
