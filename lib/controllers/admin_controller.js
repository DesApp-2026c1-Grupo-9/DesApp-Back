import db from '../models/index.js';
import { Op } from 'sequelize';
import { verificarSuspensionAutomatica } from './denuncia_controller.js';
import crearNotificacion from '../utils/crearNotificacion';
import { getAdministrador } from '../middleware/auth.js';

const {
  Denuncia,
  MotivoDenuncia,
  Material,
  Usuario,
  Estudiante,
  Administrador,
  Materia,
  MaterialTag,
  ConfiguracionModeracion,
  Sesion,
} = db;

const requireAdmin = (req, res) => {
  if (!req.user || req.user.rol !== 'administrador') {
    res.status(403).json({
      message: 'Solo los administradores pueden realizar esta operación',
    });
    return false;
  }
  if (!req.user.activo) {
    res.status(403).json({
      message: 'Cuenta desactivada. No puede realizar esta operación.',
    });
    return false;
  }
  return true;
};

const getAdminId = async (req) => {
  const admin = await getAdministrador(req);
  return admin ? admin.id : null;
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
      'estudianteId',
      'fecha',
    ],
    include: [
      { model: Materia, as: 'materia', attributes: ['id', 'nombre', 'codigo'] },
      {
        model: Estudiante,
        as: 'creador',
        attributes: ['id'],
        include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] }],
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
    model: Estudiante,
    as: 'denunciante',
    attributes: ['id'],
    include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido', 'email'] }],
  },
  {
    model: MotivoDenuncia,
    as: 'motivo',
    attributes: ['id', 'nombre', 'descripcion'],
  },
  {
    model: Administrador,
    as: 'moderador',
    attributes: ['id'],
    include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
  },
];

export const listarDenuncias = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const {
      estado,
      materialId,
      motivoId,
      materialSearch,
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

    let include = denunciaInclude;
    if (materialSearch && materialSearch.trim()) {
      include = denunciaInclude.map((inc) => {
        if (inc.as === 'material') {
          return {
            ...inc,
            where: { titulo: { [Op.iLike]: `%${materialSearch.trim()}%` } },
          };
        }
        return inc;
      });
    }

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
      include,
      order: [[sortField, sortDir]],
      offset,
      limit: limitNum,
      distinct: true,
      col: 'id',
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
      return res.status(404).json({
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
      return res.status(404).json({
        message: `No se encontró la denuncia con id ${req.params.id}`,
      });
    }

    if (denuncia.estado !== 'pendiente') {
      return res.status(400).json({
        message: `La denuncia ya fue ${
          denuncia.estado === 'confirmada' ? 'confirmada' : 'rechazada'
        } anteriormente`,
      });
    }

    const adminId = await getAdminId(req);

    await denuncia.update({
      estado: 'confirmada',
      moderadorId: adminId,
      fechaModeracion: new Date(),
    });

    const suspendido = await verificarSuspensionAutomatica(denuncia.materialId);

    const denunciaActualizada = await Denuncia.findByPk(denuncia.id, {
      include: denunciaInclude,
    });

    res.json({
      message: 'Denuncia confirmada',
      data: denunciaActualizada,
    });
  } catch (error) {
    res.status(500).json({
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
      return res.status(404).json({
        message: `No se encontró la denuncia con id ${req.params.id}`,
      });
    }

    if (denuncia.estado !== 'pendiente') {
      return res.status(400).json({
        message: `La denuncia ya fue ${
          denuncia.estado === 'confirmada' ? 'confirmada' : 'rechazada'
        } anteriormente`,
      });
    }

    const adminId = await getAdminId(req);

    await denuncia.update({
      estado: 'rechazada',
      moderadorId: adminId,
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
    res.status(500).json({
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
      return res.status(409).json({
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
        return res.status(409).json({
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
    res.status(500).json({
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
    res.status(500).json({
      message: 'Error al actualizar configuración',
      error: error.message,
    });
  }
};

export const obtenerDashboard = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);

    const [
      totalUsuarios,
      totalMateriales,
      denunciasPendientes,
      materialesSuspendidos,
      usuariosHoy,
      usuariosSemana,
      totalSesiones,
      ultimasDenuncias,
      materialesSuspendidosList,
      ultimosMateriales,
      ultimasDenunciasActividad,
    ] = await Promise.all([
      Usuario.count(),
      Material.count(),
      Denuncia.count({ where: { estado: 'pendiente' } }),
      Material.count({ where: { suspendido: true } }),
      Usuario.count({ where: { createdAt: { [Op.gte]: hoy } } }),
      Usuario.count({ where: { createdAt: { [Op.gte]: semanaAtras } } }),
      Sesion.count(),
      Denuncia.findAll({
        where: { estado: 'pendiente' },
        include: [
          { model: Material, as: 'material', attributes: ['id', 'titulo'] },
          {
            model: Estudiante,
            as: 'denunciante',
            attributes: ['id'],
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
          },
          { model: MotivoDenuncia, as: 'motivo', attributes: ['id', 'nombre'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Material.findAll({
        where: { suspendido: true },
        include: [
          {
            model: Estudiante,
            as: 'creador',
            attributes: ['id'],
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
          },
          { model: Materia, as: 'materia', attributes: ['id', 'nombre'] },
        ],
        order: [['suspendidoEn', 'DESC']],
        limit: 5,
      }),
      Material.findAll({
        attributes: ['id', 'titulo', 'tipo', 'createdAt', 'estudianteId'],
        include: [
          {
            model: Estudiante,
            as: 'creador',
            attributes: ['id'],
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Denuncia.findAll({
        attributes: [
          'id',
          'estado',
          'createdAt',
          'materialId',
          'denuncianteId',
        ],
        include: [
          { model: Material, as: 'material', attributes: ['id', 'titulo'] },
          {
            model: Estudiante,
            as: 'denunciante',
            attributes: ['id'],
            include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    const actividadReciente = [
      ...ultimosMateriales.map((m) => ({
        tipo: 'material_creado',
        descripcion: `"${m.titulo}"`,
        usuario: m.creador?.Usuario
          ? `${m.creador.Usuario.nombre} ${m.creador.Usuario.apellido}`
          : 'Desconocido',
        fecha: m.createdAt,
      })),
      ...ultimasDenunciasActividad.map((d) => ({
        tipo: 'denuncia_creada',
        descripcion: `Denuncia #${d.id} sobre "${d.material?.titulo}"`,
        usuario: d.denunciante
          ? `${d.denunciante.nombre} ${d.denunciante.apellido}`
          : 'Desconocido',
        fecha: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 8);

    res.json({
      data: {
        stats: {
          totalUsuarios,
          totalMateriales,
          denunciasPendientes,
          materialesSuspendidos,
          usuariosHoy,
          usuariosSemana,
          totalSesiones,
        },
        ultimasDenuncias,
        materialesSuspendidos: materialesSuspendidosList,
        actividadReciente,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener dashboard', error: error.message });
  }
};

export const restaurarMaterial = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({
        message: `No se encontró el material con id ${req.params.id}`,
      });
    }

    if (!material.suspendido) {
      return res
        .status(400)
        .json({ message: 'El material no está suspendido' });
    }

    const adminId = await getAdminId(req);

    await Denuncia.update(
      {
        estado: 'revocada',
        moderadorId: adminId,
        fechaModeracion: new Date(),
      },
      {
        where: {
          materialId: material.id,
          estado: { [Op.in]: ['pendiente', 'confirmada'] },
        },
      }
    );

    await material.update({
      suspendido: false,
      suspendidoEn: null,
      revocado: true,
      revocadoEn: new Date(),
    });

    try {
      if (material.estudianteId) {
        await crearNotificacion({
          usuarioId: material.estudianteId,
          tipo: 'material_revocado',
          titulo: `Tu material "${material.titulo}" fue restaurado`,
          materialId: material.id,
        });
      }
    } catch (err) {
      console.error('Error al notificar restauración:', err);
    }

    res.json({ message: 'Material restaurado. Denuncias revocadas.' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al restaurar el material',
      error: error.message,
    });
  }
};
