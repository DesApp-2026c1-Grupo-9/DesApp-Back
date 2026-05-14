import { Op } from 'sequelize';
import Novedad from '../models/novedad';
import Usuario from '../models/usuario';
import Materia from '../models/materia';
import PreferenciasEstudiante from '../models/preferenciasEstudiante';
import Like from '../models/like';
import Conexion from '../models/conexion';

export const index = async (req, res) => {
  const { page = 1, limit = 20, tipo, autorId, feed } = req.query;

  const where = { visible: true };

  if (tipo) {
    where.tipo = tipo;
  }

  if (autorId) {
    where.autorId = autorId;
  }

  const include = [
    {
      model: Usuario,
      as: 'autor',
      attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
    },
    {
      model: Materia,
      as: 'materia',
      attributes: ['id', 'nombre'],
      required: false,
    },
    {
      model: Like,
      as: 'likes',
      attributes: ['usuarioId'],
      required: false,
    },
  ];

  if (feed === 'contactos') {
    const userId = req.query.usuarioId || req.user?.id;
    if (!userId) {
      return res.status(400).json({
        message: 'Debe proporcionar un usuarioId para ver el feed de contactos',
      });
    }

    const conexiones = await Conexion.findAll({
      where: {
        [Op.or]: [{ usuarioId: userId }, { contactoId: userId }],
        estado: 'aceptada',
      },
    });

    const contactosIds = conexiones.map((c) =>
      Number(c.usuarioId) === Number(userId) ? c.contactoId : c.usuarioId
    );
    contactosIds.push(userId);

    where.autorId = contactosIds;
  }

  const novedades = await Novedad.findAndCountAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  });

  const usuarioId =
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.query.autorId);
  const novedadesConLikes = novedades.rows.map((n) => {
    const data = n.toJSON();
    const likesCount = data.likes ? data.likes.length : 0;
    const liked = usuarioId
      ? data.likes?.some((l) => Number(l.usuarioId) === Number(usuarioId)) ||
        false
      : false;
    return {
      ...data,
      likesCount,
      likes: data.likes ? data.likes.map((l) => Number(l.usuarioId)) : [],
      liked,
    };
  });

  res.json({
    data: novedadesConLikes,
    total: novedades.count,
    page: parseInt(page, 10),
    totalPages: Math.ceil(novedades.count / parseInt(limit, 10)),
  });
};

export const show = async (req, res) => {
  const novedad = await Novedad.findByPk(req.params.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Materia,
        as: 'materia',
        attributes: ['id', 'nombre'],
        required: false,
      },
      {
        model: Like,
        as: 'likes',
        attributes: ['usuarioId'],
        required: false,
      },
    ],
  });

  if (novedad) {
    const data = novedad.toJSON();
    const likesCount = data.likes ? data.likes.length : 0;
    const usuarioId =
      parseInt(req.query.usuarioId) ||
      req.user?.id ||
      parseInt(req.query.autorId);
    const liked = usuarioId
      ? data.likes?.some((l) => Number(l.usuarioId) === Number(usuarioId)) ||
        false
      : false;
    res.json({
      data: {
        ...data,
        likesCount,
        likes: data.likes ? data.likes.map((l) => Number(l.usuarioId)) : [],
        liked,
      },
    });
  } else {
    res.status(404).json({
      message: `No se encontró una novedad con id ${req.params.id}`,
    });
  }
};

export const create = async (req, res) => {
  const {
    tipo,
    titulo,
    contenido,
    materiaId,
    imagenUrl,
    visible,
    esAutomatica,
  } = req.body;

  if (!tipo || !titulo) {
    return res.status(400).json({
      message: 'Los campos tipo y titulo son obligatorios',
    });
  }

  const tiposValidos = [
    'posteo',
    'inscripcion',
    'regularizacion',
    'aprobacion',
  ];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `El tipo debe ser uno de: ${tiposValidos.join(', ')}`,
    });
  }

  const autorId = req.query.usuarioId || req.user?.id || req.body.autorId;

  if (!autorId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para crear una novedad',
    });
  }

  const autor = await Usuario.findByPk(autorId);
  if (!autor || autor.rol === 'administrador') {
    return res.status(403).json({
      message: 'Los administradores no pueden crear publicaciones en el feed',
    });
  }

  if (['inscripcion', 'regularizacion', 'aprobacion'].includes(tipo)) {
    const preferencias = await PreferenciasEstudiante.findOne({
      where: { estudianteId: autorId },
    });

    if (preferencias) {
      if (tipo === 'inscripcion' && !preferencias.publicarInscripciones) {
        return res.status(403).json({
          message:
            'El estudiante tiene desactivada la publicación automática de inscripciones',
        });
      }
      if (tipo === 'regularizacion' && !preferencias.publicarRegularizaciones) {
        return res.status(403).json({
          message:
            'El estudiante tiene desactivada la publicación automática de regularizaciones',
        });
      }
      if (tipo === 'aprobacion' && !preferencias.publicarAprobaciones) {
        return res.status(403).json({
          message:
            'El estudiante tiene desactivada la publicación automática de aprobaciones',
        });
      }
    }
  }

  const novedad = await Novedad.create({
    tipo,
    titulo,
    contenido: contenido || null,
    imagenUrl: imagenUrl || null,
    materiaId: materiaId || null,
    visible: visible !== undefined ? visible : true,
    esAutomatica: esAutomatica || false,
    likesCount: 0,
    autorId,
  });

  const novedadWithAutor = await Novedad.findByPk(novedad.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Materia,
        as: 'materia',
        attributes: ['id', 'nombre'],
        required: false,
      },
    ],
  });

  res.status(201).json({
    data: {
      ...novedadWithAutor.toJSON(),
      likes: [],
    },
  });
};

export const update = async (req, res) => {
  const novedad = await Novedad.findByPk(req.params.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Materia,
        as: 'materia',
        attributes: ['id', 'nombre'],
        required: false,
      },
      {
        model: Like,
        as: 'likes',
        attributes: ['usuarioId'],
        required: false,
      },
    ],
  });

  if (!novedad) {
    return res.status(404).json({
      message: `No se encontró una novedad con id ${req.params.id}`,
    });
  }

  const usuarioId =
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.body.usuarioId) ||
    parseInt(req.query.autorId);

  if (!usuarioId || novedad.autorId !== usuarioId) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para editar esta novedad' });
  }

  if (novedad.esAutomatica) {
    return res
      .status(403)
      .json({ message: 'No se pueden editar novedades automáticas' });
  }

  const { tipo, titulo, contenido, materiaId, imagenUrl, visible } = req.body;

  if (tipo) {
    const tiposValidos = [
      'posteo',
      'inscripcion',
      'regularizacion',
      'aprobacion',
    ];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        message: `El tipo debe ser uno de: ${tiposValidos.join(', ')}`,
      });
    }
    novedad.tipo = tipo;
  }

  if (titulo) novedad.titulo = titulo;
  if (contenido !== undefined) novedad.contenido = contenido;
  if (imagenUrl !== undefined) novedad.imagenUrl = imagenUrl;
  if (materiaId !== undefined) novedad.materiaId = materiaId;
  if (visible !== undefined) novedad.visible = visible;
  novedad.editedAt = new Date();

  await novedad.save();

  const novedadActualizada = await Novedad.findByPk(novedad.id, {
    include: [
      {
        model: Usuario,
        as: 'autor',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
      {
        model: Materia,
        as: 'materia',
        attributes: ['id', 'nombre'],
        required: false,
      },
      {
        model: Like,
        as: 'likes',
        attributes: ['usuarioId'],
        required: false,
      },
    ],
  });

  const data = novedadActualizada.toJSON();
  const likesCount = data.likes ? data.likes.length : 0;
  const liked = usuarioId
    ? data.likes?.some((l) => Number(l.usuarioId) === Number(usuarioId)) ||
      false
    : false;

  res.json({
    data: {
      ...data,
      likesCount,
      likes: data.likes ? data.likes.map((l) => Number(l.usuarioId)) : [],
      liked,
    },
  });
};

export const remove = async (req, res) => {
  const novedad = await Novedad.findByPk(req.params.id);

  if (!novedad) {
    return res.status(404).json({
      message: `No se encontró una novedad con id ${req.params.id}`,
    });
  }

  const usuarioId =
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.body.usuarioId) ||
    parseInt(req.query.autorId);

  if (!usuarioId || Number(novedad.autorId) !== Number(usuarioId)) {
    return res
      .status(403)
      .json({ message: 'No tienes permiso para eliminar esta novedad' });
  }

  novedad.visible = false;
  await novedad.save();

  res.json({ message: 'Novedad eliminada exitosamente' });
};

export const like = async (req, res) => {
  const novedadId = parseInt(req.params.id);
  const usuarioId =
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.body.usuarioId) ||
    parseInt(req.body.autorId);

  if (!usuarioId || isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ message: 'Debe proporcionar un usuarioId válido para dar like' });
  }

  if (isNaN(novedadId)) {
    return res
      .status(400)
      .json({ message: 'El id de la novedad debe ser un número válido' });
  }

  const novedad = await Novedad.findByPk(novedadId);
  if (!novedad) {
    return res
      .status(404)
      .json({ message: `No se encontró una novedad con id ${novedadId}` });
  }

  const existingLike = await Like.findOne({ where: { novedadId, usuarioId } });
  if (existingLike) {
    const likesCount = await Like.count({ where: { novedadId } });
    return res.json({
      data: { likesCount, liked: true },
    });
  }

  await Like.create({ novedadId, usuarioId });
  const likesCount = await Like.count({ where: { novedadId } });
  await novedad.update({ likesCount });

  res.json({
    data: { likesCount, liked: true },
  });
};

export const unlike = async (req, res) => {
  const novedadId = parseInt(req.params.id);
  const usuarioId =
    parseInt(req.query.usuarioId) ||
    req.user?.id ||
    parseInt(req.body.usuarioId) ||
    parseInt(req.body.autorId);

  if (!usuarioId || isNaN(usuarioId)) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId válido para dar unlike',
    });
  }

  if (isNaN(novedadId)) {
    return res
      .status(400)
      .json({ message: 'El id de la novedad debe ser un número válido' });
  }

  const novedad = await Novedad.findByPk(novedadId);
  if (!novedad) {
    return res
      .status(404)
      .json({ message: `No se encontró una novedad con id ${novedadId}` });
  }

  const deleted = await Like.destroy({ where: { novedadId, usuarioId } });
  if (!deleted) {
    return res
      .status(404)
      .json({ message: 'No se encontró tu like en esta novedad' });
  }

  const likesCount = await Like.count({ where: { novedadId } });
  await novedad.update({ likesCount });

  res.json({
    data: { likesCount, liked: false },
  });
};

export const getPreferencias = async (req, res) => {
  const estudianteId =
    req.query.usuarioId || req.params.estudianteId || req.user?.id;

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un usuarioId para ver las preferencias',
    });
  }

  let preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId },
    include: [
      {
        model: Usuario,
        as: 'estudiante',
        attributes: ['id', 'nombre', 'apellido', 'avatarUrl'],
      },
    ],
  });

  if (!preferencias) {
    preferencias = await PreferenciasEstudiante.create({
      estudianteId,
      publicarInscripciones: true,
      publicarRegularizaciones: true,
      publicarAprobaciones: true,
      perfilPublico: true,
      mostrarEmail: false,
      mostrarSituacionAcademica: false,
    });
  }

  res.json({ data: preferencias.toJSON() });
};

export const updatePreferencias = async (req, res) => {
  const estudianteId =
    req.query.usuarioId || req.params.estudianteId || req.user?.id;

  if (!estudianteId) {
    return res.status(400).json({
      message:
        'Debe proporcionar un usuarioId para actualizar las preferencias',
    });
  }

  let preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId },
  });

  if (!preferencias) {
    preferencias = await PreferenciasEstudiante.create({
      estudianteId,
    });
  }

  const {
    publicarInscripciones,
    publicarRegularizaciones,
    publicarAprobaciones,
    perfilPublico,
    mostrarEmail,
    mostrarSituacionAcademica,
  } = req.body;

  if (publicarInscripciones !== undefined)
    preferencias.publicarInscripciones = publicarInscripciones;
  if (publicarRegularizaciones !== undefined)
    preferencias.publicarRegularizaciones = publicarRegularizaciones;
  if (publicarAprobaciones !== undefined)
    preferencias.publicarAprobaciones = publicarAprobaciones;
  if (perfilPublico !== undefined) preferencias.perfilPublico = perfilPublico;
  if (mostrarEmail !== undefined) preferencias.mostrarEmail = mostrarEmail;
  if (mostrarSituacionAcademica !== undefined)
    preferencias.mostrarSituacionAcademica = mostrarSituacionAcademica;

  await preferencias.save();

  res.json({ data: preferencias.toJSON() });
};

export const createAutomatica = async (req, res) => {
  const { tipo, titulo, contenido, materiaId } = req.body;
  const autorId = req.body.autorId || req.query.usuarioId || req.user?.id;

  if (!tipo || !titulo || !autorId) {
    return res.status(400).json({
      message: 'Los campos tipo, titulo y autorId son obligatorios',
    });
  }

  const autor = await Usuario.findByPk(autorId);
  if (!autor || autor.rol === 'administrador') {
    return res.status(403).json({
      message: 'Los administradores no pueden crear publicaciones en el feed',
    });
  }

  const tiposValidos = ['inscripcion', 'regularizacion', 'aprobacion'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `El tipo automático debe ser uno de: ${tiposValidos.join(', ')}`,
    });
  }

  const preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId: autorId },
  });

  if (preferencias) {
    if (tipo === 'inscripcion' && !preferencias.publicarInscripciones) {
      return res.status(200).json({
        message:
          'Novedad no creada: estudiante tiene desactivada la publicación de inscripciones',
        data: null,
      });
    }
    if (tipo === 'regularizacion' && !preferencias.publicarRegularizaciones) {
      return res.status(200).json({
        message:
          'Novedad no creada: estudiante tiene desactivada la publicación de regularizaciones',
        data: null,
      });
    }
    if (tipo === 'aprobacion' && !preferencias.publicarAprobaciones) {
      return res.status(200).json({
        message:
          'Novedad no creada: estudiante tiene desactivada la publicación de aprobaciones',
        data: null,
      });
    }
  }

  const novedad = await Novedad.create({
    tipo,
    titulo,
    contenido: contenido || null,
    materiaId: materiaId || null,
    visible: true,
    esAutomatica: true,
    likesCount: 0,
    autorId,
  });

  res.status(201).json({ data: novedad.toJSON() });
};
