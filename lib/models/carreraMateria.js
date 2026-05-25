import { Model } from 'sequelize';

export default class CarreraMateria extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        modelName: 'CarreraMateria',
        tableName: 'CarreraMaterias',
      }
    );
  }

  static associate(db) {
    db.CarreraMateria.belongsTo(db.Carrera, { foreignKey: 'carreraId' });
    db.CarreraMateria.belongsTo(db.Materia, { foreignKey: 'materiaId' });
  }
}
