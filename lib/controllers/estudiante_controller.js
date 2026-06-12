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
  await EstudianteMateria.upsert(
    {
      estudianteId: parseInt(estudianteId),
      materiaId: parseInt(materiaId),
      estado,
    },
    { conflictFields: ['estudianteId', 'materiaId'] }
  );
};

const obtenerRegistrosEstados = async (estudianteId) => {
  return EstudianteMateria.findAll({
    where: { estudianteId: parseInt(estudianteId) },
    attributes: ['materiaId', 'estado', 'createdAt', 'updatedAt'],
    order: [['updatedAt', 'DESC']],
  });
};

const obtenerTodosLosEstados = async (estudianteId) => {
  const registros = await obtenerRegistrosEstados(estudianteId);
  const map = new Map();
  registros.forEach((r) => map.set(r.materiaId, r.estado));
  return map;
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

export const getPlanMaterias = async (req, res) => {
  try {
    const { estudianteId } = req.params;

    console.log(`Buscando plan de materias para estudiante ${estudianteId}`);

    // Verificar que el estudiante existe primero
    const estudianteBasico = await Estudiante.findByPk(estudianteId);

    if (!estudianteBasico) {
      console.log(`Estudiante ${estudianteId} no encontrado`);
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
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
              where: { estado: 'vigente' },
              required: false, // Cambiado a false para evitar el INNER JOIN
              include: [
                {
                  model: Materia,
                  through: { attributes: ['anio'] },
                  required: false, // Cambiado a false
                },
              ],
            },
          ],
        },
      ],
    });

    console.log(`Carreras del estudiante:`, estudiante.Carreras?.length || 0);

    if (!estudiante.Usuario) {
      return res.status(400).json({
        message:
          'El estudiante no tiene datos de usuario asociados. Verifique la integridad de los datos.',
      });
    }

    if (!estudiante.Carreras || estudiante.Carreras.length === 0) {
      return res.status(400).json({
        message: 'El estudiante no tiene carreras asignadas',
      });
    }

    // Por ahora tomamos la primera carrera (luego se puede expandir para múltiples carreras)
    const carrera = estudiante.Carreras[0];
    const planDeEstudio = carrera.PlanDeEstudios?.[0];

    console.log(`Plan de estudio encontrado:`, planDeEstudio?.id || 'ninguno');

    if (!planDeEstudio) {
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
      },
      include: [
        {
          model: Materia,
          as: 'Materia',
          attributes: ['id', 'nombre'],
        },
        {
          model: Materia,
          as: 'Prerrequisito',
          attributes: ['id', 'nombre'],
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
        nombre: corr.Prerrequisito?.nombre || 'Prerrequisito no disponible',
      });
    });

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
        const estadoPrereq = estadosTemp.get(pre.id) || 'no_cursada';
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
        const estadoGuardado = estadosBD.get(materia.id) || null;

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

export const updateEstadoMateria = async (req, res) => {
  try {
    const { estudianteId, materiaId } = req.params;
    const { estado, confirmarCascada = false } = req.body;

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
    const estudiante = await Estudiante.findByPk(estudianteId);
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
        where: { materiaId },
        include: [
          {
            model: Materia,
            as: 'Prerrequisito',
            attributes: ['id', 'nombre'],
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
          nombre: corr.Prerrequisito.nombre,
        });
      });

      // Cargar todos los estados del estudiante para validar prerrequisitos
      const estadosBDUpdate = await obtenerTodosLosEstados(estudianteId);

      const prerequisitosCumplidos = (materiaIdToCheck) => {
        const prerreqs = correlatividadesMap[materiaIdToCheck] || [];
        return prerreqs.every((pre) => {
          const estadoPrereq = estadosBDUpdate.get(pre.id) || 'no_cursada';
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
            const estadoPrereq = estadosBDUpdate.get(pre.id) || 'no_cursada';
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
          where: { prerrequisitoId: materiaId },
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
    const { materias } = req.body;

    if (!Array.isArray(materias) || materias.length === 0) {
      return res
        .status(400)
        .json({ message: 'El campo "materias" debe ser un array no vacío.' });
    }

    const estadosValidos = ['aprobada', 'regularizada', 'cursando'];

    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró el estudiante con id ${estudianteId}`,
      });
    }

    // Obtener todas las materias de la BD para resolver por nombre
    const todasLasMaterias = await Materia.findAll({
      attributes: ['id', 'nombre'],
    });
    const nombreAId = new Map(
      todasLasMaterias.map((m) => [normalizarTexto(m.nombre), m.id])
    );

    const resultados = { importadas: [], ignoradas: [], errores: [] };

    for (const fila of materias) {
      const nombreNorm = normalizarTexto(fila.nombre);
      const estadoNorm = mapearEstadoExcel(fila.estado);

      if (!nombreNorm) {
        resultados.ignoradas.push({ fila, razon: 'Nombre vacío' });
        continue;
      }

      if (!estadosValidos.includes(estadoNorm)) {
        resultados.ignoradas.push({
          fila,
          razon: `Estado inválido: "${fila.estado}". Use: aprobada, regularizada, cursando`,
        });
        continue;
      }

      const materiaId = nombreAId.get(nombreNorm);
      if (!materiaId) {
        resultados.errores.push({
          fila,
          razon: `Materia no encontrada: "${fila.nombre}"`,
        });
        continue;
      }

      await guardarEstadoMateria(estudianteId, materiaId, estadoNorm);
      resultados.importadas.push({ nombre: fila.nombre, estado: estadoNorm });
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

    const carrera = estudiante.Carreras[0];
    const planDeEstudio = carrera.PlanDeEstudios?.[0];

    if (!planDeEstudio) {
      return res
        .status(400)
        .json({ message: 'No se encontró plan de estudio vigente.' });
    }

    // Cargar materias del plan con su año
    const materias = await Materia.findAll({
      include: [
        {
          model: PlanDeEstudio,
          through: { attributes: ['anio'] },
          where: { id: planDeEstudio.id },
        },
      ],
    });

    // Cargar correlatividades
    const correlatividades = await Correlatividades.findAll({
      where: { materiaId: { [Op.in]: materias.map((m) => m.id) } },
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
    const getEstado = (id) => estadosBD.get(id) || 'no_cursada';

    const prerequisitosCumplidos = (materiaId) => {
      return (correlatividadesMap[materiaId] || []).every((preId) => {
        const e = getEstado(preId);
        return e === 'aprobada' || e === 'regularizada';
      });
    };

    // --- Análisis por materia ---
    const materiasConEstado = materias.map((m) => {
      const estado = getEstado(m.id);
      const anio = m.PlanDeEstudios?.[0]?.PlanMateria?.anio;
      const registroEstado = registrosEstadosMap.get(m.id);
      return {
        id: m.id,
        nombre: m.nombre,
        tipo: m.tipo,
        anio,
        cargaHoraria: m.cargaHoraria || 0,
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
        carrera: {
          id: carrera.id,
          nombre: carrera.nombre,
          titulo: carrera.titulo,
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
