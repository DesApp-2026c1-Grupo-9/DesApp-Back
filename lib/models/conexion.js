import { Model, DataTypes } from 'sequelize';

export default class Conexion extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        contactoId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
          defaultValue: 'pendiente',
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Conexion',
        tableName: 'Conexiones',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'contactoId',
      as: 'contacto',
    });
  }
}
