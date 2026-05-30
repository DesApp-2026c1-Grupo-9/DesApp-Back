'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ConfiguracionesModeracion', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      clave: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      valor: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.bulkInsert('ConfiguracionesModeracion', [
      {
        clave: 'N_DENUNCIAS_PENDIENTES',
        valor: 10,
        descripcion:
          'Cantidad de denuncias pendientes para suspender automáticamente un material',
      },
      {
        clave: 'M_DENUNCIAS_VERIFICADAS',
        valor: 1,
        descripcion:
          'Cantidad de denuncias verificadas para suspender automáticamente un material',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ConfiguracionesModeracion');
  },
};
