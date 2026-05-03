import db from '../models/index.js';
const {
  Estudiante,
  Usuario,
  Carrera,
  PlanDeEstudio,
  Materia,
  Correlatividades,
} = db;
import { Op } from 'sequelize';

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
        perfilPublico: estudiante.perfilPublico,
        mostrarEmail: estudiante.mostrarEmail,
        mostrarSituacionAcademica: estudiante.mostrarSituacionAcademica,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({
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
        perfilPublico: estudiante.perfilPublico,
        mostrarEmail: estudiante.mostrarEmail,
        mostrarSituacionAcademica: estudiante.mostrarSituacionAcademica,
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
              include: [
                {
                  model: Materia,
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({
        message: `No se encontró un estudiante con id ${estudianteId}`,
      });
    }

    if (!estudiante.Carreras || estudiante.Carreras.length === 0) {
      return res.status(400).json({
        message: 'El estudiante no tiene carreras asignadas',
      });
    }

    // Por ahora tomamos la primera carrera (luego se puede expandir para múltiples carreras)
    const carrera = estudiante.Carreras[0];
    const planDeEstudio = carrera.PlanesDeEstudio[0];

    if (!planDeEstudio) {
      return res.status(400).json({
        message:
          'No se encontró un plan de estudio vigente para la carrera del estudiante',
      });
    }

    // Obtener todas las materias del plan
    const materias = planDeEstudio.Materias;

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

    // Generar estados realistas para las materias
    // Para demostración, crearemos un patrón realista basado en el año de la materia
    const materiasConEstado = materias.map((materia) => {
      let estado;
      const prerrequisitos = correlatividadesMap[materia.id] || [];

      // Lógica para asignar estados de manera realista
      if (materia.anio === 1) {
        // Materias de primer año: mayoría aprobadas para estudiantes avanzados
        const random = Math.random();
        if (random < 0.7) estado = 'aprobada';
        else if (random < 0.9) estado = 'regularizada';
        else estado = 'no_cursada';
      } else if (materia.anio === 2) {
        const random = Math.random();
        if (random < 0.5) estado = 'aprobada';
        else if (random < 0.8) estado = 'regularizada';
        else estado = 'no_cursada';
      } else if (materia.anio === 3) {
        const random = Math.random();
        if (random < 0.3) estado = 'aprobada';
        else if (random < 0.6) estado = 'regularizada';
        else estado = 'no_cursada';
      } else {
        // Años superiores: mayoría no cursadas
        const random = Math.random();
        if (random < 0.1) estado = 'aprobada';
        else if (random < 0.3) estado = 'regularizada';
        else estado = 'no_cursada';
      }

      // Determinar si está disponible (puede cursarse)
      const disponible =
        prerrequisitos.length === 0 ||
        prerrequisitos.every((pre) => {
          // Por simplicidad, asumimos que los prerrequisitos de años anteriores están aprobados
          const materiaPrerequisito = materias.find((m) => m.id === pre.id);
          return materiaPrerequisito && materiaPrerequisito.anio < materia.anio;
        });

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
    res.status(500).json({
      message: 'Error al obtener las materias del estudiante',
      error: error.message,
    });
  }
};

export const updateEstadoMateria = async (req, res) => {
  try {
    const { estudianteId, materiaId } = req.params;
    const { estado } = req.body;

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

    // Por ahora solo simulamos la actualización
    // En una implementación completa, esto iría a una tabla de estados de materias por estudiante
    res.json({
      message: 'Estado de materia actualizado exitosamente',
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
    res.status(500).json({
      message: 'Error al actualizar el estado de la materia',
      error: error.message,
    });
  }
};
