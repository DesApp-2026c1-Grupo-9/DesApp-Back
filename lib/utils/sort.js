import { Sequelize } from 'sequelize';

export function i18nOrder(tableAlias, field, dir) {
  return [
    Sequelize.literal(
      `LOWER(TRANSLATE("${tableAlias}"."${field}", 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN'))`
    ),
    dir,
  ];
}
