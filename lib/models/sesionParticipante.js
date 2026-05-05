import { Model, DataTypes } from 'sequelize';

export default class SesionParticipante extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        sesionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Sesiones', key: 'id' }
        },
        estudianteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Usuarios', key: 'id' }
        },
        estado: {
          type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
          defaultValue: 'pendiente'
        }
      },
      {
        sequelize,
        modelName: 'SesionParticipante',
        tableName: 'SesionParticipantes',
        indexes: [
          { unique: true, fields: ['sesionId', 'estudianteId'] }
        ]
      }
    );
  }

  static associate(db) {
    SesionParticipante.belongsTo(db.Sesion, { foreignKey: 'sesionId', as: 'sesion' });
    SesionParticipante.belongsTo(db.Usuario, { foreignKey: 'estudianteId', as: 'estudiante' });
  }
}
