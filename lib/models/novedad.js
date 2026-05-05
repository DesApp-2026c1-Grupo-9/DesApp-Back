import { Model, DataTypes } from 'sequelize';

export default class Novedad extends Model {
  static init(sequelize) {
    return super.init(
      {
        tipo: {
          type: DataTypes.ENUM(
            'posteo',
            'inscripcion',
            'regularizacion',
            'aprobacion'
          ),
          allowNull: false,
        },
        titulo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        contenido: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        imagenUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        materiaId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        visible: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        esAutomatica: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        likesCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        comentariosCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        editedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        autorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Novedad',
        tableName: 'Novedades',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'autorId', as: 'autor' });
    this.belongsTo(models.PreferenciasEstudiante, {
      foreignKey: 'autorId',
      targetKey: 'estudianteId',
      as: 'preferencias',
    });
    this.belongsTo(models.Materia, { foreignKey: 'materiaId', as: 'materia' });
    this.hasMany(models.Like, { foreignKey: 'novedadId', as: 'likes' });
    this.hasMany(models.Comentario, {
      foreignKey: 'novedadId',
      as: 'comentarios',
    });
  }
}
