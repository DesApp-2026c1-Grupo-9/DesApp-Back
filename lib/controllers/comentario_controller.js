import Comentario from '../models/comentario';
import Usuario from '../models/usuario';
import Novedad from '../models/novedad';

export const index = async (req, res) => {
  const { novedadId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const comentarios = await Comentario.findAndCountAll({
    where: { novedadId },
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
    ],
    order: [['createdAt', 'ASC']],
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  });

  res.json({
    data: comentarios.rows,
    total: comentarios.count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(comentarios.count / parseInt(limit, 10)),
  });
};

export const create = async (req, res) => {
  const { novedadId } = req.params;
  const { contenido, usuarioId } = req.body;

  if (!contenido || !contenido.trim()) {
    return res
      .status(400)
      .json({ message: 'El contenido del comentario es obligatorio' });
  }

  const nuevoComentario = await Comentario.create({
    contenido: contenido.trim(),
    novedadId: parseInt(novedadId, 10),
    usuarioId: parseInt(usuarioId, 10),
  });

  await Novedad.increment('comentariosCount', {
    where: { id: parseInt(novedadId, 10) },
  });

  const comentarioConAutor = await Comentario.findByPk(nuevoComentario.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
    ],
  });

  res.status(201).json({ data: comentarioConAutor });
};

export const update = async (req, res) => {
  const { id, novedadId } = req.params;
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

  if (comentario.novedadId !== parseInt(novedadId, 10)) {
    return res
      .status(400)
      .json({ message: 'El comentario no pertenece a esta novedad' });
  }

  if (comentario.usuarioId !== parseInt(usuarioId, 10)) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para editar este comentario' });
  }

  await comentario.update({ contenido: contenido.trim() });

  const comentarioConAutor = await Comentario.findByPk(comentario.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
    ],
  });

  res.json({ data: comentarioConAutor });
};

export const remove = async (req, res) => {
  const { id, novedadId } = req.params;
  const { usuarioId } = req.body;

  const comentario = await Comentario.findByPk(id);

  if (!comentario) {
    return res
      .status(404)
      .json({ message: `No se encontró el comentario con id ${id}` });
  }

  if (comentario.novedadId !== parseInt(novedadId, 10)) {
    return res
      .status(400)
      .json({ message: 'El comentario no pertenece a esta novedad' });
  }

  if (comentario.usuarioId !== parseInt(usuarioId, 10)) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para eliminar este comentario' });
  }

  await comentario.destroy();
  await Novedad.decrement('comentariosCount', {
    where: { id: parseInt(novedadId, 10) },
  });

  res.json({ message: 'Comentario eliminado exitosamente' });
};
