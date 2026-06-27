import { Model, DataTypes } from 'sequelize';

export default class Estudiante extends Model {
  static init(sequelize) {
    return super.init(
      {},
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
    db.Estudiante.hasMany(db.EstudianteMateria, {
      foreignKey: 'estudianteId',
    });
    db.Estudiante.hasOne(db.PreferenciasEstudiante, {
      foreignKey: 'estudianteId',
      as: 'preferencias',
    });
    db.Estudiante.hasMany(db.Like, {
      foreignKey: 'usuarioId',
      as: 'likes',
    });
    db.Estudiante.hasMany(db.Comentario, {
      foreignKey: 'usuarioId',
      as: 'comentarios',
    });
    db.Estudiante.hasMany(db.ComentarioLike, {
      foreignKey: 'usuarioId',
      as: 'comentarioLikes',
    });
    db.Estudiante.hasMany(db.Novedad, {
      foreignKey: 'estudianteId',
      as: 'novedades',
    });
    db.Estudiante.hasMany(db.Material, {
      foreignKey: 'estudianteId',
      as: 'materiales',
    });
    db.Estudiante.hasMany(db.MaterialRating, {
      foreignKey: 'estudianteId',
      as: 'ratings',
    });
    db.Estudiante.hasMany(db.Denuncia, {
      foreignKey: 'denuncianteId',
      as: 'denunciasRealizadas',
    });
    db.Estudiante.hasMany(db.Sesion, {
      foreignKey: 'creadorId',
      as: 'sesiones',
    });
    db.Estudiante.hasMany(db.SesionParticipante, {
      foreignKey: 'estudianteId',
      as: 'participaciones',
    });
    db.Estudiante.hasMany(db.Notificacion, {
      foreignKey: 'usuarioId',
      as: 'notificaciones',
    });
    db.Estudiante.hasMany(db.Notificacion, {
      foreignKey: 'actorId',
      as: 'notificacionesActor',
    });
    db.Estudiante.belongsToMany(db.Estudiante, {
      through: db.Conexion,
      as: 'contactos',
      foreignKey: 'usuarioId',
      otherKey: 'contactoId',
    });
  }
}
