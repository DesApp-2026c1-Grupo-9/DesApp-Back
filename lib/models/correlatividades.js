import { Model, DataTypes } from 'sequelize';

export default class Correlatividades extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        modelName: 'Correlatividades',
      }
    );
  }

  static associate(db) {
    db.Correlatividades.belongsTo(db.Materia, { as: 'Materia', foreignKey: 'materiaId' });
    db.Correlatividades.belongsTo(db.Materia, { as: 'Prerrequisito', foreignKey: 'prerrequisitoId' });
  }
}
