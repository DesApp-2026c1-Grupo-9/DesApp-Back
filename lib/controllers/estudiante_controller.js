import db from '../models/index.js';
const {
  Estudiante,
  Usuario,
  Carrera,
  PlanDeEstudio,
  PlanMateria,
  Materia,
  Correlatividades,
  PreferenciasEstudiante,
  EstudianteCarrera,
  EstudianteMateria,
  Conexion,
  Novedad,
} = db;
import { Op } from 'sequelize';
import crearNotificacion from '../utils/crearNotificacion';

// --- Helpers de estado usando base de datos ---

const guardarEstadoMateria = async (estudianteId, materiaId, estado) => {
  const materia = await Materia.findByPk(materiaId, {
    attributes: ['id', 'codigo', 'nombre'],
  });

  console.log(
    `📝 Guardando estado para materia ${materiaId} (${materia?.nombre}): ${estado}`
  );
  if (!materia?.codigo) {
    console.log(`   ⚠️  Sin código, guardando solo para ID ${materiaId}`);
    await EstudianteMateria.upsert(
      {
        estudianteId: parseInt(estudianteId),
        materiaId: parseInt(materiaId),
        estado,
      },
      { conflictFields: ['estudianteId', 'materiaId'] }
    );
    return;
  }

  const materiasEquivalentes = await Materia.findAll({
    where: { codigo: materia.codigo },
    attributes: ['id', 'nombre'],
  });

  console.log(
    `   🔗 Materias equivalentes con código "${materia.codigo}": ${materiasEquivalentes.length}`
  );
  materiasEquivalentes.forEach((m) => {
    console.log(`      - ID ${m.id}: ${m.nombre}`);
  });

  await Promise.all(
    materiasEquivalentes.map((materiaEquivalente) =>
      EstudianteMateria.upsert(
        {
          estudianteId: parseInt(estudianteId),
          materiaId: materiaEquivalente.id,
          estado,
        },
        { conflictFields: ['estudianteId', 'materiaId'] }
      )
    )
  );

  console.log(`   ✅ Estado sincronizado para todas las materias equivalentes`);
};

const obtenerRegistrosEstados = async (estudianteId) => {
  return EstudianteMateria.findAll({
    where: { estudianteId: parseInt(estudianteId) },
    attributes: ['materiaId', 'estado', 'createdAt', 'updatedAt'],
    include: [{ model: Materia, attributes: ['codigo'] }],
    order: [['updatedAt', 'DESC']],
  });
};

const obtenerTodosLosEstados = async (estudianteId) => {
  const registros = await obtenerRegistrosEstados(estudianteId);
  const map = new Map();
  const estadosPorCodigo = new Map();

  registros.forEach((r) => {
    map.set(r.materiaId, r.estado);
    const codigo = normalizarTexto(r.Materia?.codigo);
    if (codigo) {
      estadosPorCodigo.set(codigo, r.estado);
    }
  });

  map.porCodigo = estadosPorCodigo;
  return map;
};

const obtenerEstadoMateria = (estadosMap, materia) => {
  const estadoDirecto = estadosMap.get(materia.id);
  if (estadoDirecto) {
    return estadoDirecto;
  }

  const codigo = normalizarTexto(materia.codigo);
  if (!codigo || !estadosMap.porCodigo) {
    return null;
  }

  return estadosMap.porCodigo.get(codigo) || null;
};

const sumarAnios = (fecha, anios) => {
  if (!fecha) return null;

  const base = new Date(fecha);
  if (Number.isNaN(base.getTime())) return null;

  base.setFullYear(base.getFullYear() + anios);
  return base.toISOString();
};

const normalizarTexto = (valor) =>
  String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const PRIORIDAD_ESTADO = {
  no_cursada: 0,
  cursando: 1,
  regularizada: 2,
  aprobada: 3,
};

const estadoMasFavorable = (estadoA, estadoB) => {
  const a = PRIORIDAD_ESTADO[estadoA] ?? -1;
  const b = PRIORIDAD_ESTADO[estadoB] ?? -1;
  return a >= b ? estadoA : estadoB;
};

const obtenerEstadoConEquivalencias = (estadosMap, materiaRef) => {
  const estadoPorId = materiaRef?.id ? estadosMap.get(materiaRef.id) : null;
  const estadoPorCodigo = materiaRef?.codigo
    ? estadosMap.porCodigo?.get(normalizarTexto(materiaRef.codigo))
    : null;

  if (estadoPorId && estadoPorCodigo) {
    return estadoMasFavorable(estadoPorId, estadoPorCodigo);
  }

  return estadoPorId || estadoPorCodigo || null;
};

const mapearEstadoExcel = (estado) => {
  const estadoNormalizado = normalizarTexto(estado).replace(/\s+/g, '_');

  const alias = {
    aprobada: 'aprobada',
    aprobado: 'aprobada',
    regularizada: 'regularizada',
    regularizado: 'regularizada',
    cursando: 'cursando',
    cursada: 'cursando',
    cursado: 'cursando',
    no_cursada: 'no_cursada',
    no_cursado: 'no_cursada',
    no_cursada_: 'no_cursada',
    pendiente: 'no_cursada',
    libre: 'no_cursada',
  };

  return alias[estadoNormalizado] || estadoNormalizado;
};

const calcularAvanceCarrera = async (estudianteId, carreraId) => {
  const planVigente = await PlanDeEstudio.findOne({
    where: { carreraId: Number(carreraId), estado: 'vigente' },
    attributes: ['id'],
  });

  if (!planVigente) {
    return {
      porcentaje: 0,
      aprobadas: 0,
      total: 0,
      valido: false,
      motivo:
        'No se pudo validar el avance académico porque la carrera no tiene plan vigente.',
    };
  }

  const materiasPlan = await PlanMateria.findAll({
    where: { planId: planVigente.id },
    attributes: ['materiaId'],
  });

  const totalMaterias = materiasPlan.length;
  if (totalMaterias === 0) {
    return {
      porcentaje: 0,
      aprobadas: 0,
      total: 0,
      valido: false,
      motivo:
        'No se pudo validar el avance académico porque el plan vigente no tiene materias configuradas.',
    };
  }

  const materiasIds = materiasPlan.map((m) => m.materiaId);
  const aprobadas = await EstudianteMateria.count({
    where: {
      estudianteId: Number(estudianteId),
      materiaId: { [Op.in]: materiasIds },
      estado: 'aprobada',
    },
  });

  return {
    porcentaje: (aprobadas / totalMaterias) * 100,
    aprobadas,
    total: totalMaterias,
    valido: true,
    motivo: null,
  };
};

const esTecnicatura = (carrera) =>
  /tecnicatura/i.test(`${carrera?.nombre || ''} ${carrera?.titulo || ''}`);

const obtenerElegibilidadInscripcion = async (
  estudianteId,
  carreraDestinoId = null
) => {
  const inscripciones = await EstudianteCarrera.findAll({
    where: { estudianteId: Number(estudianteId) },
    attributes: ['carreraId'],
    include: [
      {
        model: Carrera,
        attributes: ['id', 'nombre', 'titulo'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  const cantidadCarreras = inscripciones.length;
  const base = {
    maximoCarreras: 2,
    cantidadCarreras,
    puedeInscribirse: false,
    porcentajeCarreraActual: null,
    message: '',
  };

  if (cantidadCarreras >= 2) {
    return {
      ...base,
      puedeInscribirse: false,
      message:
        'Un estudiante puede estar inscripto en un máximo de 2 carreras.',
    };
  }

  if (cantidadCarreras === 0) {
    return {
      ...base,
      puedeInscribirse: true,
      message: 'Puede inscribirse en su primera carrera.',
    };
  }

  const carreraDestino = carreraDestinoId
    ? await Carrera.findByPk(carreraDestinoId, {
        attributes: ['id', 'nombre', 'titulo'],
      })
    : null;
  const carreraBase = inscripciones[0].Carrera;
  const baseEsTecnicatura = esTecnicatura(carreraBase);
  const destinoEsTecnicatura = esTecnicatura(carreraDestino);

  if (carreraDestino && !destinoEsTecnicatura && baseEsTecnicatura) {
    const avance = await calcularAvanceCarrera(
      estudianteId,
      carreraBase.carreraId || carreraBase.id
    );
    if (!avance.valido) {
      return {
        ...base,
        puedeInscribirse: false,
        message: avance.motivo,
        porcentajeCarreraActual: 0,
      };
    }

    const puede = avance.porcentaje > 60;
    return {
      ...base,
      puedeInscribirse: puede,
      porcentajeCarreraActual: Math.round(avance.porcentaje),
      message: puede
        ? 'Puede inscribirse en una segunda carrera.'
        : `Para anotarse en una segunda carrera necesita más del 60% de avance. Avance actual: ${Math.round(
            avance.porcentaje
          )}%.`,
    };
  }

  if (carreraDestino && destinoEsTecnicatura && !baseEsTecnicatura) {
    return {
      ...base,
      puedeInscribirse: true,
      porcentajeCarreraActual: null,
      message: 'Puede inscribirse en una tecnicatura en cualquier momento.',
    };
  }

  if (carreraDestino && destinoEsTecnicatura && baseEsTecnicatura) {
    const avance = await calcularAvanceCarrera(
      estudianteId,
      carreraBase.carreraId || carreraBase.id
    );
    if (!avance.valido) {
      return {
        ...base,
        puedeInscribirse: false,
        message: avance.motivo,
        porcentajeCarreraActual: 0,
      };
    }

    const puede = avance.porcentaje > 50;
    return {
      ...base,
      puedeInscribirse: puede,
      porcentajeCarreraActual: Math.round(avance.porcentaje),
      message: puede
        ? 'Puede inscribirse en una segunda tecnicatura.'
        : `Para anotarse en una segunda tecnicatura necesita más del 50% de avance. Avance actual: ${Math.round(
            avance.porcentaje
          )}%.`,
    };
  }

  const carreraBaseId = carreraBase.carreraId || carreraBase.id;
  const avance = await calcularAvanceCarrera(estudianteId, carreraBaseId);

  if (!avance.valido) {
    return {
      ...base,
      puedeInscribirse: false,
      message: avance.motivo,
      porcentajeCarreraActual: 0,
    };
  }

  const puede = avance.porcentaje > 60;
  return {
    ...base,
    puedeInscribirse: puede,
    porcentajeCarreraActual: Math.round(avance.porcentaje),
    message: puede
      ? 'Puede inscribirse en una segunda carrera.'
      : `Para anotarse en una segunda carrera necesita más del 60% de avance. Avance actual: ${Math.round(
          avance.porcentaje
        )}%.`,
  };
};

export const index = async (req, res) => {
  try {
    const estudiantes = await Estudiante.findAll({
      include: [
        {
          model: Usuario,
          attributes: [
            'id',
            'nombre',
            'apellido',
            'email',
            'avatarUrl',
            'fechaNacimiento',
            'activo',
          ],
        },
        {
          model: Carrera,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'titulo'],
        },
        {
          model: PreferenciasEstudiante,
          as: 'preferencias',
          attributes: [
            'perfilPublico',
            'mostrarEmail',
            'mostrarSituacionAcademica',
          ],
          required: false,
        },
      ],
      order: [
        [Usuario, 'apellido', 'ASC'],
        [Usuario, 'nombre', 'ASC'],
      ],
    });

    res.json({
      data: estudiantes.map((estudiante) => ({
        id: estudiante.id,
        usuario: estudiante.Usuario,
        carreras: estudiante.Carreras,
        perfilPublico: estudiante.preferencias?.perfilPublico ?? true,
        mostrarEmail: estudiante.preferencias?.mostrarEmail ?? false,
        mostrarSituacionAcademica:
          estudiante.preferencias?.mostrarSituacionAcademica ?? false,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los estudiantes',
      error: error.message,
    });
  }
};

export const show = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByPk(req.params.id, {
      include: [
        {
          model: Usuario,
          attributes: [
            'id',
            'nombre',
            'apellido',
            'email',
            'avatarUrl',
            'fechaNacimiento',
            'activo',
          ],
        },
        {
          model: Carrera,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'titulo', 'duracion'],
        },
        {
          model: PreferenciasEstudiante,
          as: 'preferencias',
          attributes: [
            'perfilPublico',
            'mostrarEmail',
            'mostrarSituacionAcademica',
          ],
          required: false,
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${req.params.id}`,
      });
    }

    res.json({
      data: {
        id: estudiante.id,
        usuario: estudiante.Usuario,
        carreras: estudiante.Carreras,
        perfilPublico: estudiante.preferencias?.perfilPublico ?? true,
        mostrarEmail: estudiante.preferencias?.mostrarEmail ?? false,
        mostrarSituacionAcademica:
          estudiante.preferencias?.mostrarSituacionAcademica ?? false,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el estudiante',
      error: error.message,
    });
  }
};

export const inscribirCarrera = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { carreraId } = req.body;

    if (!carreraId) {
      return res.status(400).json({
        message: 'Debe indicar una carrera para completar la inscripción.',
      });
    }

    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    const carrera = await Carrera.findByPk(carreraId, {
      attributes: ['id', 'nombre', 'titulo', 'duracion'],
    });
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${carreraId}`,
      });
    }

    const yaInscripto = await EstudianteCarrera.findOne({
      where: {
        estudianteId: Number(estudianteId),
        carreraId: Number(carreraId),
      },
    });

    if (yaInscripto) {
      return res.status(409).json({
        message: 'El estudiante ya está inscripto en esta carrera.',
      });
    }

    const elegibilidad = await obtenerElegibilidadInscripcion(
      estudianteId,
      carreraId
    );
    if (!elegibilidad.puedeInscribirse) {
      return res.status(400).json({
        message: elegibilidad.message,
        data: elegibilidad,
      });
    }

    await EstudianteCarrera.create({
      estudianteId: Number(estudianteId),
      carreraId: Number(carreraId),
    });

    const estudianteActualizado = await Estudiante.findByPk(estudianteId, {
      include: [
        {
          model: Carrera,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'titulo', 'duracion'],
        },
      ],
    });

    res.status(201).json({
      message: `Inscripción realizada correctamente en ${carrera.nombre}.`,
      data: {
        estudianteId: Number(estudianteId),
        carreras: estudianteActualizado?.Carreras || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al inscribir al estudiante en la carrera',
      error: error.message,
    });
  }
};

export const darDeBajaCarrera = async (req, res) => {
  try {
    const { estudianteId, carreraId } = req.params;

    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    const carrera = await Carrera.findByPk(carreraId, {
      attributes: ['id', 'nombre', 'titulo', 'duracion'],
    });
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${carreraId}`,
      });
    }

    const relacion = await EstudianteCarrera.findOne({
      where: {
        estudianteId: Number(estudianteId),
        carreraId: Number(carreraId),
      },
    });

    if (!relacion) {
      return res.status(404).json({
        message: 'El estudiante no está inscripto en esa carrera.',
      });
    }

    const totalInscripciones = await EstudianteCarrera.count({
      where: { estudianteId: Number(estudianteId) },
    });

    if (totalInscripciones <= 1) {
      return res.status(400).json({
        message:
          'No se puede dar de baja la última carrera activa del estudiante.',
      });
    }

    await relacion.destroy();

    const estudianteActualizado = await Estudiante.findByPk(estudianteId, {
      include: [
        {
          model: Carrera,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'titulo', 'duracion'],
        },
      ],
    });

    return res.json({
      message: `Se dio de baja la carrera ${carrera.nombre} correctamente.`,
      data: {
        estudianteId: Number(estudianteId),
        carreras: estudianteActualizado?.Carreras || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al dar de baja la carrera',
      error: error.message,
    });
  }
};

const getUsuarioId = (req) => {
  return (
    parseInt(req.query.usuarioId) ||
    (req.user && req.user.id) ||
    parseInt(req.body.usuarioId)
  );
};

const puedeVerSituacionAcademica = async (estudianteId, currentUserId) => {
  if (!currentUserId) return false;

  const estudiante = await Estudiante.findByPk(estudianteId);
  if (!estudiante) return false;

  const usuarioIdDelPerfil = estudiante.usuarioId;
  const esPropioPerfil = Number(usuarioIdDelPerfil) === Number(currentUserId);
  if (esPropioPerfil) return true;

  const esContacto = await Conexion.findOne({
    where: {
      [Op.or]: [
        { usuarioId: currentUserId, contactoId: usuarioIdDelPerfil },
        { usuarioId: usuarioIdDelPerfil, contactoId: currentUserId },
      ],
      estado: 'aceptada',
    },
  });

  if (esContacto) return true;

  const preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId: usuarioIdDelPerfil },
  });

  const perfilPublico = preferencias?.perfilPublico ?? true;
  if (!perfilPublico) return false;

  return preferencias?.mostrarSituacionAcademica ?? false;
};

export const getPlanMaterias = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const currentUserId = getUsuarioId(req);
    const carreraIdParam = req.query?.carreraId
      ? Number(req.query.carreraId)
      : null;
    const planIdParam = req.query?.planId ? Number(req.query.planId) : null;

    console.log(`\n📚 getPlanMaterias - Parámetros recibidos:
      estudianteId: ${estudianteId}
      carreraIdParam: ${carreraIdParam} (typeof: ${typeof carreraIdParam})
      planIdParam: ${planIdParam}`);
    console.log(`Buscando plan de materias para estudiante ${estudianteId}`);

    // Verificar que el estudiante existe primero
    const estudianteBasico = await Estudiante.findByPk(estudianteId);

    if (!estudianteBasico) {
      console.log(`Estudiante ${estudianteId} no encontrado`);
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    const puedeVer = await puedeVerSituacionAcademica(
      estudianteId,
      currentUserId
    );
    if (!puedeVer) {
      return res.status(403).json({
        message:
          'No tenés permiso para ver la situación académica de este estudiante.',
      });
    }

    console.log(
      `Estudiante ${estudianteId} encontrado, buscando carrera y materias...`
    );

    // Verificar que el estudiante existe y obtener su carrera
    const estudiante = await Estudiante.findByPk(estudianteId, {
      include: [
        {
          model: Usuario,
          attributes: ['nombre', 'apellido'],
        },
        {
          model: Carrera,
          through: { attributes: [] },
          include: [
            {
              model: PlanDeEstudio,
              required: false,
              include: [
                {
                  model: Materia,
                  through: { attributes: ['anio'] },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    console.log(`Carreras del estudiante:`, estudiante.Carreras?.length || 0);

    if (!estudiante.Usuario) {
      console.log(`   ❌ ERROR: Estudiante sin datos de usuario`);
      return res.status(400).json({
        message:
          'El estudiante no tiene datos de usuario asociados. Verifique la integridad de los datos.',
      });
    }

    if (!estudiante.Carreras || estudiante.Carreras.length === 0) {
      console.log(`   ❌ ERROR: Estudiante sin carreras asignadas`);
      return res.status(400).json({
        message: 'El estudiante no tiene carreras asignadas',
      });
    }

    const carrera = carreraIdParam
      ? estudiante.Carreras.find((c) => Number(c.id) === carreraIdParam)
      : estudiante.Carreras[0];

    console.log(
      `   Carreras disponibles del estudiante: ${estudiante.Carreras.map(
        (c) => `${c.id} (${c.nombre})`
      ).join(', ')}`
    );
    if (carreraIdParam) {
      console.log(`   Buscando carrera con ID ${carreraIdParam}...`);
      console.log(
        `   Carrera encontrada: ${
          carrera ? `${carrera.id} - ${carrera.nombre}` : 'NO'
        }`
      );
    } else {
      console.log(
        `   Usando carrera por defecto: ${carrera.id} - ${carrera.nombre}`
      );
    }

    if (!carrera) {
      console.log(
        `   ❌ ERROR: Carrera solicitada (${carreraIdParam}) no encontrada`
      );
      return res.status(400).json({
        message:
          'La carrera solicitada no está asociada al estudiante o es inválida.',
      });
    }

    const planesCarrera = carrera.PlanDeEstudios || [];

    const planDeEstudio = planIdParam
      ? planesCarrera.find((p) => Number(p.id) === planIdParam)
      : planesCarrera.find((p) => p.estado === 'vigente') || planesCarrera[0];

    // Si se solicitó un planId específico pero no pertenece a esta carrera, lo ignoramos
    if (planIdParam && !planDeEstudio) {
      console.log(
        `   ⚠️  Plan ${planIdParam} no pertenece a carrera ${carrera.id}, usando plan vigente en su lugar`
      );
    }

    console.log(
      `   Plan de estudio encontrado:`,
      planDeEstudio?.id || 'ninguno',
      `- ${planDeEstudio?.nombre}`
    );

    if (!planDeEstudio) {
      console.log(
        `   ❌ ERROR: No se encontró plan de estudio vigente para carrera ${carrera.id}`
      );
      return res.status(400).json({
        message:
          'No se encontró un plan de estudio vigente para la carrera del estudiante',
      });
    }

    // Obtener todas las materias del plan directamente de la base de datos
    const materias = await Materia.findAll({
      include: [
        {
          model: PlanDeEstudio,
          through: { attributes: ['anio'] },
          where: { id: planDeEstudio.id },
        },
      ],
    });

    console.log(`Materias encontradas:`, materias.length);

    if (materias.length === 0) {
      console.log(
        `   ❌ ERROR: No se encontraron materias en el plan de estudio ${planDeEstudio.id}`
      );
      console.log(`      PlanDeEstudio.id: ${planDeEstudio.id}`);
      return res.status(400).json({
        message: 'No se encontraron materias en el plan de estudio',
      });
    }

    // Obtener todas las correlatividades
    const correlatividades = await Correlatividades.findAll({
      where: {
        materiaId: {
          [Op.in]: materias.map((m) => m.id),
        },
        prerrequisitoId: {
          [Op.in]: materias.map((m) => m.id),
        },
      },
      include: [
        {
          model: Materia,
          as: 'Materia',
          attributes: ['id', 'nombre', 'codigo'],
        },
        {
          model: Materia,
          as: 'Prerrequisito',
          attributes: ['id', 'nombre', 'codigo'],
        },
      ],
    });

    console.log(`Correlatividades encontradas:`, correlatividades.length);

    // Crear mapa de correlatividades
    const correlatividadesMap = {};
    correlatividades.forEach((corr) => {
      if (!corr.prerrequisitoId) {
        return;
      }

      if (!correlatividadesMap[corr.materiaId]) {
        correlatividadesMap[corr.materiaId] = [];
      }
      correlatividadesMap[corr.materiaId].push({
        id: corr.prerrequisitoId,
        codigo: corr.Prerrequisito?.codigo || null,
        nombre: corr.Prerrequisito?.nombre || 'Prerrequisito no disponible',
      });
    });

    // 🔍 LOG: Ver códigos de materias equivalentes
    const ingleses = materias.filter((m) =>
      m.nombre?.toLowerCase().includes('inglés')
    );
    if (ingleses.length > 0) {
      console.log(
        `\n🔍 MATERIAS EQUIVALENTES "INGLÉS" EN PLAN ${planDeEstudio.id}:`
      );
      ingleses.forEach((m) => {
        console.log(`   ID ${m.id}: ${m.nombre} - código: "${m.codigo}"`);
      });
    }

    const obtenerProfundidadMateria = (materiaId, visitados = new Set()) => {
      if (visitados.has(materiaId)) {
        return 0;
      }

      visitados.add(materiaId);
      const prerrequisitos = correlatividadesMap[materiaId] || [];

      if (prerrequisitos.length === 0) {
        return 0;
      }

      return (
        Math.max(
          ...prerrequisitos.map((pre) =>
            obtenerProfundidadMateria(pre.id, new Set(visitados))
          )
        ) + 1
      );
    };

    console.log(`Procesando estados de materias...`);

    // Cargar todos los estados del estudiante de la BD en una sola consulta
    const estadosBD = await obtenerTodosLosEstados(estudianteId);

    // estadosTemp combina lo que está en BD con lo que se va calculando en cascada
    const estadosTemp = new Map(estadosBD);

    // Función auxiliar para verificar si los prerrequisitos están cumplidos
    const prerequisitosCumplidos = (materiaId) => {
      const prerreqs = correlatividadesMap[materiaId] || [];
      return prerreqs.every((pre) => {
        const estadoPrereq =
          estadosTemp.get(pre.id) ||
          (pre.codigo
            ? estadosTemp.porCodigo?.get(normalizarTexto(pre.codigo))
            : null) ||
          'no_cursada';
        return estadoPrereq === 'aprobada' || estadoPrereq === 'regularizada';
      });
    };

    // Procesar materias por año para respetar la secuencia académica
    const materiasPorAnioTemp = {};
    materias.forEach((materia) => {
      const materiaAnio = materia.PlanDeEstudios?.[0]?.PlanMateria?.anio;
      if (!materiasPorAnioTemp[materiaAnio]) {
        materiasPorAnioTemp[materiaAnio] = [];
      }
      materiasPorAnioTemp[materiaAnio].push(materia);
    });

    // Procesar año por año, validando correlatividades contra estados de BD
    const aniosOrdenados = Object.keys(materiasPorAnioTemp).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    aniosOrdenados.forEach((anio) => {
      materiasPorAnioTemp[anio].forEach((materia) => {
        const estadoGuardado = obtenerEstadoMateria(estadosBD, materia);

        if (estadoGuardado) {
          if (
            (estadoGuardado === 'aprobada' ||
              estadoGuardado === 'regularizada' ||
              estadoGuardado === 'cursando') &&
            !prerequisitosCumplidos(materia.id)
          ) {
            console.log(
              `⚠️  ESTADO INVÁLIDO DETECTADO: ${materia.nombre} está ${estadoGuardado} pero no cumple prerrequisitos. Corrigiendo...`
            );
            estadosTemp.set(materia.id, 'no_cursada');
          } else {
            estadosTemp.set(materia.id, estadoGuardado);
          }
        } else {
          estadosTemp.set(materia.id, 'no_cursada');
        }
      });
    });

    // Ahora crear el array final con todos los estados calculados
    const materiasConEstado = materias.map((materia) => {
      let estado = estadosTemp.get(materia.id);
      const prerrequisitos = correlatividadesMap[materia.id] || [];

      // ✅ APLICAR LA MISMA LÓGICA DE PREREQS A TODOS LOS ESTADOS
      // Si está marcada como aprobada/regularizada, verificar que REALMENTE cumpla prerrequisitos
      if (
        (estado === 'aprobada' ||
          estado === 'regularizada' ||
          estado === 'cursando') &&
        !prerequisitosCumplidos(materia.id)
      ) {
        console.log(
          `⚠️  CORRIGIENDO: ${materia.nombre} estaba "${estado}" pero no cumple prerrequisitos actuales. Cambiando a "no_cursada"`
        );
        estado = 'no_cursada';
      }

      // Determinar disponibilidad usando la misma lógica
      const disponible = prerequisitosCumplidos(materia.id);

      return {
        id: materia.id,
        nombre: materia.nombre,
        codigo: materia.codigo,
        anio: materia.PlanDeEstudios?.[0]?.PlanMateria?.anio,
        cargaHoraria: materia.cargaHoraria || 0,
        tipo: materia.tipo,
        estado: estado,
        disponible: disponible,
        prerrequisitos: prerrequisitos,
        profundidad: obtenerProfundidadMateria(materia.id),
      };
    });

    console.log(`Estados de materias procesados:`, materiasConEstado.length);

    // Organizar por año
    const materiasPorAnio = {};
    materiasConEstado.forEach((materia) => {
      if (!materiasPorAnio[materia.anio]) {
        materiasPorAnio[materia.anio] = [];
      }
      materiasPorAnio[materia.anio].push(materia);
    });

    // Ordenar materias dentro de cada año
    Object.keys(materiasPorAnio).forEach((anio) => {
      materiasPorAnio[anio].sort((a, b) => {
        const profundidadA = obtenerProfundidadMateria(a.id);
        const profundidadB = obtenerProfundidadMateria(b.id);

        if (profundidadA !== profundidadB) {
          return profundidadA - profundidadB;
        }

        return a.nombre.localeCompare(b.nombre);
      });
    });

    const resumen = {
      aprobadas: materiasConEstado.filter((m) => m.estado === 'aprobada')
        .length,
      regularizadas: materiasConEstado.filter(
        (m) => m.estado === 'regularizada'
      ).length,
      cursando: materiasConEstado.filter((m) => m.estado === 'cursando').length,
      noCursadas: materiasConEstado.filter((m) => m.estado === 'no_cursada')
        .length,
      disponibles: materiasConEstado.filter(
        (m) => m.disponible && m.estado === 'no_cursada'
      ).length,
      total: materiasConEstado.length,
    };

    console.log(`Respuesta preparada exitosamente`);

    res.json({
      data: {
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.Usuario?.nombre || 'Sin nombre',
          apellido: estudiante.Usuario?.apellido || 'Sin apellido',
        },
        carrerasDisponibles: (estudiante.Carreras || []).map((c) => ({
          id: c.id,
          nombre: c.nombre,
          titulo: c.titulo,
          duracion: c.duracion,
        })),
        planesDisponibles: planesCarrera.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          estado: p.estado,
        })),
        carrera: {
          id: carrera.id,
          nombre: carrera.nombre,
          titulo: carrera.titulo,
        },
        planDeEstudio: {
          id: planDeEstudio.id,
          nombre: planDeEstudio.nombre,
        },
        materiasPorAnio,
        resumen,
      },
    });
  } catch (error) {
    console.error('Error detallado en getPlanMaterias:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: 'Error al obtener las materias del estudiante',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

export const getElegibilidadInscripcionCarrera = async (req, res) => {
  try {
    const { estudianteId } = req.params;

    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    const data = await obtenerElegibilidadInscripcion(estudianteId);
    return res.json({ data });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener elegibilidad de inscripción',
      error: error.message,
    });
  }
};

export const updateEstadoMateria = async (req, res) => {
  try {
    const { estudianteId, materiaId } = req.params;
    const { estado, confirmarCascada = false } = req.body;
    const planIdParam = req.body?.planId ? Number(req.body.planId) : null;

    let materiasIdsPlanActual = null;
    if (planIdParam) {
      const materiasPlanActual = await PlanMateria.findAll({
        where: { planId: planIdParam },
        attributes: ['materiaId'],
      });
      materiasIdsPlanActual = materiasPlanActual.map((pm) => pm.materiaId);
    }

    // Validar estado
    const estadosValidos = [
      'aprobada',
      'regularizada',
      'cursando',
      'no_cursada',
    ];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message:
          'Estado inválido. Debe ser: aprobada, regularizada, cursando o no_cursada',
      });
    }

    // Verificar que el estudiante existe
    const estudiante = await Estudiante.findByPk(estudianteId, {
      include: [{ model: Usuario }],
    });
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    // Verificar que la materia existe
    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({
        message: `No se encontró una materia con id ${materiaId}`,
      });
    }

    // Regla global: máximo 5 materias en estado "cursando"
    if (estado === 'cursando') {
      const estadoActualMateria = await EstudianteMateria.findOne({
        where: {
          estudianteId: Number(estudianteId),
          materiaId: Number(materiaId),
        },
        attributes: ['estado'],
      });

      const yaEstabaCursando = estadoActualMateria?.estado === 'cursando';

      if (!yaEstabaCursando) {
        const totalCursando = await EstudianteMateria.count({
          where: {
            estudianteId: Number(estudianteId),
            estado: 'cursando',
          },
        });

        if (totalCursando >= 5) {
          return res.status(400).json({
            tipo: 'LIMITE_CURSANDO_EXCEDIDO',
            message:
              'No podés cursar más de 5 materias en total entre todas tus carreras.',
            limite: 5,
          });
        }
      }
    }

    // Validar impacto en materias dependientes al degradar a "cursando"
    if (estado === 'cursando') {
      const materiasQueDependen = await Correlatividades.findAll({
        where: {
          prerrequisitoId: materiaId,
          ...(materiasIdsPlanActual
            ? { materiaId: { [Op.in]: materiasIdsPlanActual } }
            : {}),
        },
        include: [
          {
            model: Materia,
            as: 'Materia',
            attributes: ['id', 'nombre', 'codigo', 'tipo'],
          },
        ],
      });

      if (materiasQueDependen.length > 0) {
        const estadosDependientes = await obtenerTodosLosEstados(estudianteId);
        const materiasAfectadas = materiasQueDependen
          .map((rel) => {
            const estadoDependiente = obtenerEstadoConEquivalencias(
              estadosDependientes,
              {
                id: rel.Materia?.id || rel.materiaId,
                codigo: rel.Materia?.codigo || null,
              }
            );

            if (
              estadoDependiente === 'cursando' ||
              estadoDependiente === 'regularizada' ||
              estadoDependiente === 'aprobada'
            ) {
              return {
                id: rel.Materia?.id || rel.materiaId,
                nombre: rel.Materia?.nombre || `Materia ${rel.materiaId}`,
                tipo: rel.Materia?.tipo || null,
                estadoActual: estadoDependiente,
              };
            }

            return null;
          })
          .filter(Boolean);

        if (materiasAfectadas.length > 0) {
          return res.status(409).json({
            tipo: 'CONFLICTO_CORRELATIVIDADES',
            message:
              'No podés marcar esta materia como "cursando" porque hay materias dependientes activas que requieren que esté al menos regularizada.',
            materiasAfectadas,
            accionSugerida:
              'Si necesitás corregir el estado, usá "regularizada" para mantener consistencia con las materias dependientes actuales.',
          });
        }
      }
    }

    // NUEVA VALIDACIÓN: Verificar prerrequisitos antes de aprobar/regularizar
    if (
      estado === 'aprobada' ||
      estado === 'regularizada' ||
      estado === 'cursando'
    ) {
      console.log(
        `🔍 Validando prerrequisitos para materia ${materiaId} (${materia.nombre})`
      );

      // Obtener todas las correlatividades para esta materia
      const correlatividades = await Correlatividades.findAll({
        where: {
          materiaId,
          ...(materiasIdsPlanActual
            ? { prerrequisitoId: { [Op.in]: materiasIdsPlanActual } }
            : {}),
        },
        include: [
          {
            model: Materia,
            as: 'Prerrequisito',
            attributes: ['id', 'nombre', 'codigo'],
          },
        ],
      });

      console.log(
        `📋 Correlatividades encontradas: ${correlatividades.length}`
      );

      // Crear mapa de correlatividades (igual que en getPlanMaterias)
      const correlatividadesMap = {};
      correlatividades.forEach((corr) => {
        if (!correlatividadesMap[corr.materiaId]) {
          correlatividadesMap[corr.materiaId] = [];
        }
        correlatividadesMap[corr.materiaId].push({
          id: corr.prerrequisitoId,
          codigo: corr.Prerrequisito?.codigo || null,
          nombre: corr.Prerrequisito.nombre,
        });
      });

      // Cargar todos los estados del estudiante para validar prerrequisitos
      const estadosBDUpdate = await obtenerTodosLosEstados(estudianteId);

      const prerequisitosCumplidos = (materiaIdToCheck) => {
        const prerreqs = correlatividadesMap[materiaIdToCheck] || [];
        return prerreqs.every((pre) => {
          const estadoPrereq =
            obtenerEstadoConEquivalencias(estadosBDUpdate, pre) || 'no_cursada';
          console.log(`   ➤ Prerrequisito: ${pre.nombre} (ID: ${pre.id})`);
          console.log(`   ➤ Estado actual: "${estadoPrereq}"`);
          const cumplido =
            estadoPrereq === 'aprobada' || estadoPrereq === 'regularizada';
          console.log(`   ${cumplido ? '✅ CUMPLIDO' : '❌ INCUMPLIDO'}`);
          return cumplido;
        });
      };

      // Verificar si los prerrequisitos están cumplidos
      if (!prerequisitosCumplidos(materiaId)) {
        const prerequisitosIncumplidos = (correlatividadesMap[materiaId] || [])
          .filter((pre) => {
            const estadoPrereq =
              obtenerEstadoConEquivalencias(estadosBDUpdate, pre) ||
              'no_cursada';
            return (
              estadoPrereq !== 'aprobada' && estadoPrereq !== 'regularizada'
            );
          })
          .map((pre) => pre.nombre);

        return res.status(400).json({
          tipo: 'PRERREQUISITOS_INCUMPLIDOS',
          message: `No se puede ${
            estado === 'aprobada'
              ? 'aprobar'
              : estado === 'regularizada'
              ? 'regularizar'
              : 'cursar'
          } la materia "${
            materia.nombre
          }" porque no se han cursado los siguientes prerrequisitos:`,
          prerequisitosIncumplidos,
          detalles:
            'Las materias prerrequisito deben estar al menos en estado "regularizada" para poder avanzar.',
          solucion:
            'Curse primero las materias prerrequisito o verifique que estén correctamente marcadas como cursadas.',
        });
      }

      console.log(
        `✅ Prerrequisitos validados correctamente para ${materia.nombre}`
      );
    }

    // VALIDACIÓN DE CORRELATIVIDADES - continuación del resto de la lógica
    if (estado === 'no_cursada') {
      console.log(`Verificando dependencias para materia ${materiaId}...`);

      try {
        const materiasQueDependen = await Correlatividades.findAll({
          where: {
            prerrequisitoId: materiaId,
            ...(materiasIdsPlanActual
              ? { materiaId: { [Op.in]: materiasIdsPlanActual } }
              : {}),
          },
        });

        console.log(
          `Materias que dependen de ${materiaId}:`,
          materiasQueDependen.length
        );

        if (materiasQueDependen.length > 0 && !confirmarCascada) {
          const idsMateriasAfectadas = materiasQueDependen.map(
            (rel) => rel.materiaId
          );
          const materiasAfectadas = await Materia.findAll({
            where: { id: idsMateriasAfectadas },
            attributes: ['id', 'nombre', 'tipo'],
          });

          // ✅ FILTRAR SOLO MATERIAS QUE REALMENTE NECESITAN SER CAMBIADAS
          const estadosBDCascada = await obtenerTodosLosEstados(estudianteId);
          const materiasQueRealmenteSeAfectan = materiasAfectadas.filter(
            (mat) => {
              const estadoActual = estadosBDCascada.get(mat.id) || 'no_cursada';
              return (
                estadoActual === 'aprobada' ||
                estadoActual === 'regularizada' ||
                estadoActual === 'cursando'
              );
            }
          );

          // Solo mostrar diálogo si HAY materias que realmente se afectan
          if (materiasQueRealmenteSeAfectan.length > 0) {
            return res.status(409).json({
              tipo: 'CONFLICTO_CORRELATIVIDADES',
              message:
                'Esta materia es correlativa de otras materias que están cursando, aprobadas o regularizadas. Al marcarla como "no cursada", también deberían cambiarse sus dependientes.',
              materiasAfectadas: materiasQueRealmenteSeAfectan.map((mat) => ({
                id: mat.id,
                nombre: mat.nombre,
                tipo: mat.tipo,
                estadoActual: estadosBDCascada.get(mat.id),
              })),
              accionRequerida:
                'Confirme si desea aplicar el cambio en cascada a todas las materias dependientes.',
            });
          }

          console.log(
            `ℹ️ Materias dependientes encontradas pero todas ya están en 'no_cursada'. No se requiere cascada.`
          );
        }

        if (confirmarCascada && materiasQueDependen.length > 0) {
          // ✅ APLICAR CASCADA SOLO A MATERIAS QUE REALMENTE LA NECESITAN
          const materiasParaCambiar = [];
          const estadosBDCascadaFinal = await obtenerTodosLosEstados(
            estudianteId
          );

          for (const rel of materiasQueDependen) {
            const estadoActual =
              estadosBDCascadaFinal.get(rel.materiaId) || 'no_cursada';

            if (
              estadoActual === 'aprobada' ||
              estadoActual === 'regularizada' ||
              estadoActual === 'cursando'
            ) {
              await guardarEstadoMateria(
                estudianteId,
                rel.materiaId,
                'no_cursada'
              );
              materiasParaCambiar.push({
                id: rel.materiaId,
                estadoAnterior: estadoActual,
                estadoNuevo: 'no_cursada',
              });
            }
          }

          console.log(
            `Aplicando cascada a ${materiasParaCambiar.length} materias dependientes...`
          );

          if (materiasParaCambiar.length > 0) {
            materiasParaCambiar.forEach((cambio) => {
              console.log(
                `   • Materia ${cambio.id}: ${cambio.estadoAnterior} → ${cambio.estadoNuevo}`
              );
            });
          }
        }
      } catch (error) {
        console.error('Error al verificar dependencias:', error);
        return res.status(500).json({
          message: 'Error interno al verificar dependencias',
          error: error.message,
        });
      }
    }

    // GUARDAR REALMENTE EL ESTADO EN LA BD
    await guardarEstadoMateria(estudianteId, materiaId, estado);

    // Publicación automática en el feed
    if (['cursando', 'regularizada', 'aprobada'].includes(estado)) {
      const tipoMap = {
        cursando: 'inscripcion',
        regularizada: 'regularizacion',
        aprobada: 'aprobacion',
      };
      const prefKeyMap = {
        inscripcion: 'publicarInscripciones',
        regularizacion: 'publicarRegularizaciones',
        aprobacion: 'publicarAprobaciones',
      };
      const tipo = tipoMap[estado];

      try {
        const preferencias = await PreferenciasEstudiante.findOne({
          where: { estudianteId: estudiante.usuarioId },
        });
        const prefKey = prefKeyMap[tipo];
        if (!preferencias || preferencias[prefKey] !== false) {
          await Novedad.create({
            tipo,
            titulo: `${
              tipo === 'inscripcion'
                ? 'Se inscribió a'
                : tipo === 'regularizacion'
                ? 'Regularizó'
                : 'Aprobó'
            } ${materia.nombre}`,
            materiaId: parseInt(materiaId),
            visible: true,
            esAutomatica: true,
            likesCount: 0,
            autorId: estudiante.usuarioId,
          });
        }
      } catch (err) {
        console.error('Error al crear novedad automática de estado:', err);
      }

      if (estado === 'aprobada') {
        try {
          const conexionesEst = await Conexion.findAll({
            where: {
              [Op.or]: [
                { usuarioId: estudiante.usuarioId },
                { contactoId: estudiante.usuarioId },
              ],
              estado: 'aceptada',
            },
          });

          const idsContactos = conexionesEst
            .map((c) =>
              Number(c.usuarioId) === Number(estudiante.usuarioId)
                ? c.contactoId
                : c.usuarioId
            )
            .filter((id) => Number(id) !== Number(estudiante.usuarioId));

          for (const contactoId of idsContactos) {
            const nombreEst = estudiante.Usuario?.nombre || '';
            const apellidoEst = estudiante.Usuario?.apellido || '';
            await crearNotificacion({
              usuarioId: contactoId,
              tipo: 'conexion_aprobo_materia',
              titulo: `${nombreEst} ${apellidoEst} aprobó ${materia.nombre}`,
              actorId: estudiante.usuarioId,
              materiaId: parseInt(materiaId),
            });
          }
        } catch (err) {
          console.error('Error al crear notificaciones de aprobación:', err);
        }
      }
    }

    res.json({
      message: confirmarCascada
        ? 'Estado de materia actualizado exitosamente con cascada aplicada'
        : 'Estado de materia actualizado exitosamente',
      data: {
        estudianteId: parseInt(estudianteId),
        materiaId: parseInt(materiaId),
        estado: estado,
        materia: {
          id: materia.id,
          nombre: materia.nombre,
        },
      },
    });
  } catch (error) {
    console.error('Error detallado en updateEstadoMateria:', error);
    res.status(500).json({
      message: 'Error al actualizar el estado de la materia',
      error: error.message,
    });
  }
};

export const getMateriasIds = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const estudiante = await Estudiante.findOne({
      where: { usuarioId },
    });

    if (!estudiante) {
      return res.status(404).json({
        error: 'Estudiante no encontrado',
      });
    }

    const estudianteCarreras = await EstudianteCarrera.findAll({
      where: { estudianteId: estudiante.id },
    });

    if (estudianteCarreras.length === 0) {
      return res.json({ data: [] });
    }

    const carreraId = estudianteCarreras[0].carreraId;

    const planDeEstudio = await PlanDeEstudio.findOne({
      where: { carreraId, estado: 'vigente' },
    });

    if (!planDeEstudio) {
      return res.json({ data: [] });
    }

    const planMaterias = await PlanMateria.findAll({
      where: { planId: planDeEstudio.id },
    });

    const materiaIds = planMaterias.map((pm) => pm.materiaId);

    res.json({ data: materiaIds });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las materias del estudiante',
      error: error.message,
    });
  }
};

/**
 * POST /api/estudiantes/:estudianteId/importar-materias
 * Importa estados de materias desde un JSON parseado del Excel en el frontend.
 * Body: { materias: [{ nombre: string, estado: string }] }
 */
export const importarMateriasDesdeExcel = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const { materias, carreraId, planId } = req.body;

    if (!Array.isArray(materias) || materias.length === 0) {
      return res
        .status(400)
        .json({ message: 'El campo "materias" debe ser un array no vacío.' });
    }

    const estadosValidos = [
      'aprobada',
      'regularizada',
      'cursando',
      'no_cursada',
    ];

    const estudiante = await Estudiante.findByPk(estudianteId, {
      include: [
        { model: Usuario, attributes: ['nombre', 'apellido'] },
        {
          model: Carrera,
          through: { attributes: [] },
          include: [
            {
              model: PlanDeEstudio,
              where: { estado: 'vigente' },
              required: false,
            },
          ],
        },
      ],
    });
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró el estudiante con id ${estudianteId}`,
      });
    }

    // Resolver carrera y plan según carreraId/planId provistos
    let carrera = null;
    if (carreraId) {
      carrera = estudiante.Carreras.find(
        (c) => Number(c.id) === Number(carreraId)
      );
      if (!carrera) {
        return res.status(400).json({
          message: 'La carrera solicitada no está asociada al estudiante.',
        });
      }
    } else {
      carrera = estudiante.Carreras?.[0];
    }

    if (!carrera) {
      return res.status(400).json({
        message: 'El estudiante no tiene carreras asignadas.',
      });
    }

    const planesCarrera = carrera.PlanDeEstudios || [];
    const planDeEstudio = planId
      ? planesCarrera.find((p) => Number(p.id) === Number(planId))
      : planesCarrera.find((p) => p.estado === 'vigente') || planesCarrera[0];

    if (!planDeEstudio) {
      return res.status(400).json({
        message:
          'No se encontró un plan de estudio vigente para la carrera del estudiante.',
      });
    }

    const materiasPlan = await Materia.findAll({
      include: [
        {
          model: PlanDeEstudio,
          through: { attributes: ['anio'] },
          where: { id: planDeEstudio.id },
        },
      ],
    });

    const materiaPorNombre = new Map(
      materiasPlan.map((m) => [normalizarTexto(m.nombre), m])
    );

    const correlatividades = await Correlatividades.findAll({
      where: {
        materiaId: {
          [Op.in]: materiasPlan.map((m) => m.id),
        },
      },
      attributes: ['materiaId', 'prerrequisitoId'],
    });

    const correlatividadesMap = {};
    correlatividades.forEach((corr) => {
      if (!correlatividadesMap[corr.materiaId]) {
        correlatividadesMap[corr.materiaId] = [];
      }
      correlatividadesMap[corr.materiaId].push(corr.prerrequisitoId);
    });

    const profundidadCache = new Map();
    const obtenerProfundidadMateria = (materiaId, visitados = new Set()) => {
      if (profundidadCache.has(materiaId)) {
        return profundidadCache.get(materiaId);
      }

      if (visitados.has(materiaId)) {
        return 0;
      }

      visitados.add(materiaId);
      const prerequisitos = correlatividadesMap[materiaId] || [];

      if (prerequisitos.length === 0) {
        profundidadCache.set(materiaId, 0);
        return 0;
      }

      const profundidad =
        Math.max(
          ...prerequisitos.map((preId) =>
            obtenerProfundidadMateria(preId, new Set(visitados))
          )
        ) + 1;

      profundidadCache.set(materiaId, profundidad);
      return profundidad;
    };

    const materiaPorId = new Map(materiasPlan.map((m) => [m.id, m]));

    const resultados = { importadas: [], ignoradas: [], errores: [] };
    const estadosSimulados = await obtenerTodosLosEstados(estudianteId);
    const procesadosIds = new Set();
    const MAX_CURSANDO = 5;

    // Resolver materia por ID o por nombre, y ordenar
    const filasOrdenadas = materias
      .map((fila, indice) => {
        let materiaPlan = null;
        const id = parseInt(fila.id, 10);
        if (id && !Number.isNaN(id)) {
          materiaPlan = materiaPorId.get(id) || null;
        }
        if (!materiaPlan && fila.nombre) {
          materiaPlan =
            materiaPorNombre.get(normalizarTexto(fila.nombre)) || null;
        }

        return {
          ...fila,
          _indice: indice,
          _materiaPlan: materiaPlan,
          _anio:
            materiaPlan?.PlanDeEstudios?.[0]?.PlanMateria?.anio ||
            Number.MAX_SAFE_INTEGER,
          _profundidad: materiaPlan
            ? obtenerProfundidadMateria(materiaPlan.id)
            : Number.MAX_SAFE_INTEGER,
        };
      })
      .sort((a, b) => {
        if (a._anio !== b._anio) return a._anio - b._anio;
        if (a._profundidad !== b._profundidad)
          return a._profundidad - b._profundidad;
        return a._indice - b._indice;
      });

    for (const fila of filasOrdenadas) {
      const estadoNorm = mapearEstadoExcel(fila.estado);

      // Validar estado
      if (!estadosValidos.includes(estadoNorm)) {
        resultados.ignoradas.push({
          fila,
          razon: `Estado inválido: "${fila.estado}". Use: aprobada, regularizada, cursando, no_cursada`,
        });
        continue;
      }

      // Validar que la materia existe en el plan del estudiante
      const materiaPlan = fila._materiaPlan;
      if (!materiaPlan) {
        const ident = fila.id || fila.nombre || '(sin identificar)';
        resultados.ignoradas.push({
          fila,
          razon: `Materia no encontrada en el plan vigente: "${ident}"`,
        });
        continue;
      }

      const materiaId = materiaPlan.id;

      // G5: Detectar filas duplicadas (misma materia dos veces en el archivo)
      if (procesadosIds.has(materiaId)) {
        resultados.ignoradas.push({
          fila,
          razon: `"${materiaPlan.nombre}" aparece más de una vez en el archivo. Se ignora la fila duplicada.`,
        });
        continue;
      }
      procesadosIds.add(materiaId);

      // Validar que la materia no esté ya aprobada
      const estadoActual = estadosSimulados.get(materiaId) || 'no_cursada';
      if (estadoActual === 'aprobada') {
        resultados.errores.push({
          fila,
          razon: `"${materiaPlan.nombre}" ya está aprobada y no puede modificarse`,
        });
        continue;
      }

      // Validar correlatividades
      const prerequisitos = correlatividadesMap[materiaId] || [];
      const incumplidas = prerequisitos.filter((preId) => {
        const estadoPrereq = estadosSimulados.get(preId) || 'no_cursada';
        return estadoPrereq !== 'aprobada' && estadoPrereq !== 'regularizada';
      });

      if (incumplidas.length > 0) {
        if (estadoActual === 'no_cursada') {
          resultados.errores.push({
            fila,
            razon: `"${materiaPlan.nombre}" no está disponible (no cumple correlativas)`,
          });
          continue;
        }
      }

      // G2: Límite de 5 materias en cursando
      if (estadoNorm === 'cursando' && estadoActual !== 'cursando') {
        const cursandoActuales = [...estadosSimulados.values()].filter(
          (e) => e === 'cursando'
        ).length;
        if (cursandoActuales >= MAX_CURSANDO) {
          resultados.errores.push({
            fila,
            razon: `"${materiaPlan.nombre}" no se puede marcar como cursando. Ya hay ${MAX_CURSANDO} materias en cursando (máximo permitido).`,
          });
          continue;
        }
      }

      await guardarEstadoMateria(estudianteId, materiaId, estadoNorm);
      estadosSimulados.set(materiaId, estadoNorm);
      resultados.importadas.push({
        id: materiaId,
        nombre: materiaPlan.nombre,
        estado: estadoNorm,
      });
    }

    const resumen = {
      totalFilas: materias.length,
      importadas: resultados.importadas.length,
      ignoradas: resultados.ignoradas.length,
      errores: resultados.errores.length,
    };

    let message = `Importación completada. ${resumen.importadas} materias importadas.`;

    if (
      resumen.importadas === 0 &&
      (resumen.ignoradas > 0 || resumen.errores > 0)
    ) {
      message =
        'No se importó ninguna materia. Revisá los nombres y estados del archivo.';
    } else if (
      resumen.importadas > 0 &&
      (resumen.ignoradas > 0 || resumen.errores > 0)
    ) {
      message = `Importación parcial. ${
        resumen.importadas
      } materias importadas y ${
        resumen.ignoradas + resumen.errores
      } filas con observaciones.`;
    }

    res.json({
      message,
      data: {
        ...resultados,
        resumen,
      },
    });
  } catch (error) {
    console.error('Error en importarMateriasDesdeExcel:', error);
    res
      .status(500)
      .json({ message: 'Error al importar materias', error: error.message });
  }
};

/**
 * GET /api/estudiantes/:estudianteId/asistente
 * Devuelve el análisis completo de situación académica para el asistente.
 */
export const getAsistenteAcademico = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const modoQuery = String(req.query?.modo || 'intercalado').toLowerCase();
    const carreraIdParam = req.query?.carreraId
      ? Number(req.query.carreraId)
      : null;

    const estudiante = await Estudiante.findByPk(estudianteId, {
      include: [
        { model: Usuario, attributes: ['nombre', 'apellido'] },
        {
          model: Carrera,
          through: { attributes: [] },
          include: [
            {
              model: PlanDeEstudio,
              where: { estado: 'vigente' },
              required: false,
              include: [
                {
                  model: Materia,
                  through: { attributes: ['anio'] },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró el estudiante con id ${estudianteId}`,
      });
    }

    if (!estudiante.Carreras?.length) {
      return res
        .status(400)
        .json({ message: 'El estudiante no tiene carreras asignadas.' });
    }

    const carrerasConPlan = estudiante.Carreras.filter(
      (c) => (c.PlanDeEstudios || []).length > 0
    );

    if (!carrerasConPlan.length) {
      return res.status(400).json({
        message:
          'No se encontró plan de estudio vigente para las carreras del estudiante.',
      });
    }

    let modo = modoQuery === 'una' ? 'una' : 'intercalado';
    let carrerasSeleccionadas = [];

    if (modo === 'una') {
      const carreraSeleccionada = carreraIdParam
        ? carrerasConPlan.find((c) => Number(c.id) === Number(carreraIdParam))
        : carrerasConPlan[0];

      if (!carreraSeleccionada) {
        return res.status(400).json({
          message:
            'La carrera seleccionada no pertenece al estudiante o no tiene plan vigente.',
        });
      }

      carrerasSeleccionadas = [carreraSeleccionada];
    } else {
      carrerasSeleccionadas = carrerasConPlan;
    }

    const planesSeleccionados = carrerasSeleccionadas
      .map((c) => c.PlanDeEstudios?.[0])
      .filter(Boolean);
    const planIdsSeleccionados = planesSeleccionados.map((p) => p.id);

    const planMetaPorId = new Map(
      carrerasSeleccionadas
        .map((c) => {
          const plan = c.PlanDeEstudios?.[0];
          if (!plan) return null;
          return [
            plan.id,
            {
              carreraId: c.id,
              carreraNombre: c.nombre,
              carreraTitulo: c.titulo,
            },
          ];
        })
        .filter(Boolean)
    );

    // Cargar materias de los planes seleccionados y consolidarlas
    const materiasRaw = await Materia.findAll({
      include: [
        {
          model: PlanDeEstudio,
          through: { attributes: ['anio'] },
          where: { id: { [Op.in]: planIdsSeleccionados } },
          required: true,
        },
      ],
    });

    const materiasPorId = new Map();
    materiasRaw.forEach((m) => {
      const relacionesPlan = m.PlanDeEstudios || [];
      const anios = relacionesPlan
        .map((rel) => rel.PlanMateria?.anio)
        .filter((anio) => Number.isFinite(Number(anio)))
        .map((anio) => Number(anio));

      const carrerasMateria = [
        ...new Set(
          relacionesPlan
            .map((rel) => planMetaPorId.get(rel.id)?.carreraNombre)
            .filter(Boolean)
        ),
      ];

      const existente = materiasPorId.get(m.id);
      const anioConsolidado = anios.length
        ? Math.min(...anios)
        : existente?.anio || null;

      materiasPorId.set(m.id, {
        id: m.id,
        nombre: m.nombre,
        codigo: m.codigo,
        tipo: m.tipo,
        cargaHoraria: m.cargaHoraria || 0,
        anio: anioConsolidado,
        carreras: [
          ...new Set([...(existente?.carreras || []), ...carrerasMateria]),
        ],
      });
    });

    const materias = Array.from(materiasPorId.values());
    const materiasIds = materias.map((m) => m.id);

    // Cargar correlatividades
    const correlatividades = await Correlatividades.findAll({
      where: {
        materiaId: { [Op.in]: materiasIds },
        prerrequisitoId: { [Op.in]: materiasIds },
      },
    });
    const correlatividadesMap = {};
    correlatividades.forEach((c) => {
      if (!correlatividadesMap[c.materiaId])
        correlatividadesMap[c.materiaId] = [];
      correlatividadesMap[c.materiaId].push(c.prerrequisitoId);
    });

    // Cargar estados de BD
    const estadosBD = await obtenerTodosLosEstados(estudianteId);
    const registrosEstados = await obtenerRegistrosEstados(estudianteId);
    const registrosEstadosMap = new Map(
      registrosEstados.map((registro) => [registro.materiaId, registro])
    );
    const registrosEstadosPorCodigo = new Map();
    registrosEstados.forEach((registro) => {
      const codigo = normalizarTexto(registro.Materia?.codigo);
      if (codigo && !registrosEstadosPorCodigo.has(codigo)) {
        registrosEstadosPorCodigo.set(codigo, registro);
      }
    });

    const getEstado = (id) => {
      const materiaRef = materiasPorId.get(id);
      return (
        obtenerEstadoConEquivalencias(estadosBD, {
          id,
          codigo: materiaRef?.codigo,
        }) || 'no_cursada'
      );
    };

    const getRegistroEstado = (materiaRef) => {
      const directo = registrosEstadosMap.get(materiaRef.id);
      if (directo) return directo;
      const codigo = normalizarTexto(materiaRef.codigo);
      if (!codigo) return null;
      return registrosEstadosPorCodigo.get(codigo) || null;
    };

    const prerequisitosCumplidos = (materiaId) => {
      return (correlatividadesMap[materiaId] || []).every((preId) => {
        const e = getEstado(preId);
        return e === 'aprobada' || e === 'regularizada';
      });
    };

    // --- Análisis por materia ---
    const materiasConEstado = materias.map((m) => {
      const estado = getEstado(m.id);
      const anio = m.anio;
      const registroEstado = getRegistroEstado(m);
      return {
        id: m.id,
        nombre: m.nombre,
        codigo: m.codigo,
        tipo: m.tipo,
        anio,
        cargaHoraria: m.cargaHoraria || 0,
        carreras: m.carreras || [],
        estado,
        disponible: prerequisitosCumplidos(m.id),
        prerrequisitos: correlatividadesMap[m.id] || [],
        fechaEstado:
          registroEstado?.updatedAt || registroEstado?.createdAt || null,
      };
    });

    const total = materiasConEstado.length;
    const aprobadas = materiasConEstado.filter((m) => m.estado === 'aprobada');
    const regularizadas = materiasConEstado.filter(
      (m) => m.estado === 'regularizada'
    );
    const cursando = materiasConEstado.filter((m) => m.estado === 'cursando');
    const noCursadas = materiasConEstado.filter(
      (m) => m.estado === 'no_cursada'
    );

    // Materias en las que puede inscribirse (disponibles y no cursadas/aprobadas aún)
    const puedeCursar = noCursadas.filter((m) => m.disponible);

    // Finales pendientes: regularizadas (aprobaron la cursada, falta el final)
    const finalesPendientes = regularizadas.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      anio: m.anio,
      cargaHoraria: m.cargaHoraria || 0,
      fechaRegularidad:
        registrosEstadosMap.get(m.id)?.updatedAt ||
        registrosEstadosMap.get(m.id)?.createdAt ||
        null,
      fechaVencimientoRegularidad: sumarAnios(
        registrosEstadosMap.get(m.id)?.updatedAt ||
          registrosEstadosMap.get(m.id)?.createdAt ||
          null,
        2
      ),
      intentosPrevios: null,
    }));

    // Porcentaje de avance
    const porcentajeAvance =
      total > 0 ? Math.round((aprobadas.length / total) * 100) : 0;

    const cargaHorariaTotal = materiasConEstado.reduce(
      (acc, materia) => acc + (materia.cargaHoraria || 0),
      0
    );
    const cargaHorariaAprobada = aprobadas.reduce(
      (acc, materia) => acc + (materia.cargaHoraria || 0),
      0
    );
    const cargaHorariaRegularizada = regularizadas.reduce(
      (acc, materia) => acc + (materia.cargaHoraria || 0),
      0
    );
    const cargaHorariaCursando = cursando.reduce(
      (acc, materia) => acc + (materia.cargaHoraria || 0),
      0
    );
    const cargaHorariaPendiente = Math.max(
      cargaHorariaTotal -
        cargaHorariaAprobada -
        cargaHorariaRegularizada -
        cargaHorariaCursando,
      0
    );

    // Análisis por año
    const analisisPorAnio = {};
    materiasConEstado.forEach((m) => {
      const anio = m.anio || 'Sin año';
      if (!analisisPorAnio[anio]) {
        analisisPorAnio[anio] = {
          aprobadas: 0,
          regularizadas: 0,
          cursando: 0,
          faltantes: 0,
          total: 0,
          cargaHorariaTotal: 0,
          cargaHorariaAprobada: 0,
          cargaHorariaRegularizada: 0,
          cargaHorariaCursando: 0,
          cargaHorariaPendiente: 0,
        };
      }
      analisisPorAnio[anio].total++;
      analisisPorAnio[anio].cargaHorariaTotal += m.cargaHoraria || 0;
      if (m.estado === 'aprobada') analisisPorAnio[anio].aprobadas++;
      else if (m.estado === 'regularizada') {
        analisisPorAnio[anio].regularizadas++;
        analisisPorAnio[anio].cargaHorariaRegularizada += m.cargaHoraria || 0;
      } else if (m.estado === 'cursando') {
        analisisPorAnio[anio].cursando++;
        analisisPorAnio[anio].cargaHorariaCursando += m.cargaHoraria || 0;
      } else {
        analisisPorAnio[anio].faltantes++;
        analisisPorAnio[anio].cargaHorariaPendiente += m.cargaHoraria || 0;
      }
      if (m.estado === 'aprobada') {
        analisisPorAnio[anio].cargaHorariaAprobada += m.cargaHoraria || 0;
      }
    });

    // Agregar flag de año completo
    Object.keys(analisisPorAnio).forEach((anio) => {
      const a = analisisPorAnio[anio];
      a.completo = a.aprobadas === a.total;
    });

    // Proyección "¿Qué pasa si apruebo lo que estoy cursando?"
    const estadosHipoteticos = new Map(estadosBD);
    cursando.forEach((m) => estadosHipoteticos.set(m.id, 'regularizada'));

    const prerequisitosCumplidosHipotetico = (materiaId) => {
      return (correlatividadesMap[materiaId] || []).every((preId) => {
        const e = estadosHipoteticos.get(preId) || 'no_cursada';
        return e === 'aprobada' || e === 'regularizada';
      });
    };

    const seDesbloquearian = noCursadas
      .filter((m) => !m.disponible && prerequisitosCumplidosHipotetico(m.id))
      .map((m) => ({ id: m.id, nombre: m.nombre, anio: m.anio }));

    const materiasParaRecibirse = materiasConEstado
      .filter((m) => m.estado === 'no_cursada')
      .sort((a, b) => {
        if ((a.anio || 0) !== (b.anio || 0))
          return (a.anio || 0) - (b.anio || 0);
        if ((a.profundidad || 0) !== (b.profundidad || 0)) {
          return (a.profundidad || 0) - (b.profundidad || 0);
        }
        return a.nombre.localeCompare(b.nombre);
      })
      .map((m) => ({
        id: m.id,
        nombre: m.nombre,
        anio: m.anio,
        cargaHoraria: m.cargaHoraria,
        disponible: m.disponible,
      }));

    const paraRecibirse = {
      materiasPendientes: materiasParaRecibirse,
      finalesPendientes,
      cargaHorariaPendiente,
      cargaHorariaTotal,
      cargaHorariaAprobada,
      cargaHorariaRegularizada,
      cargaHorariaCursando,
    };

    res.json({
      data: {
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.Usuario?.nombre,
          apellido: estudiante.Usuario?.apellido,
        },
        carrera:
          modo === 'una'
            ? {
                id: carrerasSeleccionadas[0].id,
                nombre: carrerasSeleccionadas[0].nombre,
                titulo: carrerasSeleccionadas[0].titulo,
              }
            : null,
        carrerasSeleccionadas: carrerasSeleccionadas.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          titulo: c.titulo,
        })),
        carrerasDisponibles: carrerasConPlan.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          titulo: c.titulo,
        })),
        scope: {
          modo,
          carreraIdSeleccionada:
            modo === 'una' ? Number(carrerasSeleccionadas[0].id) : null,
          descripcion:
            modo === 'una'
              ? `Planificación de ${carrerasSeleccionadas[0].nombre}`
              : 'Planificación intercalada entre carreras',
        },
        resumen: {
          total,
          aprobadas: aprobadas.length,
          regularizadas: regularizadas.length,
          cursando: cursando.length,
          noCursadas: noCursadas.length,
          porcentajeAvance,
          cargaHorariaTotal,
          cargaHorariaAprobada,
          cargaHorariaRegularizada,
          cargaHorariaCursando,
          cargaHorariaPendiente,
        },
        materias: materiasConEstado,
        puedeCursar: puedeCursar.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          anio: m.anio,
          cargaHoraria: m.cargaHoraria || 0,
        })),
        finalesPendientes,
        analisisPorAnio,
        paraRecibirse,
        proyeccion: {
          descripcion:
            'Si regularizás todas las materias que estás cursando, podrías inscribirte en:',
          seDesbloquearian,
        },
      },
    });
  } catch (error) {
    console.error('Error en getAsistenteAcademico:', error);
    res.status(500).json({
      message: 'Error al obtener análisis del asistente académico',
      error: error.message,
    });
  }
};
