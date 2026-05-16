import db from '../models/index.js';
const {
  Estudiante,
  Usuario,
  Carrera,
  PlanDeEstudio,
  Materia,
  Correlatividades,
  PreferenciasEstudiante,
} = db;
import { Op } from 'sequelize';

// Almacenamiento temporal de estados de materias por estudiante (en memoria)
// En producción esto iría a una tabla de base de datos
const estadosMaterias = new Map();

const getEstadoKey = (estudianteId, materiaId) =>
  `${estudianteId}-${materiaId}`;

const guardarEstadoMateria = (estudianteId, materiaId, estado) => {
  const key = getEstadoKey(estudianteId, materiaId);
  estadosMaterias.set(key, estado);
  console.log(`Estado guardado: ${key} = ${estado}`);
};

const obtenerEstadoMateria = (estudianteId, materiaId) => {
  const key = getEstadoKey(estudianteId, materiaId);
  return estadosMaterias.get(key) || null;
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
          attributes: ['perfilPublico', 'mostrarEmail', 'mostrarSituacionAcademica'],
          required: false
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
        mostrarSituacionAcademica: estudiante.preferencias?.mostrarSituacionAcademica ?? false,
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
          attributes: ['perfilPublico', 'mostrarEmail', 'mostrarSituacionAcademica'],
          required: false
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
        mostrarSituacionAcademica: estudiante.preferencias?.mostrarSituacionAcademica ?? false,
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
                  through: { attributes: [] },
                  required: false, // Cambiado a false
                },
              ],
            },
          ],
        },
      ],
    });

    console.log(`Carreras del estudiante:`, estudiante.Carreras?.length || 0);

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
          through: { attributes: [] },
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
      if (!correlatividadesMap[corr.materiaId]) {
        correlatividadesMap[corr.materiaId] = [];
      }
      correlatividadesMap[corr.materiaId].push({
        id: corr.prerrequisitoId,
        nombre: corr.Prerrequisito.nombre,
      });
    });

    console.log(`Procesando estados de materias...`);

    // Generar estados realistas RESPETANDO CORRELATIVIDADES
    // Primero, crear un mapa temporal para construir estados de forma secuencial
    const estadosTemp = new Map();

    // Función auxiliar para verificar si los prerrequisitos están cumplidos
    const prerequisitosCumplidos = (materiaId) => {
      const prerreqs = correlatividadesMap[materiaId] || [];
      return prerreqs.every((pre) => {
        const estadoPrereq =
          estadosTemp.get(pre.id) ||
          obtenerEstadoMateria(estudianteId, pre.id) ||
          'no_cursada';
        return estadoPrereq === 'aprobada' || estadoPrereq === 'regularizada';
      });
    };

    // Procesar materias por año para respetar la secuencia académica
    const materiasPorAnioTemp = {};
    materias.forEach((materia) => {
      if (!materiasPorAnioTemp[materia.anio]) {
        materiasPorAnioTemp[materia.anio] = [];
      }
      materiasPorAnioTemp[materia.anio].push(materia);
    });

    // Procesar año por año
    const aniosOrdenados = Object.keys(materiasPorAnioTemp).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    aniosOrdenados.forEach((anio) => {
      materiasPorAnioTemp[anio].forEach((materia) => {
        // VERIFICAR PRIMERO SI HAY UN ESTADO GUARDADO
        const estadoGuardado = obtenerEstadoMateria(estudianteId, materia.id);

        if (estadoGuardado) {
          // Validar que el estado guardado respete correlatividades
          if (
            (estadoGuardado === 'aprobada' ||
              estadoGuardado === 'regularizada') &&
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
          // Si no hay estado guardado, siempre comenzar como 'no_cursada'
          // El usuario debe cambiar manualmente el estado cuando corresponda
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
        (estado === 'aprobada' || estado === 'regularizada') &&
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
        anio: materia.anio,
        tipo: materia.tipo,
        estado: estado,
        disponible: disponible,
        prerrequisitos: prerrequisitos,
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
      materiasPorAnio[anio].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    const resumen = {
      aprobadas: materiasConEstado.filter((m) => m.estado === 'aprobada')
        .length,
      regularizadas: materiasConEstado.filter(
        (m) => m.estado === 'regularizada'
      ).length,
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
          nombre: estudiante.Usuario.nombre,
          apellido: estudiante.Usuario.apellido,
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
    const estadosValidos = ['aprobada', 'regularizada', 'no_cursada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message:
          'Estado inválido. Debe ser: aprobada, regularizada o no_cursada',
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
    if (estado === 'aprobada' || estado === 'regularizada') {
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

      // Usar la MISMA función que determina "disponible"
      const prerequisitosCumplidos = (materiaIdToCheck) => {
        const prerreqs = correlatividadesMap[materiaIdToCheck] || [];
        return prerreqs.every((pre) => {
          const estadoPrereq =
            obtenerEstadoMateria(estudianteId, pre.id) || 'no_cursada';
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
              obtenerEstadoMateria(estudianteId, pre.id) || 'no_cursada';
            return (
              estadoPrereq !== 'aprobada' && estadoPrereq !== 'regularizada'
            );
          })
          .map((pre) => pre.nombre);

        return res.status(400).json({
          tipo: 'PRERREQUISITOS_INCUMPLIDOS',
          message: `No se puede ${
            estado === 'aprobada' ? 'aprobar' : 'regularizar'
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
            attributes: ['id', 'nombre', 'anio', 'tipo'],
          });

          // ✅ FILTRAR SOLO MATERIAS QUE REALMENTE NECESITAN SER CAMBIADAS
          const materiasQueRealmenteSeAfectan = materiasAfectadas.filter(
            (materia) => {
              const estadoActual =
                obtenerEstadoMateria(estudianteId, materia.id) || 'no_cursada';
              // Solo incluir si está aprobada o regularizada (necesita cambio)
              return (
                estadoActual === 'aprobada' || estadoActual === 'regularizada'
              );
            }
          );

          // Solo mostrar diálogo si HAY materias que realmente se afectan
          if (materiasQueRealmenteSeAfectan.length > 0) {
            return res.status(409).json({
              tipo: 'CONFLICTO_CORRELATIVIDADES',
              message:
                'Esta materia es correlativa de otras materias que están aprobadas/regularizadas. Al marcarla como "no cursada", también deberían cambiarse sus dependientes.',
              materiasAfectadas: materiasQueRealmenteSeAfectan.map(
                (materia) => ({
                  id: materia.id,
                  nombre: materia.nombre,
                  anio: materia.anio,
                  tipo: materia.tipo,
                  estadoActual: obtenerEstadoMateria(estudianteId, materia.id),
                })
              ),
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

          for (const rel of materiasQueDependen) {
            const estadoActual =
              obtenerEstadoMateria(estudianteId, rel.materiaId) || 'no_cursada';

            // Solo cambiar si está aprobada o regularizada
            if (
              estadoActual === 'aprobada' ||
              estadoActual === 'regularizada'
            ) {
              guardarEstadoMateria(estudianteId, rel.materiaId, 'no_cursada');
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

    // GUARDAR REALMENTE EL ESTADO
    guardarEstadoMateria(estudianteId, materiaId, estado);

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
          anio: materia.anio,
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
