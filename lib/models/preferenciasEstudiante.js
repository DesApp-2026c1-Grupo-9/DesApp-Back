import { Model, DataTypes } from 'sequelize';

export default class PreferenciasEstudiante extends Model {
  static init(sequelize) {
    return super.init(
      {
        estudianteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
        },
        publicarInscripciones: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        publicarRegularizaciones: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        publicarAprobaciones: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        perfilPublico: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        mostrarEmail: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        mostrarSituacionAcademica: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        visibleEnDescubrir: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        publicarSesiones: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: 'PreferenciasEstudiante',
        tableName: 'PreferenciasEstudiante',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: 'estudianteId',
      as: 'estudiante',
    });
    this.hasMany(models.Novedad, {
      foreignKey: 'autorId',
      sourceKey: 'estudianteId',
      as: 'novedades',
    });
  }
}
