import { Sequelize } from 'sequelize';

export function i18nOrder(tableAlias, field, dir) {
  return [
    Sequelize.literal(
      `LOWER(TRANSLATE(CAST("${tableAlias}"."${field}" AS TEXT), 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN'))`
    ),
    dir,
  ];
}
