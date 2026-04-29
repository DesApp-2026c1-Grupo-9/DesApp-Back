import { Model, DataTypes } from 'sequelize';

export default class Materia extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        anio: DataTypes.INTEGER,
        tipo: DataTypes.ENUM('anual', 'cuatrimestral'),
        cargaHoraria: DataTypes.INTEGER,
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
  }
}
