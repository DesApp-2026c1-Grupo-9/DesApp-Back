import { Model, DataTypes } from 'sequelize';

export default class EstudianteMateria extends Model {
  static init(sequelize) {
    return super.init(
      {
        estudianteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        materiaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM(
            'aprobada',
            'regularizada',
            'cursando',
            'no_cursada'
          ),
          allowNull: false,
          defaultValue: 'no_cursada',
        },
      },
      {
        sequelize,
        modelName: 'EstudianteMateria',
        tableName: 'EstudianteMaterias',
        indexes: [
          {
            unique: true,
            fields: ['estudianteId', 'materiaId'],
          },
        ],
      }
    );
  }

  static associate(db) {
    db.EstudianteMateria.belongsTo(db.Estudiante, {
      foreignKey: 'estudianteId',
    });
    db.EstudianteMateria.belongsTo(db.Materia, { foreignKey: 'materiaId' });
  }
}
