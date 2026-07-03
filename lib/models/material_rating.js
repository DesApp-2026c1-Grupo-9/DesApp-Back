import { Model, DataTypes } from 'sequelize';

export default class MaterialRating extends Model {
  static init(sequelize) {
    return super.init(
      {
        materialId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        estudianteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        valor: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            isIn: [[1, -1]],
          },
        },
      },
      {
        sequelize,
        modelName: 'MaterialRating',
        tableName: 'MaterialRatings',
        indexes: [
          {
            unique: true,
            fields: ['materialId', 'estudianteId'],
          },
        ],
      }
    );
  }

  static associate(db) {
    db.MaterialRating.belongsTo(db.Material, { foreignKey: 'materialId' });
    db.MaterialRating.belongsTo(db.Estudiante, { foreignKey: 'estudianteId' });
  }
}
