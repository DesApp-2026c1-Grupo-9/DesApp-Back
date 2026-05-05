-- Script para limpiar duplicados y preparar la base de datos
-- EJECUTAR ANTES de correr las migraciones y seeders

-- 1. Eliminar duplicados en Carreras (mantener el primero y eliminar el resto)
DELETE FROM "Carreras"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "Carreras"
  GROUP BY nombre
);

-- 2. Eliminar duplicados en PlanesDeEstudio (mantener el primero y eliminar el resto)
DELETE FROM "PlanesDeEstudio"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "PlanesDeEstudio"
  GROUP BY "carreraId", estado
);

-- 3. Eliminar duplicados en Materias (mantener el primero y eliminar el resto)
DELETE FROM "Materias"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "Materias"
  GROUP BY nombre, anio
);

-- 4. Eliminar duplicados en PlanMaterias
DELETE FROM "PlanMaterias"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "PlanMaterias"
  GROUP BY "planId", "materiaId"
);

-- 5. Eliminar duplicados en Correlatividades
DELETE FROM "Correlatividades"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "Correlatividades"
  GROUP BY "materiaId", "prerrequisitoId"
);

-- 6. Eliminar duplicados en EstudianteCarreras
DELETE FROM "EstudianteCarreras"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "EstudianteCarreras"
  GROUP BY "estudianteId", "carreraId"
);

-- Verificar que no hay duplicados
SELECT 'Carreras' as tabla, COUNT(*) as total, COUNT(DISTINCT nombre) as unicos FROM "Carreras"
UNION ALL
SELECT 'PlanesDeEstudio', COUNT(*), COUNT(DISTINCT "carreraId" || estado) FROM "PlanesDeEstudio"
UNION ALL
SELECT 'Materias', COUNT(*), COUNT(DISTINCT nombre || anio) FROM "Materias"
UNION ALL
SELECT 'PlanMaterias', COUNT(*), COUNT(DISTINCT "planId" || "materiaId") FROM "PlanMaterias"
UNION ALL
SELECT 'Correlatividades', COUNT(*), COUNT(DISTINCT "materiaId" || "prerrequisitoId") FROM "Correlatividades"
UNION ALL
SELECT 'EstudianteCarreras', COUNT(*), COUNT(DISTINCT "estudianteId" || "carreraId") FROM "EstudianteCarreras";
