'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MotivosDenuncia', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.bulkInsert('MotivosDenuncia', [
      {
        nombre: 'Contenido pornográfico o sexual explícito',
        descripcion:
          'Material que contiene contenido sexual o pornográfico explícito',
        activo: true,
      },
      {
        nombre: 'Lenguaje ofensivo o insultos',
        descripcion:
          'Material que contiene lenguaje ofensivo, discriminatorio o insultos',
        activo: true,
      },
      {
        nombre: 'Material protegido por derechos de autor',
        descripcion:
          'Material que infringe derechos de autor o propiedad intelectual',
        activo: true,
      },
      {
        nombre: 'Spam o publicidad engañosa',
        descripcion: 'Contenido publicitario no solicitado o engañoso',
        activo: true,
      },
      {
        nombre: 'Información incorrecta o engañosa',
        descripcion: 'Material que contiene información falsa o engañosa',
        activo: true,
      },
      {
        nombre: 'Otro',
        descripcion: 'Otro motivo no especificado por el denunciante',
        activo: true,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MotivosDenuncia');
  },
};
