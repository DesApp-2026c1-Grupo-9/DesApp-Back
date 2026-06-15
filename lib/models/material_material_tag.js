import { Model, DataTypes } from 'sequelize';

export default class MaterialMaterialTag extends Model {
  static init(sequelize) {
    return super.init(
      {
        materialId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        tagId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'MaterialMaterialTag',
        tableName: 'MaterialMaterialTags',
        indexes: [
          {
            unique: true,
            fields: ['materialId', 'tagId'],
          },
        ],
      }
    );
  }

  static associate(db) {
    db.MaterialMaterialTag.belongsTo(db.Material, { foreignKey: 'materialId' });
    db.MaterialMaterialTag.belongsTo(db.MaterialTag, { foreignKey: 'tagId' });
  }
}
