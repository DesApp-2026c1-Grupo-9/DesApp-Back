import Conexion from '../models/conexion';
import Usuario from '../models/usuario';
import { Op } from 'sequelize';

const getUsuarioId = (req) => {
  return (
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.body.usuarioId)
  );
};

export const index = async (req, res) => {
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para ver las conexiones',
    });
  }

  const conexiones = await Conexion.findAll({
    where: {
      estado: 'aceptada',
      [Op.or]: [{ usuarioId }, { contactoId: usuarioId }],
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: [
          'id',
          'nombre',
          'apellido',
          'avatarUrl',
          'email',
          'activo',
        ],
      },
      {
        model: Usuario,
        as: 'contacto',
        attributes: [
          'id',
          'nombre',
          'apellido',
          'avatarUrl',
          'email',
          'activo',
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const conexionesTransformadas = conexiones.map((c) => {
    const data = c.toJSON();
    const esUsuario = data.usuarioId === usuarioId;
    return {
      id: data.id,
      estado: data.estado,
      contacto: esUsuario ? data.contacto : data.usuario,
      fechaConexion: data.updatedAt || data.createdAt,
    };
  });

  res.json({ data: conexionesTransformadas });
};

export const getPendientes = async (req, res) => {
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message:
        'Debe proporcionar un usuarioId para ver las solicitudes pendientes',
    });
  }

  const pendientes = await Conexion.findAll({
    where: {
      contactoId: usuarioId,
      estado: 'pendiente',
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: [
          'id',
          'nombre',
          'apellido',
          'avatarUrl',
          'email',
          'activo',
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ data: pendientes.map((p) => p.toJSON()) });
};

export const invite = async (req, res) => {
  const { email } = req.body;
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para enviar una invitación',
    });
  }

  if (!email) {
    return res.status(400).json({
      message: 'Debe proporcionar un email para enviar la invitación',
    });
  }

  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const contacto = await Usuario.findOne({ where: { email } });
  if (!contacto) {
    return res.status(404).json({
      message: 'El email no corresponde a un usuario registrado',
    });
  }

  if (contacto.activo === false) {
    return res.status(400).json({
      message: 'No puedes enviar una invitación a un usuario inactivo',
    });
  }

  if (contacto.id === usuarioId) {
    return res.status(400).json({
      message: 'No puedes enviarte una invitación a ti mismo',
    });
  }

  const existente = await Conexion.findOne({
    where: {
      [Op.or]: [
        { usuarioId, contactoId: contacto.id },
        { usuarioId: contacto.id, contactoId: usuarioId },
      ],
    },
  });

  if (existente) {
    return res.status(400).json({
      message: 'Ya existe una conexión o solicitud con este usuario',
    });
  }

  const conexion = await Conexion.create({
    usuarioId,
    contactoId: contacto.id,
    estado: 'pendiente',
  });

  res.status(201).json({
    data: conexion.toJSON(),
    message: 'Invitación enviada exitosamente',
  });
};

export const respond = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para responder la invitación',
    });
  }

  if (!['aceptada', 'rechazada'].includes(estado)) {
    return res.status(400).json({
      message: 'El estado debe ser "aceptada" o "rechazada"',
    });
  }

  const conexion = await Conexion.findByPk(id);
  if (!conexion) {
    return res.status(404).json({ message: 'Invitación no encontrada' });
  }

  if (conexion.contactoId !== usuarioId) {
    return res.status(403).json({
      message: 'No tienes permiso para responder esta invitación',
    });
  }

  if (conexion.estado !== 'pendiente') {
    return res.status(400).json({
      message: 'Esta invitación ya fue respondida',
    });
  }

  conexion.estado = estado;
  await conexion.save();

  res.json({
    data: conexion.toJSON(),
    message: `Invitación ${estado} exitosamente`,
  });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const usuarioId = getUsuarioId(req);

  if (!usuarioId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para eliminar la conexión',
    });
  }

  const conexion = await Conexion.findByPk(id);
  if (!conexion) {
    return res.status(404).json({ message: 'Conexión no encontrada' });
  }

  if (conexion.usuarioId !== usuarioId && conexion.contactoId !== usuarioId) {
    return res.status(403).json({
      message: 'No tienes permiso para eliminar esta conexión',
    });
  }

  await conexion.destroy();

  res.json({ message: 'Conexión eliminada exitosamente' });
};
