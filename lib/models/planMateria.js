import { Model, DataTypes } from 'sequelize';

export default class PlanMateria extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        modelName: 'PlanMateria',
      }
    );
  }

  static associate(db) {
    db.PlanMateria.belongsTo(db.PlanDeEstudio, { foreignKey: 'planId' });
    db.PlanMateria.belongsTo(db.Materia, { foreignKey: 'materiaId' });
  }
}
