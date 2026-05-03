import db from '../models/index.js';
const { Carrera, PlanDeEstudio, Materia } = db;

export const index = async (req, res) => {
  try {
    const carreras = await Carrera.findAll({
      include: [
        {
          model: PlanDeEstudio,
          where: { estado: 'vigente' },
          include: [
            {
              model: Materia,
              through: { attributes: [] },
              attributes: ['id', 'nombre', 'anio', 'tipo'],
            },
          ],
        },
      ],
      order: [['nombre', 'ASC']],
    });

    res.json({
      data: carreras.map((carrera) => ({
        id: carrera.id,
        nombre: carrera.nombre,
        titulo: carrera.titulo,
        instituto: carrera.instituto,
        duracion: carrera.duracion,
        planVigente: carrera.PlanesDeEstudio?.[0] || null,
        totalMaterias: carrera.PlanesDeEstudio?.[0]?.Materias?.length || 0,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener las carreras', error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const carrera = await Carrera.findByPk(req.params.id, {
      include: [
        {
          model: PlanDeEstudio,
          where: { estado: 'vigente' },
          include: [
            {
              model: Materia,
              through: { attributes: [] },
              attributes: ['id', 'nombre', 'anio', 'tipo'],
            },
          ],
        },
      ],
    });

    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${req.params.id}`,
      });
    }

    // Organizar materias por año
    const materiasPorAnio = {};
    if (carrera.PlanesDeEstudio?.[0]?.Materias) {
      carrera.PlanesDeEstudio[0].Materias.forEach((materia) => {
        if (!materiasPorAnio[materia.anio]) {
          materiasPorAnio[materia.anio] = [];
        }
        materiasPorAnio[materia.anio].push(materia);
      });
    }

    res.json({
      data: {
        id: carrera.id,
        nombre: carrera.nombre,
        titulo: carrera.titulo,
        instituto: carrera.instituto,
        duracion: carrera.duracion,
        planVigente: carrera.PlanesDeEstudio?.[0] || null,
        materiasPorAnio,
        totalMaterias: carrera.PlanesDeEstudio?.[0]?.Materias?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la carrera',
      error: error.message,
    });
  }
};

export const getPlanDeEstudio = async (req, res) => {
  try {
    const { carreraId } = req.params;

    const plan = await PlanDeEstudio.findOne({
      where: {
        carreraId: carreraId,
        estado: 'vigente',
      },
      include: [
        {
          model: Carrera,
          attributes: ['id', 'nombre', 'titulo'],
        },
        {
          model: Materia,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'anio', 'tipo'],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({
        message: `No se encontró un plan de estudio vigente para la carrera con id ${carreraId}`,
      });
    }

    // Organizar materias por año
    const materiasPorAnio = {};
    plan.Materias.forEach((materia) => {
      if (!materiasPorAnio[materia.anio]) {
        materiasPorAnio[materia.anio] = [];
      }
      materiasPorAnio[materia.anio].push({
        id: materia.id,
        nombre: materia.nombre,
        anio: materia.anio,
        tipo: materia.tipo,
      });
    });

    // Ordenar materias dentro de cada año
    Object.keys(materiasPorAnio).forEach((anio) => {
      materiasPorAnio[anio].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    res.json({
      data: {
        id: plan.id,
        nombre: plan.nombre,
        estado: plan.estado,
        carrera: plan.Carrera,
        materiasPorAnio,
        totalMaterias: plan.Materias.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el plan de estudio',
      error: error.message,
    });
  }
};
