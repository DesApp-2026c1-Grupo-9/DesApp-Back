import { Model, DataTypes } from 'sequelize';

export default class Materia extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        codigo: DataTypes.STRING,
        tipo: DataTypes.ENUM('anual', 'cuatrimestral'),
      },
      {
        sequelize,
        modelName: 'Materia',
        tableName: 'Materias',
      }
    );
  }

  static associate(db) {
    db.Materia.belongsToMany(db.PlanDeEstudio, {
      through: db.PlanMateria,
      foreignKey: 'materiaId',
      otherKey: 'planId',
    });
    db.Materia.belongsToMany(db.Materia, {
      as: 'Prerrequisitos',
      through: db.Correlatividades,
      foreignKey: 'materiaId',
      otherKey: 'prerrequisitoId',
    });
    db.Materia.belongsToMany(db.Carrera, {
      through: db.CarreraMateria,
      foreignKey: 'materiaId',
      otherKey: 'carreraId',
    });
  }
}
