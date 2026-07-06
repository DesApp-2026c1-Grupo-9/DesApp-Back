import { Model, DataTypes } from 'sequelize';

export default class Notificacion extends Model {
  static init(sequelize) {
    return super.init(
      {
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        tipo: {
          type: DataTypes.ENUM(
            'sesion_creada_conexion',
            'sesion_creada_materia',
            'sesion_cancelada',
            'sesion_recordatorio',
            'sesion_participante_nuevo',
            'sesion_solicitud_nueva',
            'denuncia_recibida',
            'material_suspendido',
            'material_revocado',
            'conexion_aprobo_materia',
            'novedad_like',
            'novedad_comentario',
            'comentario_respuesta'
          ),
          allowNull: false,
        },
        titulo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        leido: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        actorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        materiaId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        sesionId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        denunciaId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        materialId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        novedadId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Notificacion',
        tableName: 'Notificaciones',
      }
    );
  }

  static associate(db) {
    this.belongsTo(db.Estudiante, { foreignKey: 'usuarioId', as: 'usuario' });
    this.belongsTo(db.Estudiante, { foreignKey: 'actorId', as: 'actor' });
    this.belongsTo(db.Materia, { foreignKey: 'materiaId', as: 'materia' });
    this.belongsTo(db.Sesion, { foreignKey: 'sesionId', as: 'sesion' });
    this.belongsTo(db.Denuncia, {
      foreignKey: 'denunciaId',
      as: 'denuncia',
    });
    this.belongsTo(db.Material, { foreignKey: 'materialId', as: 'material' });
    this.belongsTo(db.Novedad, { foreignKey: 'novedadId', as: 'novedad' });
  }
}
