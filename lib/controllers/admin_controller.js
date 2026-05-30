import db from '../models/index.js';
import { Op } from 'sequelize';
import { verificarSuspensionAutomatica } from './denuncia_controller.js';

const {
  Denuncia,
  MotivoDenuncia,
  Material,
  Usuario,
  Materia,
  MaterialTag,
  ConfiguracionModeracion,
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

const denunciaInclude = [
  {
    model: Material,
    as: 'material',
    attributes: [
      'id',
      'titulo',
      'descripcion',
      'tipo',
      'url',
      'nombreArchivo',
      'tamanho',
      'tipoLink',
      'suspendido',
      'suspendidoEn',
      'revocado',
      'revocadoEn',
      'materiaId',
      'creadorId',
      'fecha',
    ],
    include: [
      { model: Materia, as: 'materia', attributes: ['id', 'nombre', 'codigo'] },
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id', 'nombre', 'apellido', 'email'],
      },
      {
        model: MaterialTag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'nombre'],
      },
    ],
  },
  {
    model: Usuario,
    as: 'denunciante',
    attributes: ['id', 'nombre', 'apellido', 'email'],
  },
  {
    model: MotivoDenuncia,
    as: 'motivo',
    attributes: ['id', 'nombre', 'descripcion'],
  },
  { model: Usuario, as: 'moderador', attributes: ['id', 'nombre', 'apellido'] },
];

export const listarDenuncias = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const {
      estado,
      materialId,
      motivoId,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      dir = 'DESC',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (estado) where.estado = estado;
    if (materialId) where.materialId = parseInt(materialId);
    if (motivoId) where.motivoId = parseInt(motivoId);

    const sortField = [
      'createdAt',
      'updatedAt',
      'estado',
      'fechaModeracion',
    ].includes(sort)
      ? sort
      : 'createdAt';
    const sortDir = dir === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: denuncias } = await Denuncia.findAndCountAll({
      where,
      include: denunciaInclude,
      order: [[sortField, sortDir]],
      offset,
      limit: limitNum,
    });

    res.json({
      data: denuncias,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al listar denuncias', error: error.message });
  }
};

export const obtenerDenuncia = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const denuncia = await Denuncia.findByPk(req.params.id, {
      include: denunciaInclude,
    });

    if (!denuncia) {
      return res
        .status(404)
        .json({
          message: `No se encontró la denuncia con id ${req.params.id}`,
        });
    }

    res.json({ data: denuncia });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener la denuncia', error: error.message });
  }
};

export const confirmarDenuncia = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const denuncia = await Denuncia.findByPk(req.params.id);
    if (!denuncia) {
      return res
        .status(404)
        .json({
          message: `No se encontró la denuncia con id ${req.params.id}`,
        });
    }

    if (denuncia.estado !== 'pendiente') {
      return res
        .status(400)
        .json({
          message: `La denuncia ya fue ${
            denuncia.estado === 'confirmada' ? 'confirmada' : 'rechazada'
          } anteriormente`,
        });
    }

    await denuncia.update({
      estado: 'confirmada',
      moderadorId: req.user.id,
      fechaModeracion: new Date(),
    });

    const suspendido = await verificarSuspensionAutomatica(denuncia.materialId);

    const denunciaActualizada = await Denuncia.findByPk(denuncia.id, {
      include: denunciaInclude,
    });

    res.json({
      message: suspendido
        ? 'Denuncia confirmada. El material ha sido suspendido.'
        : 'Denuncia confirmada exitosamente',
      data: denunciaActualizada,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al confirmar la denuncia',
        error: error.message,
      });
  }
};

export const rechazarDenuncia = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const denuncia = await Denuncia.findByPk(req.params.id);
    if (!denuncia) {
      return res
        .status(404)
        .json({
          message: `No se encontró la denuncia con id ${req.params.id}`,
        });
    }

    if (denuncia.estado !== 'pendiente') {
      return res
        .status(400)
        .json({
          message: `La denuncia ya fue ${
            denuncia.estado === 'confirmada' ? 'confirmada' : 'rechazada'
          } anteriormente`,
        });
    }

    await denuncia.update({
      estado: 'rechazada',
      moderadorId: req.user.id,
      fechaModeracion: new Date(),
    });

    await verificarSuspensionAutomatica(denuncia.materialId);

    const denunciaActualizada = await Denuncia.findByPk(denuncia.id, {
      include: denunciaInclude,
    });

    res.json({ message: 'Denuncia rechazada', data: denunciaActualizada });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al rechazar la denuncia', error: error.message });
  }
};

export const listarMotivos = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { soloActivos } = req.query;
    const where = {};
    if (soloActivos === 'true') where.activo = true;

    const motivos = await MotivoDenuncia.findAll({
      where,
      order: [['nombre', 'ASC']],
    });

    res.json({ data: motivos });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al listar motivos de denuncia',
        error: error.message,
      });
  }
};

export const crearMotivo = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res
        .status(400)
        .json({ message: 'El nombre del motivo es obligatorio' });
    }

    const existente = await MotivoDenuncia.findOne({
      where: { nombre: nombre.trim() },
    });
    if (existente) {
      return res
        .status(409)
        .json({
          message: `Ya existe un motivo con el nombre "${nombre.trim()}"`,
        });
    }

    const motivo = await MotivoDenuncia.create({
      nombre: nombre.trim(),
      descripcion: descripcion || null,
    });

    res
      .status(201)
      .json({ message: 'Motivo creado exitosamente', data: motivo });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al crear el motivo', error: error.message });
  }
};

export const actualizarMotivo = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const motivo = await MotivoDenuncia.findByPk(req.params.id);
    if (!motivo) {
      return res
        .status(404)
        .json({ message: `No se encontró el motivo con id ${req.params.id}` });
    }

    const { nombre, descripcion, activo } = req.body;

    if (nombre && nombre.trim() !== motivo.nombre) {
      const existente = await MotivoDenuncia.findOne({
        where: { nombre: nombre.trim() },
      });
      if (existente) {
        return res
          .status(409)
          .json({
            message: `Ya existe un motivo con el nombre "${nombre.trim()}"`,
          });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (activo !== undefined) updateData.activo = activo;

    await motivo.update(updateData);
    res.json({ message: 'Motivo actualizado exitosamente', data: motivo });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al actualizar el motivo', error: error.message });
  }
};

export const eliminarMotivo = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const motivo = await MotivoDenuncia.findByPk(req.params.id);
    if (!motivo) {
      return res
        .status(404)
        .json({ message: `No se encontró el motivo con id ${req.params.id}` });
    }

    const denunciasAsociadas = await Denuncia.count({
      where: { motivoId: motivo.id },
    });
    if (denunciasAsociadas > 0) {
      await motivo.update({ activo: false });
      return res.json({
        message: 'Motivo desactivado porque tiene denuncias asociadas',
        data: motivo,
      });
    }

    await motivo.destroy();
    res.json({ message: 'Motivo eliminado exitosamente' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al eliminar el motivo', error: error.message });
  }
};

export const obtenerConfiguracion = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const configs = await ConfiguracionModeracion.findAll({
      order: [['id', 'ASC']],
    });
    res.json({ data: configs });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al obtener configuración',
        error: error.message,
      });
  }
};

export const actualizarConfiguracion = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { id, valor } = req.body;

    if (!id || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Se requiere id y valor' });
    }

    const config = await ConfiguracionModeracion.findByPk(id);
    if (!config) {
      return res
        .status(404)
        .json({ message: `No se encontró configuración con id ${id}` });
    }

    const valorNum = parseInt(valor);
    if (isNaN(valorNum) || valorNum < 1) {
      return res
        .status(400)
        .json({ message: 'El valor debe ser un número entero positivo' });
    }

    await config.update({ valor: valorNum });
    res.json({
      message: 'Configuración actualizada exitosamente',
      data: config,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar configuración',
        error: error.message,
      });
  }
};

export const restaurarMaterial = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ message: `No se encontró el material con id ${req.params.id}` });
    }

    if (!material.suspendido) {
      return res
        .status(400)
        .json({ message: 'El material no está suspendido' });
    }

    await Denuncia.update(
      {
        estado: 'revocada',
        moderadorId: req.user.id,
        fechaModeracion: new Date(),
      },
      {
        where: {
          materialId: material.id,
          estado: { [Op.in]: ['pendiente', 'confirmada'] },
        },
      }
    );

    await material.update({ suspendido: false, suspendidoEn: null, revocado: true, revocadoEn: new Date() });

    res.json({ message: 'Material restaurado. Denuncias revocadas.' });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Error al restaurar el material',
        error: error.message,
      });
  }
};
