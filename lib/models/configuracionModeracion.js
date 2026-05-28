import { Model, DataTypes } from 'sequelize';

export default class ConfiguracionModeracion extends Model {
  static init(sequelize) {
    return super.init(
      {
        clave: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        valor: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'ConfiguracionModeracion',
        tableName: 'ConfiguracionesModeracion',
      }
    );
  }

  // eslint-disable-next-line no-unused-vars
  static associate(_db) {}
}
