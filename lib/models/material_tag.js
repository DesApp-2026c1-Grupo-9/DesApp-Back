import { Model, DataTypes } from 'sequelize';

export default class MaterialTag extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: 'MaterialTag',
        tableName: 'MaterialTags',
      }
    );
  }

  static associate(db) {
    db.MaterialTag.belongsToMany(db.Material, {
      through: db.MaterialMaterialTag,
      foreignKey: 'tagId',
      otherKey: 'materialId',
      as: 'materiales',
    });
  }
}