import { Model, DataTypes } from 'sequelize';

export default class Material extends Model {
  static init(sequelize) {
    return super.init(
      {
        titulo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        tipo: {
          type: DataTypes.ENUM('file', 'link'),
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        nombreArchivo: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        tamanho: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        tipoLink: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        discordInfo: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        materiaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        creadorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        fecha: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        suspendido: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        suspendidoEn: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        revocado: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        revocadoEn: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Material',
        tableName: 'Materiales',
      }
    );
  }

  static associate(db) {
    db.Material.belongsTo(db.Materia, {
      foreignKey: 'materiaId',
      as: 'materia',
    });
    db.Material.belongsTo(db.Usuario, {
      foreignKey: 'creadorId',
      as: 'creador',
    });
    db.Material.belongsToMany(db.MaterialTag, {
      through: db.MaterialMaterialTag,
      foreignKey: 'materialId',
      otherKey: 'tagId',
      as: 'tags',
    });
    db.Material.hasMany(db.MaterialRating, {
      foreignKey: 'materialId',
      as: 'ratings',
    });
    db.Material.hasMany(db.Denuncia, {
      foreignKey: 'materialId',
      as: 'denuncias',
    });
  }
}
