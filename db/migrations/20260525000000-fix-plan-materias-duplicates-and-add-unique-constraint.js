'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Eliminar correlatividades que referencian materias viejas
    //    ("Programación I" y "Programación II" del seeder anterior)
    await queryInterface.sequelize.query(`
      DELETE FROM "Correlatividades"
      WHERE "materiaId" IN (
        SELECT id FROM "Materias" WHERE nombre IN ('Programación I', 'Programación II')
      )
      OR "prerrequisitoId" IN (
        SELECT id FROM "Materias" WHERE nombre IN ('Programación I', 'Programación II')
      )
    `);

    // 2. Eliminar PlanMaterias de materias viejas que no pertenecen al plan actual
    //    (materias "Programación I" y "Programación II" que sobran del seeder anterior)
    await queryInterface.sequelize.query(`
      DELETE FROM "PlanMaterias"
      WHERE "materiaId" IN (
        SELECT id FROM "Materias" WHERE nombre IN ('Programación I', 'Programación II')
      )
    `);

    // 3. Eliminar duplicados en PlanMaterias (por si acaso)
    await queryInterface.sequelize.query(`
      DELETE FROM "PlanMaterias"
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM "PlanMaterias"
        GROUP BY "planId", "materiaId"
      )
    `);

    // 4. Agregar unique constraint a PlanMaterias para prevenir futuros duplicados
    await queryInterface.addConstraint('PlanMaterias', {
      type: 'unique',
      fields: ['planId', 'materiaId'],
      name: 'unique_plan_materia',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'PlanMaterias',
      'unique_plan_materia'
    );
  },
};
