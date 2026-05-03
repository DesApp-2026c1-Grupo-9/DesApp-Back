import { Model, DataTypes } from 'sequelize';

export default class PlanDeEstudio extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        estado: DataTypes.ENUM('vigente', 'transición', 'discontinuado'),
        carreraId: DataTypes.INTEGER,
      },
      {
        sequelize,
        modelName: 'PlanDeEstudio',
        tableName: 'PlanesDeEstudio',
      }
    );
  }

  static associate(db) {
    db.PlanDeEstudio.belongsTo(db.Carrera, { foreignKey: 'carreraId' });
    db.PlanDeEstudio.belongsToMany(db.Materia, {
      through: db.PlanMateria,
      foreignKey: 'planId',
      otherKey: 'materiaId',
    });
  }
}
