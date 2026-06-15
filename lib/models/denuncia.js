import { Model, DataTypes } from 'sequelize';

export default class Denuncia extends Model {
  static init(sequelize) {
    return super.init(
      {
        materialId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        denuncianteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        motivoId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        detalle: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        estado: {
          type: DataTypes.ENUM(
            'pendiente',
            'confirmada',
            'rechazada',
            'revocada'
          ),
          allowNull: false,
          defaultValue: 'pendiente',
        },
        moderadorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        fechaModeracion: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Denuncia',
        tableName: 'Denuncias',
      }
    );
  }

  static associate(db) {
    db.Denuncia.belongsTo(db.Material, {
      foreignKey: 'materialId',
      as: 'material',
    });
    db.Denuncia.belongsTo(db.Usuario, {
      foreignKey: 'denuncianteId',
      as: 'denunciante',
    });
    db.Denuncia.belongsTo(db.MotivoDenuncia, {
      foreignKey: 'motivoId',
      as: 'motivo',
    });
    db.Denuncia.belongsTo(db.Usuario, {
      foreignKey: 'moderadorId',
      as: 'moderador',
    });
  }
}
