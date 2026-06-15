import { Op } from 'sequelize';
import db from '../models';

const {
  Notificacion,
  Usuario,
  Materia,
  Sesion,
  Denuncia,
  Material,
  Novedad,
} = db;

const getUsuarioId = (req) => {
  return (
    parseInt(req.query.usuarioId) ||
    (req.user && req.user.id) ||
    parseInt(req.body.usuarioId)
  );
};

export const index = async (req, res) => {
  const usuarioId = getUsuarioId(req);
  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para ver las notificaciones',
    });
  }

  const { page = 1, limit = 20, noLeidas } = req.query;
  const where = { usuarioId };

  if (noLeidas === 'true') {
    where.leido = false;
  }

  const include = [
    {
      model: Usuario,
      as: 'actor',
      attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      required: false,
    },
    {
      model: Materia,
      as: 'materia',
      attributes: ['id', 'nombre'],
      required: false,
    },
    {
      model: Sesion,
      as: 'sesion',
      required: false,
    },
    {
      model: Denuncia,
      as: 'denuncia',
      required: false,
    },
    {
      model: Material,
      as: 'material',
      attributes: ['id', 'titulo', 'suspendido'],
      required: false,
    },
    {
      model: Novedad,
      as: 'novedad',
      attributes: ['id', 'titulo', 'tipo'],
      required: false,
    },
  ];

  const notificaciones = await Notificacion.findAndCountAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  });

  res.json({
    data: notificaciones.rows,
    total: notificaciones.count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(notificaciones.count / parseInt(limit, 10)),
  });
};

export const contador = async (req, res) => {
  const usuarioId = getUsuarioId(req);
  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para ver el contador',
    });
  }

  const noLeidas = await Notificacion.count({
    where: { usuarioId, leido: false },
  });

  res.json({ noLeidas });
};

export const marcarLeida = async (req, res) => {
  const { id } = req.params;
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId',
    });
  }

  const notificacion = await Notificacion.findOne({
    where: { id, usuarioId },
  });

  if (!notificacion) {
    return res.status(404).json({
      message: `No se encontró la notificación con id ${id}`,
    });
  }

  await notificacion.update({ leido: true });

  res.json({ data: notificacion.toJSON() });
};

export const marcarTodasLeidas = async (req, res) => {
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId',
    });
  }

  const actualizadas = await Notificacion.update(
    { leido: true },
    { where: { usuarioId, leido: false } }
  );

  res.json({
    message: 'Todas las notificaciones fueron marcadas como leídas',
    actualizadas: actualizadas[0],
  });
};
