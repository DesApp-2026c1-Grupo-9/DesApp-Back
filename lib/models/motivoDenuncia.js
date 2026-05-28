import { Model, DataTypes } from 'sequelize';

export default class MotivoDenuncia extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        activo: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: 'MotivoDenuncia',
        tableName: 'MotivosDenuncia',
      }
    );
  }

  static associate(db) {
    db.MotivoDenuncia.hasMany(db.Denuncia, {
      foreignKey: 'motivoId',
      as: 'denuncias',
    });
  }
}
