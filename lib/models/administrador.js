import { Model, DataTypes } from 'sequelize';

export default class Administrador extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        modelName: 'Administrador',
        tableName: 'Administradores',
      }
    );
  }

  static associate(db) {
    db.Administrador.belongsTo(db.Usuario, {
      foreignKey: 'usuarioId',
      unique: true,
    });
    db.Administrador.hasMany(db.Denuncia, {
      foreignKey: 'moderadorId',
      as: 'denunciasModeradas',
    });
  }
}
