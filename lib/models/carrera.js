import { Model, DataTypes } from 'sequelize';

export default class Carrera extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        titulo: DataTypes.STRING,
        instituto: DataTypes.STRING,
        duracion: DataTypes.INTEGER,
      },
      {
        sequelize,
        modelName: 'Carrera',
      }
    );
  }

  static associate(db) {
    db.Carrera.hasMany(db.PlanDeEstudio, { foreignKey: 'carreraId' });
    db.Carrera.belongsToMany(db.Estudiante, {
      through: db.EstudianteCarrera,
      foreignKey: 'carreraId',
      otherKey: 'estudianteId',
    });
  }
}
