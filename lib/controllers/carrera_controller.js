import { Sequelize } from 'sequelize';
import db from '../models/index.js';
const { Carrera, PlanDeEstudio, Materia, PlanMateria } = db;

export const index = async (req, res) => {
  try {
    const carreras = await Carrera.findAll({
      include: [
        {
          model: PlanDeEstudio,
          required: false,
          include: [
            {
              model: Materia,
              through: { attributes: ['anio'] },
              attributes: ['id', 'nombre', 'tipo'],
            },
          ],
        },
      ],
    });

    carreras.sort((a, b) =>
      a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase(), 'es')
    );

    res.json({
      data: carreras.map((carrera) => ({
        id: carrera.id,
        nombre: carrera.nombre,
        titulo: carrera.titulo,
        instituto: carrera.instituto,
        duracion: carrera.duracion,
        planVigente:
          carrera.PlanDeEstudios?.find((p) => p.estado === 'vigente') || null,
        totalPlanes: carrera.PlanDeEstudios?.length || 0,
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
              through: { attributes: ['anio'] },
              attributes: ['id', 'nombre', 'tipo'],
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
    if (carrera.PlanDeEstudios?.[0]?.Materia) {
      carrera.PlanDeEstudios[0].Materia.forEach((materia) => {
        const anio = materia.PlanMateria?.anio || materia.anio;
        if (!materiasPorAnio[anio]) {
          materiasPorAnio[anio] = [];
        }
        materiasPorAnio[anio].push(materia);
      });
    }

    res.json({
      data: {
        id: carrera.id,
        nombre: carrera.nombre,
        titulo: carrera.titulo,
        instituto: carrera.instituto,
        duracion: carrera.duracion,
        planVigente: carrera.PlanDeEstudios?.[0] || null,
        materiasPorAnio,
        totalMaterias: carrera.PlanDeEstudios?.[0]?.Materia?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la carrera',
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, titulo, instituto, duracion } = req.body;

    if (!nombre || !titulo) {
      return res.status(400).json({
        message: 'El nombre y el título son obligatorios',
      });
    }

    const carreraExistente = await Carrera.findOne({ where: { nombre } });
    if (carreraExistente) {
      return res.status(409).json({
        message: `Ya existe una carrera con el nombre "${nombre}"`,
      });
    }

    const carrera = await Carrera.create({
      nombre,
      titulo,
      instituto,
      duracion,
    });

    res.status(201).json({
      message: 'Carrera creada exitosamente',
      data: carrera.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear la carrera',
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, titulo, instituto, duracion } = req.body;

    const carrera = await Carrera.findByPk(id);
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${id}`,
      });
    }

    if (nombre && nombre !== carrera.nombre) {
      const carreraExistente = await Carrera.findOne({ where: { nombre } });
      if (carreraExistente) {
        return res.status(409).json({
          message: `Ya existe una carrera con el nombre "${nombre}"`,
        });
      }
    }

    await carrera.update({ nombre, titulo, instituto, duracion });

    res.json({
      message: 'Carrera actualizada exitosamente',
      data: carrera.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la carrera',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const carrera = await Carrera.findByPk(id, {
      include: [{ model: PlanDeEstudio }],
    });
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${id}`,
      });
    }

    if (carrera.PlanDeEstudios && carrera.PlanDeEstudios.length > 0) {
      return res.status(409).json({
        message:
          'No se puede eliminar la carrera porque tiene planes de estudio asociados. Elimine primero los planes.',
        planesCount: carrera.PlanDeEstudios.length,
      });
    }

    await carrera.destroy();

    res.json({
      message: 'Carrera eliminada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar la carrera',
      error: error.message,
    });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { carreraId } = req.params;
    const { nombre, estado } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ message: 'El nombre del plan es obligatorio' });
    }

    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${carreraId}`,
      });
    }

    const estadosValidos = ['vigente', 'transición', 'discontinuado'];
    const estadoFinal =
      estado && estadosValidos.includes(estado) ? estado : 'vigente';

    let materiasOrigen = [];
    if (estadoFinal === 'vigente') {
      const planVigente = await PlanDeEstudio.findOne({
        where: { carreraId: parseInt(carreraId), estado: 'vigente' },
        include: [{ model: Materia, through: { attributes: ['anio'] } }],
      });
      if (planVigente) {
        materiasOrigen = planVigente.Materia || [];
      }

      await PlanDeEstudio.update(
        { estado: 'discontinuado' },
        { where: { carreraId: parseInt(carreraId), estado: 'transición' } }
      );
      await PlanDeEstudio.update(
        { estado: 'transición' },
        { where: { carreraId: parseInt(carreraId), estado: 'vigente' } }
      );
    }

    const plan = await PlanDeEstudio.create({
      nombre,
      estado: estadoFinal,
      carreraId: parseInt(carreraId),
    });

    if (materiasOrigen.length > 0) {
      await PlanMateria.bulkCreate(
        materiasOrigen.map((m) => ({
          planId: plan.id,
          materiaId: m.id,
          anio: m.PlanMateria?.anio || null,
        }))
      );
    }

    const planCompleto = await PlanDeEstudio.findByPk(plan.id, {
      include: [{ model: Materia, through: { attributes: ['anio'] } }],
    });

    res.status(201).json({
      message: 'Plan de estudio creado exitosamente',
      data: planCompleto.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el plan de estudio',
      error: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { carreraId, planId } = req.params;
    const { nombre, estado } = req.body;

    const plan = await PlanDeEstudio.findOne({
      where: { id: planId, carreraId },
    });
    if (!plan) {
      return res.status(404).json({
        message: `No se encontró un plan con id ${planId} para la carrera ${carreraId}`,
      });
    }

    if (
      estado &&
      !['vigente', 'transición', 'discontinuado'].includes(estado)
    ) {
      return res.status(400).json({
        message: 'El estado debe ser "vigente", "transición" o "discontinuado"',
      });
    }

    if (estado === 'vigente' && plan.estado !== 'vigente') {
      await PlanDeEstudio.update(
        { estado: 'discontinuado' },
        {
          where: {
            carreraId: parseInt(carreraId),
            estado: 'transición',
          },
        }
      );
      await PlanDeEstudio.update(
        { estado: 'transición' },
        {
          where: {
            carreraId: parseInt(carreraId),
            estado: 'vigente',
            id: { [Sequelize.Op.ne]: parseInt(planId) },
          },
        }
      );
    }

    await plan.update({
      ...(nombre && { nombre }),
      ...(estado && { estado }),
    });

    res.json({
      message: 'Plan de estudio actualizado exitosamente',
      data: plan.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el plan de estudio',
      error: error.message,
    });
  }
};

export const removePlan = async (req, res) => {
  try {
    const { carreraId, planId } = req.params;

    const plan = await PlanDeEstudio.findOne({
      where: { id: planId, carreraId },
    });
    if (!plan) {
      return res.status(404).json({
        message: `No se encontró un plan con id ${planId} para la carrera ${carreraId}`,
      });
    }

    await plan.destroy();

    res.json({
      message: 'Plan de estudio eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el plan de estudio',
      error: error.message,
    });
  }
};

export const getPlanesByCarrera = async (req, res) => {
  try {
    const { carreraId } = req.params;

    const carrera = await Carrera.findByPk(carreraId);
    if (!carrera) {
      return res.status(404).json({
        message: `No se encontró una carrera con id ${carreraId}`,
      });
    }

    const planes = await PlanDeEstudio.findAll({
      where: { carreraId },
      include: [
        {
          model: Materia,
          through: { attributes: ['anio'] },
          attributes: ['id', 'nombre', 'tipo'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: planes.map((plan) => ({
        id: plan.id,
        nombre: plan.nombre,
        estado: plan.estado,
        carreraId: plan.carreraId,
        materias: plan.Materia || [],
        totalMaterias: plan.Materia?.length || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los planes de estudio',
      error: error.message,
    });
  }
};

export const addMateriaToPlan = async (req, res) => {
  try {
    const { carreraId, planId } = req.params;
    const { materiaId, anio } = req.body;

    if (!materiaId) {
      return res.status(400).json({ message: 'materiaId es obligatorio' });
    }

    const plan = await PlanDeEstudio.findOne({
      where: { id: planId, carreraId },
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    const exists = await PlanMateria.findOne({ where: { planId, materiaId } });
    if (exists) {
      return res.status(409).json({ message: 'La materia ya está en el plan' });
    }

    await PlanMateria.create({
      planId: parseInt(planId),
      materiaId: parseInt(materiaId),
      ...(anio && { anio: parseInt(anio) }),
    });

    res.status(201).json({ message: 'Materia asignada al plan exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al asignar materia al plan',
      error: error.message,
    });
  }
};

export const removeMateriaFromPlan = async (req, res) => {
  try {
    const { carreraId, planId, materiaId } = req.params;

    const plan = await PlanDeEstudio.findOne({
      where: { id: planId, carreraId },
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }

    const deleted = await PlanMateria.destroy({ where: { planId, materiaId } });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: 'La materia no está asignada a este plan' });
    }

    res.json({ message: 'Materia removida del plan exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al remover materia del plan',
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
          through: { attributes: ['anio'] },
          attributes: ['id', 'nombre', 'tipo'],
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
    plan.Materia.forEach((materia) => {
      const anio = materia.PlanMateria?.anio || materia.anio;
      if (!materiasPorAnio[anio]) {
        materiasPorAnio[anio] = [];
      }
      materiasPorAnio[anio].push({
        id: materia.id,
        nombre: materia.nombre,
        anio,
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
        totalMaterias: plan.Materia.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el plan de estudio',
      error: error.message,
    });
  }
};
