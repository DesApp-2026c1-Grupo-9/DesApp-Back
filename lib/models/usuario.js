import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default class Usuario extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: DataTypes.STRING,
        apellido: DataTypes.STRING,
        fechaNacimiento: DataTypes.DATEONLY,
        avatarUrl: DataTypes.STRING,
        genero: {
          type: DataTypes.ENUM(
            'femenino',
            'masculino',
            'no binario',
            'sin especificar'
          ),
          defaultValue: 'sin especificar',
        },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        rol: {
          type: DataTypes.ENUM('estudiante', 'administrador'),
          defaultValue: 'estudiante',
        },
        activo: { type: DataTypes.BOOLEAN, defaultValue: true },

        edad: {
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
        tableName: 'Usuarios',
        hooks: {
          beforeCreate: async (usuario) => {
            if (usuario.password && !usuario.password.startsWith('$2a$')) {
              const salt = await bcrypt.genSalt(10);
              usuario.password = await bcrypt.hash(usuario.password, salt);
            }
          },
          beforeUpdate: async (usuario) => {
            if (
              usuario.changed('password') &&
              usuario.password &&
              !usuario.password.startsWith('$2a$')
            ) {
              const salt = await bcrypt.genSalt(10);
              usuario.password = await bcrypt.hash(usuario.password, salt);
            }
          },
        },
      }
    );
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  esTocayoDe(otroUsuario) {
    return otroUsuario.nombre === this.nombre;
  }

  static associate(models) {
    this.hasOne(models.Estudiante, { foreignKey: 'usuarioId' });
    this.hasOne(models.Administrador, { foreignKey: 'usuarioId' });
  }
}
