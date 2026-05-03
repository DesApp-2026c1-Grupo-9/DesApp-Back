import { Model, DataTypes } from 'sequelize';

export default class Estudiante extends Model {
  static init(sequelize) {
    return super.init(
      {
        perfilPublico: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        mostrarEmail: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        mostrarSituacionAcademica: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: 'Estudiante',
        tableName: 'Estudiantes',
      }
    );
  }

  static associate(db) {
    db.Estudiante.belongsTo(db.Usuario, {
      foreignKey: 'usuarioId',
      unique: true,
    });
    db.Estudiante.belongsToMany(db.Carrera, {
      through: db.EstudianteCarrera,
      foreignKey: 'estudianteId',
      otherKey: 'carreraId',
    });
  }
}
