import { Op } from 'sequelize';
import db from '../models/index.js';
import { i18nOrder } from '../utils/sort.js';
const { Materia, PlanDeEstudio, Carrera, Correlatividades, PlanMateria } = db;

export const index = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'nombre',
      dir = 'asc',
      search = '',
      tipo,
      carreraId,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const parsedLimit = parseInt(limit);
    const hasPagination = parsedLimit !== 0;
    const limitNum = hasPagination
      ? Math.max(1, Math.min(100, parsedLimit || 10))
      : null;
    const offset = hasPagination ? (pageNum - 1) * limitNum : 0;

    const where = {};
    if (tipo && tipo !== 'todos') where.tipo = tipo;
    if (search.trim()) where.nombre = { [Op.iLike]: `%${search.trim()}%` };

    const includeClause = [
      {
        model: Carrera,
        through: { attributes: [] },
        attributes: ['id', 'nombre'],
      },
    ];

    if (carreraId) {
      includeClause[0].where = { id: parseInt(carreraId) };
    }

    const orderMap = { nombre: 'nombre', tipo: 'tipo' };
    const sortField = orderMap[sort] || 'nombre';

    const queryOptions = {
      where,
      distinct: true,
      include: includeClause,
      order: [i18nOrder('Materia', sortField, dir)],
    };
    if (hasPagination) {
      queryOptions.offset = offset;
      queryOptions.limit = limitNum;
    }

    const { count, rows: materias } = await Materia.findAndCountAll(
      queryOptions
    );

    res.json({
      data: materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
        tipo: materia.tipo,
        cargaHoraria: materia.cargaHoraria,
        carreras: materia.Carreras || [],
      })),
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      limit: limitNum,
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
          model: Carrera,
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'titulo'],
        },
        {
          model: Materia,
          as: 'Prerrequisitos',
          through: { attributes: [] },
          attributes: ['id', 'nombre'],
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
      attributes: ['id', 'nombre'],
    });

    res.json({
      data: {
        id: materia.id,
        nombre: materia.nombre,
        tipo: materia.tipo,
        cargaHoraria: materia.cargaHoraria,
        carreras: materia.Carreras || [],
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
          attributes: ['id', 'nombre', 'tipo'],
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
          attributes: ['id', 'nombre', 'tipo'],
        },
      ],
    });

    res.json({
      data: {
        materia: {
          id: materia.id,
          nombre: materia.nombre,
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
    const { nombre, tipo, planId, cargaHoraria } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({
        message: 'El nombre y tipo son obligatorios',
      });
    }

    if (!['anual', 'cuatrimestral'].includes(tipo)) {
      return res.status(400).json({
        message: 'El tipo debe ser "anual" o "cuatrimestral"',
      });
    }

    const ch = parseInt(cargaHoraria);
    if (!ch || ch < 1) {
      return res.status(400).json({
        message: 'La carga horaria es obligatoria y debe ser mayor a 0',
      });
    }

    const materia = await Materia.create({
      nombre,
      tipo,
      cargaHoraria: ch,
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
    const { nombre, tipo, cargaHoraria } = req.body;

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

    if (
      cargaHoraria !== undefined &&
      cargaHoraria !== null &&
      cargaHoraria !== ''
    ) {
      const ch = parseInt(cargaHoraria);
      if (!ch || ch < 1) {
        return res.status(400).json({
          message: 'La carga horaria debe ser mayor a 0',
        });
      }
    }

    await materia.update({
      ...(nombre && { nombre }),
      ...(tipo && { tipo }),
      ...(cargaHoraria !== undefined &&
        cargaHoraria !== null &&
        cargaHoraria !== '' && { cargaHoraria: parseInt(cargaHoraria) }),
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
