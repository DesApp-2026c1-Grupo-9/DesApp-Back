'use strict';

const RENAMES = [
  ['Inglés I (Tecnicatura)', 'Inglés I'],
  ['Inglés II (Tecnicatura)', 'Inglés II'],
  ['Bases de Datos (Tecnicatura)', 'Bases de Datos'],
  ['Programación de objetos I (Tecnicatura)', 'Programación con Objetos I'],
  ['Programación de objetos II (Tecnicatura)', 'Programación con Objetos II'],
  [
    'Construcción de interfaces de usuario (Tecnicatura)',
    'Construcción de Interfaces de Usuario',
  ],
  ['Estructuras de datos (Tecnicatura)', 'Estructuras de Datos'],
  ['Estrategias de persistencia (Tecnicatura)', 'Estrategias de Persistencia'],
  [
    'Elementos de ingeniería de software (Tecnicatura)',
    'Elementos de Ingeniería de Software',
  ],
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Renombrando materias compartidas a nombres canónicos...');
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const [nombreAnterior, nombreNuevo] of RENAMES) {
        await queryInterface.sequelize.query(
          'UPDATE "Materias" SET nombre = :nombreNuevo WHERE nombre = :nombreAnterior',
          {
            replacements: { nombreAnterior, nombreNuevo },
            transaction,
          }
        );
        console.log(`   ✅ ${nombreAnterior} -> ${nombreNuevo}`);
      }

      await transaction.commit();
      console.log('✅ Renombre de materias completado');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error renombrando materias compartidas:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revirtiendo renombre de materias compartidas...');
    const transaction = await queryInterface.sequelize.transaction();

    try {
      for (const [nombreAnterior, nombreNuevo] of RENAMES) {
        await queryInterface.sequelize.query(
          'UPDATE "Materias" SET nombre = :nombreAnterior WHERE nombre = :nombreNuevo',
          {
            replacements: { nombreAnterior, nombreNuevo },
            transaction,
          }
        );
      }

      await transaction.commit();
      console.log('✅ Renombre revertido');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
