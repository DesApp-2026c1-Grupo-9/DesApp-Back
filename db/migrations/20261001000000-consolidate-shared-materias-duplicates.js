'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `
        CREATE TEMP TABLE tmp_materia_merge_map AS
        WITH materias_norm AS (
          SELECT
            id,
            codigo,
            lower(
              regexp_replace(
                translate(
                  nombre,
                  'ÁÀÄÂáàäâÉÈËÊéèëêÍÌÏÎíìïîÓÒÖÔóòöôÚÙÜÛúùüûÑñ',
                  'AAAAaaaaEEEEeeeeIIIIiiiiOOOOooooUUUUuuuuNn'
                ),
                '\\s+',
                ' ',
                'g'
              )
            ) AS nombre_normalizado
          FROM "Materias"
        ),
        grupos AS (
          SELECT
            COALESCE(NULLIF(codigo, ''), nombre_normalizado) AS clave_equivalencia,
            array_agg(id ORDER BY id) AS ids,
            MIN(id) AS canonical_id
          FROM materias_norm
          GROUP BY 1
          HAVING COUNT(*) > 1
        )
        SELECT
          g.clave_equivalencia,
          old_id,
          g.canonical_id
        FROM grupos g,
        LATERAL unnest(g.ids) AS old_id
        WHERE old_id <> g.canonical_id;

        CREATE INDEX tmp_materia_merge_map_old_idx
          ON tmp_materia_merge_map (old_id);
        CREATE INDEX tmp_materia_merge_map_canonical_idx
          ON tmp_materia_merge_map (canonical_id);
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        -- Evita conflictos de unicidad antes del update de PlanMaterias.
        DELETE FROM "PlanMaterias" p_old
        USING "PlanMaterias" p_can, tmp_materia_merge_map m
        WHERE p_old."materiaId" = m.old_id
          AND p_can."materiaId" = m.canonical_id
          AND p_old."planId" = p_can."planId";

        UPDATE "PlanMaterias" p
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE p."materiaId" = m.old_id;

        DELETE FROM "PlanMaterias" p
        WHERE p.id IN (
          SELECT id
          FROM (
            SELECT id,
                   row_number() OVER (
                     PARTITION BY "planId", "materiaId"
                     ORDER BY id
                   ) AS rn
            FROM "PlanMaterias"
          ) d
          WHERE d.rn > 1
        );
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        -- Evita conflictos de unicidad antes del update de CarreraMaterias.
        DELETE FROM "CarreraMaterias" c_old
        USING "CarreraMaterias" c_can, tmp_materia_merge_map m
        WHERE c_old."materiaId" = m.old_id
          AND c_can."materiaId" = m.canonical_id
          AND c_old."carreraId" = c_can."carreraId";

        UPDATE "CarreraMaterias" c
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE c."materiaId" = m.old_id;

        DELETE FROM "CarreraMaterias" c
        WHERE c.id IN (
          SELECT id
          FROM (
            SELECT id,
                   row_number() OVER (
                     PARTITION BY "carreraId", "materiaId"
                     ORDER BY id
                   ) AS rn
            FROM "CarreraMaterias"
          ) d
          WHERE d.rn > 1
        );
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE "Correlatividades" c
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE c."materiaId" = m.old_id;

        UPDATE "Correlatividades" c
        SET "prerrequisitoId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE c."prerrequisitoId" = m.old_id;

        -- Eliminar autoreferencias creadas por consolidacion.
        DELETE FROM "Correlatividades"
        WHERE "materiaId" = "prerrequisitoId";

        -- Eliminar duplicados exactos de correlatividades.
        DELETE FROM "Correlatividades" c
        WHERE c.id IN (
          SELECT id
          FROM (
            SELECT id,
                   row_number() OVER (
                     PARTITION BY "materiaId", "prerrequisitoId"
                     ORDER BY id
                   ) AS rn
            FROM "Correlatividades"
          ) d
          WHERE d.rn > 1
        );
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE "Sesiones" s
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE s."materiaId" = m.old_id;

        UPDATE "Materiales" mat
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE mat."materiaId" = m.old_id;

        UPDATE "Novedades" n
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE n."materiaId" = m.old_id;

        UPDATE "Notificaciones" n
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE n."materiaId" = m.old_id;
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        -- Consolidar estados de EstudianteMaterias preservando el estado mas avanzado.
        UPDATE "EstudianteMaterias" em
        SET "materiaId" = m.canonical_id,
            "updatedAt" = NOW()
        FROM tmp_materia_merge_map m
        WHERE em."materiaId" = m.old_id;

        DELETE FROM "EstudianteMaterias" em
        WHERE em.id IN (
          SELECT id
          FROM (
            SELECT
              id,
              row_number() OVER (
                PARTITION BY "estudianteId", "materiaId"
                ORDER BY
                  CASE estado
                    WHEN 'aprobada' THEN 4
                    WHEN 'regularizada' THEN 3
                    WHEN 'cursando' THEN 2
                    ELSE 1
                  END DESC,
                  "updatedAt" DESC,
                  id DESC
              ) AS rn
            FROM "EstudianteMaterias"
          ) d
          WHERE d.rn > 1
        );
      `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        DELETE FROM "Materias" m
        USING tmp_materia_merge_map map
        WHERE m.id = map.old_id;
      `,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async () => {
    // Migracion irreversible: una vez consolidadas referencias y eliminados IDs,
    // no es posible reconstruir el estado anterior sin un backup.
  },
};
