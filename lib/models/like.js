import { Model, DataTypes } from 'sequelize';

export default class Like extends Model {
  static init(sequelize) {
    return super.init(
      {
        novedadId: { type: DataTypes.INTEGER, allowNull: false },
        usuarioId: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: 'Like',
        tableName: 'Likes',
        indexes: [{ unique: true, fields: ['novedadId', 'usuarioId'] }],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Novedad, { foreignKey: 'novedadId', as: 'novedad' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  }
}
