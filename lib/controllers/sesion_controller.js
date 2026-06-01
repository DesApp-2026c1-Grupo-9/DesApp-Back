import Sesion from '../models/sesion';
import SesionParticipante from '../models/sesionParticipante';
import Materia from '../models/materia';
import Usuario from '../models/usuario';
import PreferenciasEstudiante from '../models/preferenciasEstudiante';
import Conexion from '../models/conexion';
import { Op } from 'sequelize';

const getUsuarioId = (req) => {
  return (
    parseInt(req.query.usuarioId) ||
    (req.user && req.user.id) ||
    parseInt(req.body.usuarioId)
  );
};

const puedeVerSesion = async (creadorId, currentUserId) => {
  if (!creadorId) return true;
  if (!currentUserId) return false;
  if (creadorId === currentUserId) return true;

  const preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId: creadorId },
  });

  const perfilPublico = preferencias?.perfilPublico ?? true;
  if (perfilPublico) return true;

  const conexion = await Conexion.findOne({
    where: {
      [Op.or]: [
        { usuarioId: currentUserId, contactoId: creadorId },
        { usuarioId: creadorId, contactoId: currentUserId },
      ],
      estado: 'aceptada',
    },
  });

  return !!conexion;
};

export const index = async (req, res) => {
  const { materiaId, fecha, tipo } = req.query;
  const currentUserId = getUsuarioId(req);
  const { page = 1, limit = 10 } = req.query;

  if (!currentUserId) {
    return res.status(400).json({ error: 'Se requiere usuarioId' });
  }

  const sesionWhere = { estado: 'activa' };
  if (materiaId) sesionWhere.materiaId = materiaId;
  if (tipo) sesionWhere.tipo = tipo;
  if (fecha) {
    const start = new Date(fecha);
    const end = new Date(fecha);
    end.setDate(end.getDate() + 1);
    sesionWhere.fechaHora = { [Op.gte]: start, [Op.lt]: end };
  }

  const sesiones = await Sesion.findAll({
    where: sesionWhere,
    include: [
      {
        model: Usuario,
        as: 'creador',
        required: false,
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      { model: Materia, attributes: ['id', 'nombre'] },
      {
        model: SesionParticipante,
        as: 'participantes',
        required: false,
        include: [
          {
            model: Usuario,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido'],
          },
        ],
      },
    ],
    order: [['fechaHora', 'ASC']],
    limit: parseInt(limit) * 2,
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  const visibleSesiones = [];
  for (const sesion of sesiones) {
    if (await puedeVerSesion(sesion.creadorId, currentUserId)) {
      visibleSesiones.push(sesion);
    }
  }

  const total = visibleSesiones.length;
  const paginatedSesiones = visibleSesiones.slice(0, parseInt(limit));

  res.json({
    data: paginatedSesiones,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
};

export const show = async (req, res) => {
  const { id } = req.params;
  const currentUserId = getUsuarioId(req);

  const sesion = await Sesion.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: 'creador',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      { model: Materia },
      {
        model: SesionParticipante,
        as: 'participantes',
        include: [
          {
            model: Usuario,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido'],
          },
        ],
      },
    ],
  });

  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });

  const puedeVer = await puedeVerSesion(sesion.creadorId, currentUserId);
  if (!puedeVer) {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para ver esta sesión' });
  }

  res.json(sesion);
};

export const create = async (req, res) => {
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const {
    materiaId,
    tema,
    tipo,
    link,
    ubicacion,
    fechaHora,
    duracion,
    cupos,
    descripcion,
    necesidadAprobacion,
  } = req.body;

  if (tipo === 'virtual' && !link)
    return res
      .status(400)
      .json({ error: 'Link requerido para sesiones virtuales' });
  if (tipo === 'presencial' && !ubicacion)
    return res
      .status(400)
      .json({ error: 'Ubicacion requerida para sesiones presenciales' });

  const materia = await Materia.findByPk(materiaId);
  if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });

  const sesion = await Sesion.create({
    materiaId,
    creadorId,
    tema,
    tipo,
    link,
    ubicacion,
    fechaHora,
    duracion,
    cupos,
    descripcion,
    necesidadAprobacion: necesidadAprobacion || false,
  });

  res.status(201).json(sesion);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const {
    tema,
    tipo,
    link,
    ubicacion,
    fechaHora,
    duracion,
    cupos,
    descripcion,
    necesidadAprobacion,
  } = req.body;

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== creadorId)
    return res.status(403).json({ error: 'No autorizado' });
  if (sesion.estado === 'cancelada')
    return res
      .status(400)
      .json({ error: 'No se puede editar una sesion cancelada' });

  if (tipo === 'virtual' && !link)
    return res
      .status(400)
      .json({ error: 'Link requerido para sesiones virtuales' });
  if (tipo === 'presencial' && !ubicacion)
    return res
      .status(400)
      .json({ error: 'Ubicacion requerida para sesiones presenciales' });

  await sesion.update({
    tema,
    tipo,
    link,
    ubicacion,
    fechaHora,
    duracion,
    cupos,
    descripcion,
    necesidadAprobacion,
  });

  const updatedSesion = await Sesion.findByPk(id, {
    include: [
      {
        model: Usuario,
        as: 'creador',
        required: false,
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      { model: Materia, attributes: ['id', 'nombre'] },
      {
        model: SesionParticipante,
        as: 'participantes',
        required: false,
        include: [
          {
            model: Usuario,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido'],
          },
        ],
      },
    ],
  });

  res.json(updatedSesion);
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== creadorId)
    return res.status(403).json({ error: 'No autorizado' });

  await sesion.update({ estado: 'cancelada' });
  res.json({ message: 'Sesion cancelada' });
};

export const inscribirse = async (req, res) => {
  const { id } = req.params;
  const estudianteId = getUsuarioId(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id, {
    include: [
      {
        model: SesionParticipante,
        as: 'participantes',
        where: { estado: 'aprobado' },
        required: false,
      },
    ],
  });
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.estado !== 'activa')
    return res.status(400).json({ error: 'Sesion no activa' });

  const puedeVer = await puedeVerSesion(sesion.creadorId, estudianteId);
  if (!puedeVer) {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para inscribirte a esta sesión' });
  }

  const existing = await SesionParticipante.findOne({
    where: { sesionId: id, estudianteId },
  });
  if (existing)
    return res.status(400).json({ error: 'Ya estas inscrito en esta sesion' });

  if (sesion.cupos && sesion.participantes.length >= sesion.cupos) {
    return res.status(400).json({ error: 'No hay cupos disponibles' });
  }

  const estado = sesion.necesidadAprobacion ? 'pendiente' : 'aprobado';
  const participante = await SesionParticipante.create({
    sesionId: id,
    estudianteId,
    estado,
  });

  res.status(201).json(participante);
};

export const getParticipantes = async (req, res) => {
  const { id } = req.params;
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== creadorId)
    return res.status(403).json({ error: 'No autorizado' });

  const participantes = await SesionParticipante.findAll({
    where: { sesionId: id },
    include: [
      {
        model: Usuario,
        as: 'estudiante',
        attributes: ['id', 'nombre', 'apellido', 'email'],
      },
    ],
  });

  res.json(participantes);
};

export const aprobarParticipante = async (req, res) => {
  const { id, participanteId } = req.params;
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== creadorId)
    return res.status(403).json({ error: 'No autorizado' });

  const participante = await SesionParticipante.findOne({
    where: { id: participanteId, sesionId: id },
    include: [
      {
        model: Usuario,
        as: 'estudiante',
        attributes: ['id', 'nombre', 'apellido'],
      },
    ],
  });
  if (!participante)
    return res.status(404).json({ error: 'Participante no encontrado' });

  await participante.update({ estado: 'aprobado' });
  res.json(participante);
};

export const rechazarParticipante = async (req, res) => {
  const { id, participanteId } = req.params;
  const creadorId = getUsuarioId(req);
  if (!creadorId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== creadorId)
    return res.status(403).json({ error: 'No autorizado' });

  const participante = await SesionParticipante.findOne({
    where: { id: participanteId, sesionId: id },
    include: [
      {
        model: Usuario,
        as: 'estudiante',
        attributes: ['id', 'nombre', 'apellido'],
      },
    ],
  });
  if (!participante)
    return res.status(404).json({ error: 'Participante no encontrado' });

  await participante.update({ estado: 'rechazado' });
  res.json(participante);
};

export const leaveSesion = async (req, res) => {
  const { id, participanteId } = req.params;
  const estudianteId = getUsuarioId(req);

  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere usuarioId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });

  const participante = await SesionParticipante.findOne({
    where: { id: participanteId, sesionId: id },
  });
  if (!participante)
    return res.status(404).json({ error: 'Participante no encontrado' });

  if (participante.estudianteId !== estudianteId) {
    return res
      .status(403)
      .json({ error: 'No autorizado para abandonar esta inscripcion' });
  }

  const deletedParticipante = participante;
  await participante.destroy();

  res.json(deletedParticipante);
};
