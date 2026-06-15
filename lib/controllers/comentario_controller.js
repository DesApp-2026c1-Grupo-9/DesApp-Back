import db from '../models';
import crearNotificacion from '../utils/crearNotificacion';
const { Comentario, Usuario, Novedad } = db;

export const index = async (req, res) => {
  const { novedadId } = req.params;
  const { page = 1, limit = 20, usuarioId } = req.query;
  const userId = usuarioId ? parseInt(usuarioId) : null;

  const comentarios = await Comentario.findAndCountAll({
    where: { novedadId, comentarioPadreId: null },
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Comentario,
        as: 'respuestas',
        required: false,
        include: [
          {
            model: Usuario,
            as: 'autor',
            attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
            required: false,
          },
        ],
      },
    ],
    order: [['createdAt', 'ASC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  // Obtener todos los IDs para buscar likes
  const comentarioIds = comentarios.rows.map((c) => c.id);
  const respuestaIds = comentarios.rows
    .flatMap((c) => c.respuestas || [])
    .map((r) => r.id);
  const allIds = [...new Set([...comentarioIds, ...respuestaIds])];

  const allLikes = await db.ComentarioLike.findAll({
    where: { comentarioId: allIds },
    attributes: ['comentarioId', 'usuarioId'],
  });

  const comentariosConLikes = comentarios.rows.map((c) => {
    const data = c.toJSON();

    // Likes para el comentario principal
    const comentarioLikes = allLikes.filter((l) => l.comentarioId === c.id);
    const likesCount = comentarioLikes.length;
    const liked = userId
      ? comentarioLikes.some((l) => Number(l.usuarioId) === userId)
      : false;

    // Procesar respuestas
    if (data.respuestas) {
      data.respuestas = data.respuestas.map((r) => {
        const rLikes = allLikes.filter((l) => l.comentarioId === r.id);
        const rLikesCount = rLikes.length;
        const rLiked = userId
          ? rLikes.some((l) => Number(l.usuarioId) === userId)
          : false;

        return {
          ...r,
          likesCount: rLikesCount,
          liked: rLiked,
        };
      });
    }

    return {
      ...data,
      likesCount,
      liked,
    };
  });

  res.json({
    data: comentariosConLikes,
    total: comentarios.count,
    page: parseInt(page),
    totalPages: Math.ceil(comentarios.count / parseInt(limit)),
  });
};

export const create = async (req, res) => {
  const { novedadId } = req.params;
  const { contenido, usuarioId, comentarioPadreId } = req.body;

  if (!contenido || !contenido.trim()) {
    return res
      .status(400)
      .json({ message: 'El contenido del comentario es obligatorio' });
  }

  if (comentarioPadreId) {
    const parent = await Comentario.findByPk(comentarioPadreId);
    if (!parent || parent.novedadId !== parseInt(novedadId)) {
      return res.status(400).json({
        message: 'El comentario padre no es válido para esta novedad',
      });
    }
  }

  const nuevoComentario = await Comentario.create({
    contenido: contenido.trim(),
    novedadId: parseInt(novedadId),
    usuarioId: parseInt(usuarioId),
    comentarioPadreId: comentarioPadreId ? parseInt(comentarioPadreId) : null,
  });

  await Novedad.increment('comentariosCount', {
    where: { id: parseInt(novedadId) },
  });

  try {
    const actor = await Usuario.findByPk(parseInt(usuarioId), {
      attributes: ['nombre', 'apellido'],
    });
    const nombreActor = actor ? `${actor.nombre} ${actor.apellido}` : 'Alguien';

    if (comentarioPadreId) {
      const parent = await Comentario.findByPk(comentarioPadreId, {
        attributes: ['usuarioId'],
      });
      if (parent && Number(parent.usuarioId) !== Number(usuarioId)) {
        await crearNotificacion({
          usuarioId: parent.usuarioId,
          tipo: 'comentario_respuesta',
          titulo: `${nombreActor} respondió tu comentario`,
          actorId: parseInt(usuarioId),
          novedadId: parseInt(novedadId),
        });
      }
    } else {
      const novedad = await Novedad.findByPk(novedadId, {
        attributes: ['autorId'],
      });
      if (novedad && Number(novedad.autorId) !== Number(usuarioId)) {
        await crearNotificacion({
          usuarioId: novedad.autorId,
          tipo: 'novedad_comentario',
          titulo: `${nombreActor} comentó en tu publicación`,
          actorId: parseInt(usuarioId),
          novedadId: parseInt(novedadId),
        });
      }
    }
  } catch (err) {
    console.error('Error al notificar comentario:', err);
  }

  const comentarioConAutor = await Comentario.findByPk(nuevoComentario.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Comentario,
        as: 'respuestas',
        include: [
          {
            model: Usuario,
            as: 'autor',
            attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
          },
        ],
      },
    ],
  });

  res.status(201).json({ data: comentarioConAutor });
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { contenido, usuarioId } = req.body;

  if (!contenido || !contenido.trim()) {
    return res
      .status(400)
      .json({ message: 'El contenido del comentario es obligatorio' });
  }

  const comentario = await Comentario.findByPk(id);
  if (!comentario) {
    return res
      .status(404)
      .json({ message: `No se encontró el comentario con id ${id}` });
  }

  if (comentario.usuarioId !== parseInt(usuarioId)) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para editar este comentario' });
  }

  await comentario.update({
    contenido: contenido.trim(),
    editedAt: new Date(),
  });

  const comentarioConAutor = await Comentario.findByPk(comentario.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Comentario,
        as: 'respuestas',
        include: [
          {
            model: Usuario,
            as: 'autor',
            attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
          },
        ],
      },
    ],
  });

  res.json({ data: comentarioConAutor });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const { usuarioId } = req.body;

  const comentario = await Comentario.findByPk(id, {
    include: [{ model: Comentario, as: 'respuestas' }],
  });
  if (!comentario) {
    return res
      .status(404)
      .json({ message: `No se encontró el comentario con id ${id}` });
  }

  if (comentario.usuarioId !== parseInt(usuarioId)) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para eliminar este comentario' });
  }

  const respuestasCount = comentario.respuestas
    ? comentario.respuestas.length
    : 0;
  const totalComentarios = 1 + respuestasCount;

  await Comentario.destroy({ where: { comentarioPadreId: id } });
  await comentario.destroy();
  await Novedad.decrement('comentariosCount', {
    by: totalComentarios,
    where: { id: comentario.novedadId },
  });

  res.json({ message: 'Comentario eliminado exitosamente' });
};

export const like = async (req, res) => {
  const comentarioId = parseInt(req.params.id);
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res
      .status(400)
      .json({ message: 'Debe proporcionar un usuarioId válido' });
  }

  const comentario = await Comentario.findByPk(comentarioId);
  if (!comentario) {
    return res
      .status(404)
      .json({ message: `No se encontró el comentario con id ${comentarioId}` });
  }

  if (comentario.usuarioId === parseInt(usuarioId)) {
    return res
      .status(400)
      .json({ message: 'No puedes dar like a tu propio comentario' });
  }

  const existingLike = await db.ComentarioLike.findOne({
    where: { comentarioId, usuarioId: parseInt(usuarioId) },
  });

  if (existingLike) {
    return res.json({ data: { liked: true } });
  }

  await db.ComentarioLike.create({
    comentarioId,
    usuarioId: parseInt(usuarioId),
  });
  res.json({ data: { liked: true } });
};

export const unlike = async (req, res) => {
  const comentarioId = parseInt(req.params.id);
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res
      .status(400)
      .json({ message: 'Debe proporcionar un usuarioId válido' });
  }

  const comentario = await Comentario.findByPk(comentarioId);
  if (comentario && comentario.usuarioId === parseInt(usuarioId)) {
    return res
      .status(400)
      .json({ message: 'No puedes quitar like a tu propio comentario' });
  }

  const deleted = await db.ComentarioLike.destroy({
    where: { comentarioId, usuarioId: parseInt(usuarioId) },
  });

  if (!deleted) {
    return res
      .status(404)
      .json({ message: 'No se encontró tu like en este comentario' });
  }

  res.json({ data: { liked: false } });
};
