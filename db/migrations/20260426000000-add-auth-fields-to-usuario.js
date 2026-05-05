'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar el tipo enum si existe para evitar conflictos
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Usuarios_rol" CASCADE;
    `);

    // Verificar y agregar columna email si no existe
    const emailExists = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'Usuarios' AND column_name = 'email';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (emailExists.length === 0) {
      await queryInterface.addColumn('Usuarios', 'email', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Verificar y agregar columna password si no existe
    const passwordExists = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'Usuarios' AND column_name = 'password';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (passwordExists.length === 0) {
      await queryInterface.addColumn('Usuarios', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Verificar y agregar columna rol si no existe
    const rolExists = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'Usuarios' AND column_name = 'rol';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (rolExists.length === 0) {
      await queryInterface.addColumn('Usuarios', 'rol', {
        type: Sequelize.ENUM('estudiante', 'administrador'),
        defaultValue: 'estudiante',
        allowNull: true,
      });
    }

    // Verificar y agregar columna activo si no existe
    const activoExists = await queryInterface.sequelize.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'Usuarios' AND column_name = 'activo';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (activoExists.length === 0) {
      await queryInterface.addColumn('Usuarios', 'activo', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      });
    }

    // Actualizar usuarios existentes con valores por defecto
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Usuarios";'
    );
    for (const user of users[0]) {
      await queryInterface.bulkUpdate(
        'Usuarios',
        {
          email: `user${user.id}@example.com`,
          password: 'dummyhash',
          rol: 'estudiante',
          activo: true,
        },
        { id: user.id }
      );
    }

    // Hacer las columnas obligatorias
    await queryInterface.sequelize.query(`
      ALTER TABLE "Usuarios" 
      ALTER COLUMN email SET NOT NULL,
      ALTER COLUMN password SET NOT NULL,
      ALTER COLUMN rol SET NOT NULL,
      ALTER COLUMN activo SET NOT NULL;
    `);

    // Agregar unique constraint para email si no existe
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'Usuarios_email_key'
        ) THEN
          ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_email_key" UNIQUE (email);
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Usuarios" DROP CONSTRAINT IF EXISTS "Usuarios_email_key";
    `);
    await queryInterface.removeColumn('Usuarios', 'activo');
    await queryInterface.removeColumn('Usuarios', 'rol');
    await queryInterface.removeColumn('Usuarios', 'password');
    await queryInterface.removeColumn('Usuarios', 'email');
  },
};
