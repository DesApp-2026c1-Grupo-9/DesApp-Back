'use strict';

module.exports = {
  up: async (queryInterface) => {
    const enumType = 'enum_Notificaciones_tipo';
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'sesion_cancelada'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'sesion_recordatorio'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'sesion_participante_nuevo'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumType}" ADD VALUE 'sesion_solicitud_nueva'`
    );
  },

  down: async () => {
    // PostgreSQL does not support removing values from an enum.
  },
};
