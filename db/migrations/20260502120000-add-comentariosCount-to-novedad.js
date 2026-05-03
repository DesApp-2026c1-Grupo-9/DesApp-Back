export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Novedades', 'comentariosCount', {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });

  // Actualizar el contador para registros existentes
  await queryInterface.sequelize.query(`
    UPDATE "Novedades" 
    SET "comentariosCount" = (
      SELECT COUNT(*) 
      FROM "Comentarios" 
      WHERE "Comentarios"."novedadId" = "Novedades".id
    )
  `);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Novedades', 'comentariosCount');
}
