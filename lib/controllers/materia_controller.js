import db from '../models/index.js';
const { Materia, PlanDeEstudio, Carrera, Correlatividades, PlanMateria } = db;

export const index = async (req, res) => {
  try {
    const { carreraId, anio } = req.query;

    const whereClause = {};
    const includeClause = [
      {
        model: PlanDeEstudio,
        through: { attributes: [] },
        include: [
          {
            model: Carrera,
            attributes: ['id', 'nombre'],
          },
        ],
      },
    ];

    // Filtrar por carrera si se especifica
    if (carreraId) {
      includeClause[0].where = { carreraId: parseInt(carreraId) };
    }

    // Filtrar por año si se especifica
    if (anio) {
      whereClause.anio = parseInt(anio);
    }

    const materias = await Materia.findAll({
      where: whereClause,
      include: includeClause,
      order: [
        ['anio', 'ASC'],
        ['nombre', 'ASC'],
      ],
    });

    res.json({
      data: materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
        anio: materia.anio,
        tipo: materia.tipo,
        carreras: materia.PlanDeEstudios?.map((plan) => plan.Carrera) || [],
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener las materias', error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id, {
      include: [
        {
          model: PlanDeEstudio,
          through: { attributes: [] },
          include: [
            {
              model: Carrera,
              attributes: ['id', 'nombre', 'titulo'],
            },
          ],
        },
        {
          model: Materia,
          as: 'Prerrequisitos',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'anio'],
        },
      ],
    });

    if (!materia) {
      return res.status(404).json({
        message: `No se encontró una materia con id ${req.params.id}`,
      });
    }

    // Obtener materias que tienen esta como prerrequisito
    const materiasDependientes = await Materia.findAll({
      include: [
        {
          model: Materia,
          as: 'Prerrequisitos',
          where: { id: materia.id },
          through: { attributes: [] },
          attributes: [],
        },
      ],
      attributes: ['id', 'nombre', 'anio'],
    });

    res.json({
      data: {
        id: materia.id,
        nombre: materia.nombre,
        anio: materia.anio,
        tipo: materia.tipo,
        carreras: materia.PlanDeEstudios?.map((plan) => plan.Carrera) || [],
        prerrequisitos: materia.Prerrequisitos || [],
        materiasDependientes: materiasDependientes || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la materia',
      error: error.message,
    });
  }
};

export const getCorrelatividades = async (req, res) => {
  try {
    const { materiaId } = req.params;

    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({
        message: `No se encontró una materia con id ${materiaId}`,
      });
    }

    // Obtener prerrequisitos (materias que necesita aprobar para cursar esta)
    const prerrequisitos = await Correlatividades.findAll({
      where: { materiaId: materiaId },
      include: [
        {
          model: Materia,
          as: 'Prerrequisito',
          attributes: ['id', 'nombre', 'anio', 'tipo'],
        },
      ],
    });

    // Obtener materias dependientes (materias que necesitan esta como prerrequisito)
    const dependientes = await Correlatividades.findAll({
      where: { prerrequisitoId: materiaId },
      include: [
        {
          model: Materia,
          as: 'Materia',
          attributes: ['id', 'nombre', 'anio', 'tipo'],
        },
      ],
    });

    res.json({
      data: {
        materia: {
          id: materia.id,
          nombre: materia.nombre,
          anio: materia.anio,
          tipo: materia.tipo,
        },
        prerrequisitos: prerrequisitos.map((p) => p.Prerrequisito),
        dependientes: dependientes.map((d) => d.Materia),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las correlatividades',
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, anio, tipo, planId } = req.body;

    if (!nombre || !anio || !tipo) {
      return res.status(400).json({
        message: 'El nombre, año y tipo son obligatorios',
      });
    }

    if (!['anual', 'cuatrimestral'].includes(tipo)) {
      return res.status(400).json({
        message: 'El tipo debe ser "anual" o "cuatrimestral"',
      });
    }

    const materia = await Materia.create({
      nombre,
      anio: parseInt(anio),
      tipo,
    });

    // Si se especifica un plan, asociar la materia
    if (planId) {
      const plan = await PlanDeEstudio.findByPk(planId);
      if (!plan) {
        await materia.destroy();
        return res.status(404).json({
          message: `No se encontró un plan de estudio con id ${planId}`,
        });
      }
      await PlanMateria.create({ planId, materiaId: materia.id });
    }

    res.status(201).json({
      message: 'Materia creada exitosamente',
      data: materia.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la materia',
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, anio, tipo } = req.body;

    const materia = await Materia.findByPk(id);
    if (!materia) {
      return res.status(404).json({
        message: `No se encontró una materia con id ${id}`,
      });
    }

    if (tipo && !['anual', 'cuatrimestral'].includes(tipo)) {
      return res.status(400).json({
        message: 'El tipo debe ser "anual" o "cuatrimestral"',
      });
    }

    await materia.update({
      ...(nombre && { nombre }),
      ...(anio && { anio: parseInt(anio) }),
      ...(tipo && { tipo }),
    });

    res.json({
      message: 'Materia actualizada exitosamente',
      data: materia.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la materia',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const materia = await Materia.findByPk(id);
    if (!materia) {
      return res.status(404).json({
        message: `No se encontró una materia con id ${id}`,
      });
    }

    // Check if materia has correlatividades dependencies
    const dependientes = await Correlatividades.findAll({
      where: { prerrequisitoId: id },
    });
    if (dependientes.length > 0) {
      return res.status(409).json({
        message:
          'No se puede eliminar la materia porque es prerrequisito de otras materias',
        dependientesCount: dependientes.length,
      });
    }

    await materia.destroy();

    res.json({
      message: 'Materia eliminada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la materia',
      error: error.message,
    });
  }
};

export const getMateriasPorAnio = async (req, res) => {
  try {
    const { carreraId } = req.params;

    // Verificar que la carrera existe
    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${carreraId}`,
      });
    }

    // Obtener el plan vigente con sus materias
    const plan = await PlanDeEstudio.findOne({
      where: {
        carreraId: carreraId,
        estado: 'vigente',
      },
      include: [
        {
          model: Materia,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'anio', 'tipo'],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({
        message: `No se encontró un plan de estudio vigente para la carrera`,
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
        carrera: {
          id: carrera.id,
          nombre: carrera.nombre,
          titulo: carrera.titulo,
        },
        plan: {
          id: plan.id,
          nombre: plan.nombre,
        },
        materiasPorAnio,
        resumen: {
          totalMaterias: plan.Materias.length,
          anios: Object.keys(materiasPorAnio).length,
          materiasPorAnioCount: Object.keys(materiasPorAnio).reduce(
            (acc, anio) => {
              acc[anio] = materiasPorAnio[anio].length;
              return acc;
            },
            {}
          ),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las materias por año',
      error: error.message,
    });
  }
};
