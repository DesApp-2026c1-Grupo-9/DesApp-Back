import Conexion from '../models/conexion';
import Usuario from '../models/usuario';
import Estudiante from '../models/estudiante';
import { Op } from 'sequelize';

const getEstudianteIdFromReq = (req) => {
  return (
    parseInt(req.query.estudianteId) ||
    req.user?.estudianteId ||
    parseInt(req.body.estudianteId)
  );
};

const usuarioFields = ['id', 'nombre', 'apellido', 'avatarUrl', 'email', 'activo'];

const estudianteInclude = {
  model: Estudiante,
  as: 'usuario',
  attributes: ['id'],
  include: [{ model: Usuario, as: 'Usuario', attributes: usuarioFields }],
};

const contactoInclude = {
  model: Estudiante,
  as: 'contacto',
  attributes: ['id'],
  include: [{ model: Usuario, as: 'Usuario', attributes: usuarioFields }],
};

export const index = async (req, res) => {
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para ver las conexiones',
    });
  }

  const conexiones = await Conexion.findAll({
    where: {
      estado: 'aceptada',
      [Op.or]: [{ usuarioId: estudianteId }, { contactoId: estudianteId }],
    },
    include: [estudianteInclude, contactoInclude],
    order: [['createdAt', 'DESC']],
  });

  const conexionesTransformadas = conexiones.map((c) => {
    const data = c.toJSON();
    const esUsuario = data.usuarioId === estudianteId;
    const contactoRaw = esUsuario ? data.contacto : data.usuario;
    const contacto = contactoRaw
      ? { ...contactoRaw.Usuario, estudianteId: contactoRaw.id }
      : null;
    return {
      id: data.id,
      estado: data.estado,
      contacto,
      fechaConexion: data.updatedAt || data.createdAt,
    };
  });

  res.json({ data: conexionesTransformadas });
};

export const getPendientes = async (req, res) => {
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId) {
    return res.status(400).json({
      message:
        'Debe proporcionar un estudianteId para ver las solicitudes pendientes',
    });
  }

  const pendientes = await Conexion.findAll({
    where: {
      contactoId: estudianteId,
      estado: 'pendiente',
    },
    include: [estudianteInclude],
    order: [['createdAt', 'DESC']],
  });

  const pendientesTransformadas = pendientes.map((p) => {
    const data = p.toJSON();
    if (data.usuario) {
      data.usuario = { ...data.usuario.Usuario, estudianteId: data.usuario.id };
    }
    return data;
  });

  res.json({ data: pendientesTransformadas });
};

export const invite = async (req, res) => {
  const { email } = req.body;
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para enviar una invitación',
    });
  }

  if (!email) {
    return res.status(400).json({
      message: 'Debe proporcionar un email para enviar la invitación',
    });
  }

  const estudiante = await Estudiante.findByPk(estudianteId, { include: [Usuario] });
  if (!estudiante) {
    return res.status(404).json({ message: 'Estudiante no encontrado' });
  }
  const usuarioId = estudiante.Usuario.id;
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

  const contactoEst = await Estudiante.findOne({ where: { usuarioId: contacto.id } });
  if (!contactoEst) {
    return res.status(400).json({
      message: 'El contacto no es un estudiante',
    });
  }

  const contactoEstudiante = contactoEst.id;

  const existente = await Conexion.findOne({
    where: {
      [Op.or]: [
        { usuarioId: estudianteId, contactoId: contactoEstudiante },
        { usuarioId: contactoEstudiante, contactoId: estudianteId },
      ],
    },
  });

  if (existente) {
    return res.status(400).json({
      message: 'Ya existe una conexión o solicitud con este usuario',
    });
  }

  const conexion = await Conexion.create({
    usuarioId: estudianteId,
    contactoId: contactoEstudiante,
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
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para responder la invitación',
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

  if (conexion.contactoId !== estudianteId) {
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
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para eliminar la conexión',
    });
  }

  const conexion = await Conexion.findByPk(id);
  if (!conexion) {
    return res.status(404).json({ message: 'Conexión no encontrada' });
  }

  if (conexion.usuarioId !== estudianteId && conexion.contactoId !== estudianteId) {
    return res.status(403).json({
      message: 'No tienes permiso para eliminar esta conexión',
    });
  }

  await conexion.destroy();

  res.json({ message: 'Conexión eliminada exitosamente' });
};
