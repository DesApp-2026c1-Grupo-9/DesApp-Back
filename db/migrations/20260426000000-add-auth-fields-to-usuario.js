'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuarios', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuarios', 'rol', {
      type: Sequelize.ENUM('estudiante', 'administrador'),
      defaultValue: 'estudiante',
      allowNull: true,
    });

    await queryInterface.addColumn('Usuarios', 'activo', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    });

    const users = await queryInterface.sequelize.query('SELECT id FROM Usuarios;');
    for (const user of users[0]) {
      await queryInterface.bulkUpdate('Usuarios', {
        email: `user${user.id}@example.com`,
        password: 'dummyhash',
        rol: 'estudiante',
        activo: true,
      }, { id: user.id });
    }

    await queryInterface.changeColumn('Usuarios', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('Usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Usuarios', 'rol', {
      type: Sequelize.ENUM('estudiante', 'administrador'),
      allowNull: false,
      defaultValue: 'estudiante',
    });

    await queryInterface.changeColumn('Usuarios', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuarios', 'activo');
    await queryInterface.removeColumn('Usuarios', 'rol');
    await queryInterface.removeColumn('Usuarios', 'password');
    await queryInterface.removeColumn('Usuarios', 'email');
  },
};
