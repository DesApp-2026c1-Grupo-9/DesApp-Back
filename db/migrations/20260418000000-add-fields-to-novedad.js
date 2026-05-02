'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Novedades', 'imagenUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Novedades', 'likesCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn('Novedades', 'esAutomatica', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Novedades', 'imagenUrl');
    await queryInterface.removeColumn('Novedades', 'likesCount');
    await queryInterface.removeColumn('Novedades', 'esAutomatica');
  },
};
