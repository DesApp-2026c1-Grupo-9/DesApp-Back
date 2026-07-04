import { Op, fn, col, literal } from 'sequelize';
import db from '../models/index.js';

const {
  Usuario,
  EstudianteMateria,
  EstudianteCarrera,
  Materia,
  Carrera,
  Material,
  Sesion,
  SesionParticipante,
  Conexion,
} = db;

const requireAdmin = (req, res) => {
  if (!req.user || req.user.rol !== 'administrador') {
    res
      .status(403)
      .json({
        message: 'Solo los administradores pueden realizar esta operación',
      });
    return false;
  }
  if (!req.user.activo) {
    res
      .status(403)
      .json({
        message: 'Cuenta desactivada. No puede realizar esta operación.',
      });
    return false;
  }
  return true;
};

export const obtenerReportes = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { periodoDesde, periodoHasta, carreraId } = req.query;

    const dateFilter = {};
    if (periodoDesde) dateFilter[Op.gte] = new Date(periodoDesde);
    if (periodoHasta) dateFilter[Op.lte] = new Date(periodoHasta);

    const materiaFilter = {};
    if (carreraId) {
      const materiaIds = await db.CarreraMateria.findAll({
        where: { carreraId: parseInt(carreraId) },
        attributes: ['materiaId'],
      });
      materiaFilter.id = { [Op.in]: materiaIds.map((m) => m.materiaId) };
    }

    const safe = (fn) =>
      fn().catch((err) => {
        console.error(`Error en reporte query: ${err.message}`, err.stack);
        return null;
      });

    const [
      usuariosActivos,
      materiasCursadasPorAlumno,
      materiasAprobadasPorAlumno,
      materiasCursadasPorCarrera,
      materiasAprobadasPorCarrera,
      materiasConMasMateriales,
      sesionesPorPeriodo,
      materialesMejorValorados,
      estadisticasDenuncias,
      conexionesPorEstudiante,
      utilizacionSesiones,
      carrerasMasActivas,
    ] = await Promise.all([
      safe(obtenerUsuariosActivos),
      safe(() => obtenerDistribucionMaterias('cursando')),
      safe(() => obtenerDistribucionMaterias('aprobada')),
      safe(() => obtenerMateriasPorCarrera('cursando')),
      safe(() => obtenerMateriasPorCarrera('aprobada')),
      safe(() => obtenerTopMateriasMateriales(materiaFilter)),
      safe(() => obtenerSesionesPorPeriodo(dateFilter, materiaFilter)),
      safe(() => obtenerMaterialesMejorValorados(materiaFilter)),
      safe(obtenerEstadisticasDenuncias),
      safe(obtenerConexionesPorEstudiante),
      safe(obtenerUtilizacionSesiones),
      safe(obtenerCarrerasMasActivas),
    ]);

    res.json({
      data: {
        usuariosActivos,
        materiasCursadasPorAlumno,
        materiasAprobadasPorAlumno,
        materiasCursadasPorCarrera,
        materiasAprobadasPorCarrera,
        materiasConMasMateriales,
        sesionesPorPeriodo,
        materialesMejorValorados,
        estadisticasDenuncias,
        conexionesPorEstudiante,
        utilizacionSesiones,
        carrerasMasActivas,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al obtener reportes',
        error: error.message,
        stack: error.stack,
      });
  }
};

async function obtenerUsuariosActivos() {
  const total = await Usuario.count();
  const activos = await Usuario.count({ where: { activo: true } });
  const estudiantes = await Usuario.count({ where: { rol: 'estudiante' } });
  const administradores = await Usuario.count({
    where: { rol: 'administrador' },
  });
  return { total, activos, estudiantes, administradores };
}

async function obtenerDistribucionMaterias(estado) {
  const rows = await EstudianteMateria.findAll({
    attributes: ['estudianteId', [fn('COUNT', col('materiaId')), 'cantidad']],
    where: { estado },
    group: ['estudianteId'],
    raw: true,
  });
  const distribucion = {};
  rows.forEach((r) => {
    const cant = parseInt(r.cantidad);
    distribucion[cant] = (distribucion[cant] || 0) + 1;
  });
  return Object.entries(distribucion)
    .map(([materias, alumnos]) => ({ materias: parseInt(materias), alumnos }))
    .sort((a, b) => a.materias - b.materias);
}

async function obtenerMateriasPorCarrera(estado) {
  const sequelize = db.sequelize;
  const rows = await sequelize.query(
    `
    SELECT c.id AS "carreraId", c.nombre AS "carrera", COUNT(em.id) AS "cantidad"
    FROM "EstudianteMaterias" em
    JOIN "Estudiantes" e ON e.id = em."estudianteId"
    JOIN "EstudianteCarreras" ec ON ec."estudianteId" = e.id
    JOIN "Carreras" c ON c.id = ec."carreraId"
    WHERE em.estado = :estado
    GROUP BY c.id, c.nombre
    ORDER BY cantidad DESC
  `,
    {
      replacements: { estado },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return rows.map((r) => ({
    carrera: r.carrera,
    cantidad: parseInt(r.cantidad),
  }));
}

async function obtenerTopMateriasMateriales(materiaFilter) {
  const where = {};
  if (Object.keys(materiaFilter).length > 0) where.materiaId = materiaFilter.id;
  const rows = await Material.findAll({
    attributes: ['materiaId', [fn('COUNT', col('id')), 'cantidad']],
    where: { ...where, suspendido: false },
    group: ['materiaId'],
    order: [[literal('cantidad'), 'DESC']],
    limit: 20,
    raw: true,
  });

  const materiaIds = rows.map((r) => r.materiaId).filter(Boolean);
  const materias = await Materia.findAll({
    where: { id: { [Op.in]: materiaIds } },
    attributes: ['id', 'nombre', 'codigo'],
    raw: true,
  });
  const materiaMap = {};
  materias.forEach((m) => {
    materiaMap[m.id] = m;
  });

  return rows
    .filter((r) => r.materiaId)
    .map((r) => ({
      materia: materiaMap[r.materiaId]?.nombre || `ID ${r.materiaId}`,
      codigo: materiaMap[r.materiaId]?.codigo || '',
      cantidad: parseInt(r.cantidad),
    }));
}

async function obtenerSesionesPorPeriodo(dateFilter, materiaFilter) {
  const where = {};
  if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
  if (Object.keys(materiaFilter).length > 0) where.materiaId = materiaFilter.id;

  const rows = await Sesion.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('createdAt')), 'periodo'],
      [fn('COUNT', col('id')), 'cantidad'],
    ],
    where,
    group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
    order: [[literal('periodo'), 'ASC']],
    raw: true,
  });

  return rows.map((r) => ({
    periodo: r.periodo,
    cantidad: parseInt(r.cantidad),
  }));
}

async function obtenerMaterialesMejorValorados(materiaFilter) {
  const sequelize = db.sequelize;
  const materiaJoin =
    Object.keys(materiaFilter).length > 0
      ? `AND m."materiaId" IN (${materiaFilter.id[Op.in].join(',')})`
      : '';
  const rows = await sequelize.query(
    `
    SELECT
      mr."materialId",
      m.titulo,
      m."materiaId",
      mat.nombre AS materia,
      SUM(CASE WHEN mr.valor = 1 THEN 1 ELSE 0 END) AS likes,
      SUM(CASE WHEN mr.valor = -1 THEN 1 ELSE 0 END) AS dislikes,
      COUNT(mr.id) AS total
    FROM "MaterialRatings" mr
    JOIN "Materiales" m ON m.id = mr."materialId"
    LEFT JOIN "Materias" mat ON mat.id = m."materiaId"
    WHERE m.suspendido = false ${materiaJoin}
    GROUP BY mr."materialId", m.titulo, m."materiaId", mat.nombre
    ORDER BY likes DESC
    LIMIT 20
  `,
    { type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => ({
    materialId: r.materialId,
    titulo: r.titulo,
    materia: r.materia || '',
    likes: parseInt(r.likes),
    dislikes: parseInt(r.dislikes),
    total: parseInt(r.total),
    ratio:
      parseInt(r.total) > 0 ? (parseInt(r.likes) / parseInt(r.total)) * 100 : 0,
  }));
}

async function obtenerEstadisticasDenuncias() {
  const sequelize = db.sequelize;

  const porEstado = await sequelize.query(
    `
    SELECT d.estado, COUNT(d.id) AS cantidad
    FROM "Denuncias" d
    GROUP BY d.estado
  `,
    { type: sequelize.QueryTypes.SELECT }
  );

  const porMotivo = await sequelize.query(
    `
    SELECT d."motivoId", md.nombre AS motivo, COUNT(d.id) AS cantidad
    FROM "Denuncias" d
    LEFT JOIN "MotivosDenuncia" md ON md.id = d."motivoId"
    GROUP BY d."motivoId", md.nombre
    ORDER BY cantidad DESC
  `,
    { type: sequelize.QueryTypes.SELECT }
  );

  return {
    porEstado: porEstado.map((r) => ({
      estado: r.estado,
      cantidad: parseInt(r.cantidad),
    })),
    porMotivo: porMotivo
      .filter((r) => r.motivoId)
      .map((r) => ({
        motivo: r.motivo || `ID ${r.motivoId}`,
        cantidad: parseInt(r.cantidad),
      })),
  };
}

async function obtenerConexionesPorEstudiante() {
  const rows = await Conexion.findAll({
    attributes: ['usuarioId', [fn('COUNT', col('id')), 'cantidad']],
    where: { estado: 'aceptada' },
    group: ['usuarioId'],
    raw: true,
  });

  const distribucion = {};
  rows.forEach((r) => {
    const cant = parseInt(r.cantidad);
    distribucion[cant] = (distribucion[cant] || 0) + 1;
  });

  return Object.entries(distribucion)
    .map(([conexiones, estudiantes]) => ({
      conexiones: parseInt(conexiones),
      estudiantes,
    }))
    .sort((a, b) => a.conexiones - b.conexiones);
}

async function obtenerUtilizacionSesiones() {
  const totalSesiones = await Sesion.count();
  const sesionesConParticipantes = await SesionParticipante.findAll({
    attributes: ['sesionId', [fn('COUNT', col('id')), 'cantidad']],
    where: { estado: 'aprobado' },
    group: ['sesionId'],
    raw: true,
  });

  const distribucion = {};
  sesionesConParticipantes.forEach((r) => {
    const cant = parseInt(r.cantidad);
    distribucion[cant] = (distribucion[cant] || 0) + 1;
  });

  const totalParticipantes = sesionesConParticipantes.reduce(
    (sum, r) => sum + parseInt(r.cantidad),
    0
  );
  const promedioParticipantes =
    totalSesiones > 0 ? (totalParticipantes / totalSesiones).toFixed(1) : 0;

  return {
    totalSesiones,
    sesionesConParticipantes: sesionesConParticipantes.length,
    totalParticipaciones: totalParticipantes,
    promedioParticipantes: parseFloat(promedioParticipantes),
    distribucion: Object.entries(distribucion)
      .map(([participantes, sesiones]) => ({
        participantes: parseInt(participantes),
        sesiones,
      }))
      .sort((a, b) => a.participantes - b.participantes),
  };
}

async function obtenerCarrerasMasActivas() {
  const carreras = await Carrera.findAll({
    attributes: ['id', 'nombre'],
    raw: true,
  });

  const resultados = await Promise.all(
    carreras.map(async (carrera) => {
      const materiaIds = await db.CarreraMateria.findAll({
        where: { carreraId: carrera.id },
        attributes: ['materiaId'],
        raw: true,
      });
      const ids = materiaIds.map((m) => m.materiaId);

      if (ids.length === 0)
        return {
          ...carrera,
          estudiantes: 0,
          materiales: 0,
          sesiones: 0,
          puntaje: 0,
        };

      const [estudiantes, materiales, sesiones] = await Promise.all([
        EstudianteCarrera.count({ where: { carreraId: carrera.id } }),
        Material.count({
          where: { materiaId: { [Op.in]: ids }, suspendido: false },
        }),
        Sesion.count({ where: { materiaId: { [Op.in]: ids } } }),
      ]);

      return {
        ...carrera,
        estudiantes,
        materiales,
        sesiones,
        puntaje: estudiantes + materiales + sesiones,
      };
    })
  );

  return resultados.sort((a, b) => b.puntaje - a.puntaje);
}
