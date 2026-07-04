import Sesion from '../models/sesion';
import SesionParticipante from '../models/sesionParticipante';
import Materia from '../models/materia';
import Usuario from '../models/usuario';
import PreferenciasEstudiante from '../models/preferenciasEstudiante';
import Conexion from '../models/conexion';
import EstudianteMateria from '../models/estudianteMateria';
import Estudiante from '../models/estudiante';
import Novedad from '../models/novedad';
import crearNotificacion from '../utils/crearNotificacion';
import { Op } from 'sequelize';

const getEstudianteIdFromReq = (req) => {
  return (
    parseInt(req.query.estudianteId) ||
    (req.user && req.user.estudianteId) ||
    parseInt(req.body.estudianteId)
  );
};

const puedeVerSesion = async (creadorId, currentEstudianteId) => {
  if (!creadorId) return true;
  if (!currentEstudianteId) return false;
  if (creadorId === currentEstudianteId) return true;

  const preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId: creadorId },
  });

  const perfilPublico = preferencias?.perfilPublico ?? true;
  if (perfilPublico) return true;

  const conexion = await Conexion.findOne({
    where: {
      [Op.or]: [
        { usuarioId: currentEstudianteId, contactoId: creadorId },
        { usuarioId: creadorId, contactoId: currentEstudianteId },
      ],
      estado: 'aceptada',
    },
  });

  return !!conexion;
};

const creadorInclude = {
  model: Estudiante,
  as: 'creador',
  attributes: ['id'],
  include: [
    { model: Usuario, attributes: ['id', 'nombre', 'apellido', 'avatarUrl'] },
  ],
};

const estudianteInclude = {
  model: Estudiante,
  as: 'estudiante',
  attributes: ['id'],
  include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
};

const flattenCreador = (json) => {
  if (json.creador && json.creador.Usuario) {
    json.creador = { ...json.creador.Usuario };
  }
  return json;
};

const flattenEstudiante = (json) => {
  if (json.estudiante && json.estudiante.Usuario) {
    json.estudiante = {
      ...json.estudiante.Usuario,
      estudianteId: json.estudiante.id,
    };
  }
  return json;
};

const flattenParticipantes = (json) => {
  if (json.participantes) {
    json.participantes = json.participantes.map((p) =>
      flattenEstudiante(flattenCreador(p))
    );
  }
  return json;
};

export const index = async (req, res) => {
  const { materiaId, fechaInicio, fechaFin, tipo } = req.query;
  const currentUserId = getEstudianteIdFromReq(req);
  const { page = 1, limit = 10 } = req.query;

  if (!currentUserId) {
    return res.status(400).json({ error: 'Se requiere estudianteId' });
  }

  const sesionWhere = {};
  if (materiaId) sesionWhere.materiaId = materiaId;
  if (tipo) sesionWhere.tipo = tipo;
  if (fechaInicio) {
    const start = new Date(fechaInicio);
    start.setHours(0, 0, 0, 0);
    sesionWhere.fechaHora = { ...sesionWhere.fechaHora, [Op.gte]: start };
  }
  if (fechaFin) {
    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);
    sesionWhere.fechaHora = { ...sesionWhere.fechaHora, [Op.lte]: end };
  }

  const sesiones = await Sesion.findAll({
    where: sesionWhere,
    include: [
      creadorInclude,
      { model: Materia, attributes: ['id', 'nombre'] },
      {
        model: SesionParticipante,
        as: 'participantes',
        required: false,
        include: [estudianteInclude],
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
  const paginatedSesiones = visibleSesiones
    .slice(0, parseInt(limit))
    .map((s) => flattenParticipantes(flattenCreador(s.toJSON())));

  res.json({
    data: paginatedSesiones,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
};

export const show = async (req, res) => {
  const { id } = req.params;
  const currentUserId = getEstudianteIdFromReq(req);

  const sesion = await Sesion.findByPk(id, {
    include: [
      creadorInclude,
      { model: Materia },
      {
        model: SesionParticipante,
        as: 'participantes',
        include: [estudianteInclude],
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

  res.json(flattenParticipantes(flattenCreador(sesion.toJSON())));
};

export const create = async (req, res) => {
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

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

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (new Date(fechaHora) < hoy) {
    return res
      .status(400)
      .json({ error: 'La fecha no puede ser anterior a hoy' });
  }

  const sesion = await Sesion.create({
    materiaId,
    creadorId: estudianteId,
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

  try {
    const preferencias = await PreferenciasEstudiante.findOne({
      where: { estudianteId },
    });
    if (!preferencias || preferencias.publicarSesiones !== false) {
      await Novedad.create({
        tipo: 'sesion_creada',
        titulo: `Creó una sesión de ${materia?.nombre || 'estudio'}`,
        contenido: tema,
        materiaId,
        sesionId: sesion.id,
        estudianteId,
        esAutomatica: true,
        visible: true,
        likesCount: 0,
      });
    }
  } catch (err) {
    console.error('Error al crear novedad de sesión:', err);
  }

  try {
    const creadorEst = await Estudiante.findByPk(estudianteId, {
      include: [{ model: Usuario, attributes: ['nombre', 'apellido'] }],
    });
    const creadorNombre = creadorEst?.Usuario
      ? `${creadorEst.Usuario.nombre} ${creadorEst.Usuario.apellido}`
      : `Usuario #${estudianteId}`;

    const conexiones = await Conexion.findAll({
      where: {
        [Op.or]: [{ usuarioId: estudianteId }, { contactoId: estudianteId }],
        estado: 'aceptada',
      },
    });

    const idsConexiones = conexiones
      .map((c) =>
        Number(c.usuarioId) === Number(estudianteId)
          ? c.contactoId
          : c.usuarioId
      )
      .filter((id) => Number(id) !== Number(estudianteId));

    for (const contactoId of idsConexiones) {
      await crearNotificacion({
        usuarioId: contactoId,
        tipo: 'sesion_creada_conexion',
        titulo: `${creadorNombre} creó una sesión de estudio: ${tema}`,
        actorId: estudianteId,
        materiaId,
        sesionId: sesion.id,
        sesionTema: tema,
      });
    }

    const cursando = await EstudianteMateria.findAll({
      where: { materiaId, estado: 'cursando' },
      include: [{ model: Estudiante, attributes: ['id'] }],
    });

    for (const em of cursando) {
      const eid = em.Estudiante?.id;
      if (eid && Number(eid) !== Number(estudianteId)) {
        await crearNotificacion({
          usuarioId: eid,
          tipo: 'sesion_creada_materia',
          titulo: `${creadorNombre} creó una sesión de estudio: ${tema}`,
          actorId: estudianteId,
          materiaId,
          sesionId: sesion.id,
          sesionTema: tema,
        });
      }
    }
  } catch (err) {
    console.error('Error al crear notificaciones de sesión:', err);
  }

  res.status(201).json(sesion);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

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
  if (sesion.creadorId !== estudianteId)
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

  if (fechaHora) {
    const fechaOriginal = new Date(sesion.fechaHora);
    fechaOriginal.setHours(0, 0, 0, 0);
    const fechaNueva = new Date(fechaHora);
    fechaNueva.setHours(0, 0, 0, 0);

    if (fechaOriginal.getTime() !== fechaNueva.getTime()) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaNueva < hoy) {
        return res
          .status(400)
          .json({ error: 'La fecha no puede ser anterior a hoy' });
      }
    }
  }

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
      creadorInclude,
      { model: Materia, attributes: ['id', 'nombre'] },
      {
        model: SesionParticipante,
        as: 'participantes',
        required: false,
        include: [estudianteInclude],
      },
    ],
  });

  res.json(flattenParticipantes(flattenCreador(updatedSesion.toJSON())));
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== estudianteId)
    return res.status(403).json({ error: 'No autorizado' });

  await sesion.update({ estado: 'cancelada' });

  try {
    const preferencias = await PreferenciasEstudiante.findOne({
      where: { estudianteId },
    });
    if (!preferencias || preferencias.publicarSesiones !== false) {
      const materia = await Materia.findByPk(sesion.materiaId);
      await Novedad.create({
        tipo: 'sesion_cancelada',
        titulo: `Canceló la sesión de ${materia?.nombre || 'estudio'}`,
        contenido: sesion.tema,
        materiaId: sesion.materiaId,
        sesionId: sesion.id,
        estudianteId,
        esAutomatica: true,
        visible: true,
        likesCount: 0,
      });
    }
  } catch (err) {
    console.error('Error al crear novedad de cancelación:', err);
  }

  res.json({ message: 'Sesion cancelada' });
};

export const inscribirse = async (req, res) => {
  const { id } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

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
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== estudianteId)
    return res.status(403).json({ error: 'No autorizado' });

  const participantes = await SesionParticipante.findAll({
    where: { sesionId: id },
    include: [estudianteInclude],
  });

  res.json(participantes.map((p) => flattenCreador(p.toJSON())));
};

export const aprobarParticipante = async (req, res) => {
  const { id, participanteId } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== estudianteId)
    return res.status(403).json({ error: 'No autorizado' });

  const participante = await SesionParticipante.findOne({
    where: { id: participanteId, sesionId: id },
    include: [estudianteInclude],
  });
  if (!participante)
    return res.status(404).json({ error: 'Participante no encontrado' });

  await participante.update({ estado: 'aprobado' });
  res.json(flattenCreador(participante.toJSON()));
};

export const rechazarParticipante = async (req, res) => {
  const { id, participanteId } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

  const sesion = await Sesion.findByPk(id);
  if (!sesion) return res.status(404).json({ error: 'Sesion no encontrada' });
  if (sesion.creadorId !== estudianteId)
    return res.status(403).json({ error: 'No autorizado' });

  const participante = await SesionParticipante.findOne({
    where: { id: participanteId, sesionId: id },
    include: [estudianteInclude],
  });
  if (!participante)
    return res.status(404).json({ error: 'Participante no encontrado' });

  await participante.update({ estado: 'rechazado' });
  res.json(flattenCreador(participante.toJSON()));
};

export const leaveSesion = async (req, res) => {
  const { id, participanteId } = req.params;
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId)
    return res.status(400).json({ error: 'Se requiere estudianteId' });

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
