import { Model, DataTypes } from 'sequelize';

export default class Usuario extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        apellido: DataTypes.STRING,
        fechaNacimiento: DataTypes.DATEONLY,
        avatarUrl: DataTypes.STRING,

        // Este "campo" no se persiste, se calcula a partir de otro/s.
        edad: {
          // Definimos el tipo (INTEGER) y de qué atributo/s depende (fechaNacimiento).
          type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['fechaNacimiento']),
          get: function () {
            return Math.floor(
              (new Date() - new Date(this.get('fechaNacimiento'))) /
                (1000 * 60 * 60 * 24 * 365.25)
            );
          },
        },
      },
      {
        sequelize,
        modelName: 'Usuario',
      }
    );
  }

  esTocayoDe(otroUsuario) {
    return otroUsuario.nombre === this.nombre;
  }

  static associate(models) {
    this.belongsToMany(models.Usuario, {
      through: 'Conexiones',
      as: 'contactos',
      foreignKey: 'usuarioId',
      otherKey: 'contactoId',
    });
    this.hasMany(models.Novedad, { foreignKey: 'autorId', as: 'novedades' });
    this.hasOne(models.PreferenciasEstudiante, {
      foreignKey: 'estudianteId',
      as: 'preferencias',
    });
    this.hasMany(models.Like, { foreignKey: 'usuarioId', as: 'likes' });
  }
}
