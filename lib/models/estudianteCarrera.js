import { Model } from 'sequelize';

export default class EstudianteCarrera extends Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        modelName: 'EstudianteCarrera',
        tableName: 'EstudianteCarreras',
      }
    );
  }

  static associate(db) {
    db.EstudianteCarrera.belongsTo(db.Estudiante, {
      foreignKey: 'estudianteId',
    });
    db.EstudianteCarrera.belongsTo(db.Carrera, { foreignKey: 'carreraId' });
  }
}
