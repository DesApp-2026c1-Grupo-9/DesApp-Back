import { Model, DataTypes } from 'sequelize';

export default class PlanMateria extends Model {
  static init(sequelize) {
    return super.init(
      {
        planId: DataTypes.INTEGER,
        materiaId: DataTypes.INTEGER,
        anio: DataTypes.INTEGER,
      },
      {
        sequelize,
        modelName: 'PlanMateria',
        tableName: 'PlanMaterias',
      }
    );
  }

  static associate(db) {
    db.PlanMateria.belongsTo(db.PlanDeEstudio, { foreignKey: 'planId' });
    db.PlanMateria.belongsTo(db.Materia, {
      foreignKey: 'materiaId',
      as: 'materia',
    });
  }
}
