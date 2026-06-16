'use strict';

// Mapeo de códigos para materias existentes
const CODIGOS_MATERIAS = {
  'Inglés I': 'ING101',
  'Inglés I (Tecnicatura)': 'ING101',
  'Inglés I (IA)': 'ING101',
  'Inglés II': 'ING102',
  'Inglés II (Tecnicatura)': 'ING102',
  'Inglés II (IA)': 'ING102',
  'Bases de Datos': 'BD101',
  'Bases de Datos (Tecnicatura)': 'BD101',
  'Bases de datos (IA)': 'BD101',
  'Programación con Objetos I': 'POO101',
  'Programación de objetos I (Tecnicatura)': 'POO101',
  'Programación de Objetos II': 'POO102',
  'Programación de objetos II (Tecnicatura)': 'POO102',
  'Programación Estructurada': 'PROG101',
  'Matemática I': 'MAT101',
  'Matemática para informática I': 'MAT101',
  'Matemática para informática I (IA)': 'MAT101',
  'Matemática II': 'MAT102',
  'Matemática para Informática II': 'MAT102',
  'Matemática III': 'MAT103',
  'Introducción a la Programación': 'PROG100',
  'Introducción a lógica y problemas computacionales': 'LOG101',
  'Introducción a lógica y problemas computacionales (IA)': 'LOG101',
  'Sistemas Operativos': 'SO101',
  'Redes de Computadoras': 'RED101',
  'Organización de Computadoras': 'ORG101',
  'Organización de computadoras I': 'ORG101',
  'Construcción de Interfaces de Usuario': 'UI101',
  'Construcción de interfaces de usuario (Tecnicatura)': 'UI101',
  'Estructuras de Datos': 'ED101',
  'Estructuras de datos (Tecnicatura)': 'ED101',
  'Estrategias de Persistencia': 'PERS101',
  'Estrategias de persistencia (Tecnicatura)': 'PERS101',
  'Elementos de Ingeniería de Software': 'ING_SW101',
  'Elementos de ingeniería de software (Tecnicatura)': 'ING_SW101',
  'Probabilidad y Estadística': 'PROB101',
  'Probabilidad y estadística (IA)': 'PROB101',
  'Materia UNAHUR': 'UNAHUR101',
  'Materia UNAHUR (IA)': 'UNAHUR101',
  'Materia UNAHUR I': 'UNAHUR101',
  'Materia UNAHUR II': 'UNAHUR102',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando migración: actualizando códigos de materias...');

    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const [nombre, codigo] of Object.entries(CODIGOS_MATERIAS)) {
        await queryInterface.sequelize.query(
          'UPDATE "Materias" SET codigo = :codigo WHERE nombre = :nombre',
          {
            replacements: { codigo, nombre },
            transaction,
          }
        );
        console.log(`   ✅ ${nombre} => ${codigo}`);
      }

      await transaction.commit();
      console.log('✅ Migración completada: todos los códigos actualizados');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revirtiendo migración: limpiando códigos...');
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'UPDATE "Materias" SET codigo = NULL',
        { transaction }
      );
      await transaction.commit();
      console.log('✅ Códigos limpiados');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
