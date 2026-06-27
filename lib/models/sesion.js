import { Model, DataTypes } from 'sequelize';

export default class Sesion extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        materiaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'Materias', key: 'id' },
        },
        creadorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        tema: { type: DataTypes.STRING, allowNull: false },
        tipo: {
          type: DataTypes.ENUM('virtual', 'presencial'),
          allowNull: false,
        },
        link: { type: DataTypes.STRING, allowNull: true },
        ubicacion: { type: DataTypes.STRING, allowNull: true },
        fechaHora: { type: DataTypes.DATE, allowNull: false },
        duracion: { type: DataTypes.INTEGER, allowNull: false },
        cupos: { type: DataTypes.INTEGER, allowNull: true },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        necesidadAprobacion: { type: DataTypes.BOOLEAN, defaultValue: false },
        estado: {
          type: DataTypes.ENUM('activa', 'cancelada', 'finalizada'),
          defaultValue: 'activa',
        },
      },
      {
        sequelize,
        modelName: 'Sesion',
        tableName: 'Sesiones',
      }
    );
  }

  static associate(db) {
    Sesion.belongsTo(db.Materia, { foreignKey: 'materiaId' });
    Sesion.belongsTo(db.Estudiante, { foreignKey: 'creadorId', as: 'creador' });
    Sesion.hasMany(db.SesionParticipante, {
      foreignKey: 'sesionId',
      as: 'participantes',
    });
  }
}
