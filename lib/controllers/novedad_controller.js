import { Op } from 'sequelize';
import Novedad from '../models/novedad';
import Usuario from '../models/usuario';
import Estudiante from '../models/estudiante';
import Materia from '../models/materia';
import PreferenciasEstudiante from '../models/preferenciasEstudiante';
import Like from '../models/like';
import Conexion from '../models/conexion';
import Sesion from '../models/sesion';
import crearNotificacion from '../utils/crearNotificacion';

const getEstudianteIdFromReq = (req) => {
  return (
    parseInt(req.query.estudianteId) ||
    (req.user && req.user.estudianteId) ||
    parseInt(req.body.estudianteId) ||
    parseInt(req.query.autorId) ||
    parseInt(req.body.autorId)
  );
};

const autorInclude = {
  model: Estudiante,
  as: 'autor',
  attributes: ['id'],
  include: [
    {
      model: Usuario,
      attributes: ['id', 'nombre', 'apellido', 'avatarUrl', 'rol'],
    },
  ],
};

export const index = async (req, res) => {
  const { page = 1, limit = 20, tipo, autorId, feed } = req.query;

  const where = { visible: true };

  if (tipo) {
    where.tipo = tipo;
  }

  if (autorId) {
    where.estudianteId = autorId;
  }

  const include = [
    autorInclude,
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
    {
      model: Sesion,
      as: 'sesion',
      required: false,
      include: [
        {
          model: Estudiante,
          as: 'creador',
          attributes: ['id'],
          include: [
            {
              model: Usuario,
              attributes: ['id', 'nombre', 'apellido', 'avatarUrl', 'rol'],
            },
          ],
          required: false,
        },
      ],
    },
  ];

  if (feed === 'contactos') {
    const estudianteId = getEstudianteIdFromReq(req);
    if (!estudianteId) {
      return res.status(400).json({
        message:
          'Debe proporcionar un estudianteId para ver el feed de contactos',
      });
    }

    const conexiones = await Conexion.findAll({
      where: {
        [Op.or]: [{ usuarioId: estudianteId }, { contactoId: estudianteId }],
        estado: 'aceptada',
      },
    });

    const contactosIds = conexiones.map((c) =>
      Number(c.usuarioId) === Number(estudianteId) ? c.contactoId : c.usuarioId
    );
    contactosIds.push(estudianteId);

    where.estudianteId = contactosIds;
  }

  const novedades = await Novedad.findAndCountAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit, 10),
    offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
  });

  const estudianteId = getEstudianteIdFromReq(req);
  const novedadesConLikes = novedades.rows.map((n) => {
    const data = n.toJSON();
    if (data.autor?.Usuario) data.autor = data.autor.Usuario;
    if (data.sesion?.creador?.Usuario)
      data.sesion.creador = data.sesion.creador.Usuario;
    const likesCount = data.likes ? data.likes.length : 0;
    const liked = estudianteId
      ? data.likes?.some((l) => Number(l.usuarioId) === Number(estudianteId)) ||
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
      autorInclude,
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
      {
        model: Sesion,
        as: 'sesion',
        required: false,
      },
    ],
  });

  if (novedad) {
    const data = novedad.toJSON();
    if (data.autor?.Usuario) data.autor = data.autor.Usuario;
    const likesCount = data.likes ? data.likes.length : 0;
    const estudianteId = getEstudianteIdFromReq(req);
    const liked = estudianteId
      ? data.likes?.some((l) => Number(l.usuarioId) === Number(estudianteId)) ||
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
    sesionId,
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
    'sesion_creada',
    'sesion_cancelada',
  ];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      message: `El tipo debe ser uno de: ${tiposValidos.join(', ')}`,
    });
  }

  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para crear una novedad',
    });
  }

  const est = await Estudiante.findByPk(estudianteId, { include: [Usuario] });
  if (!est || est.Usuario.rol === 'administrador') {
    return res.status(403).json({
      message: 'Los administradores no pueden crear publicaciones en el feed',
    });
  }

  if (['inscripcion', 'regularizacion', 'aprobacion'].includes(tipo)) {
    const preferencias = await PreferenciasEstudiante.findOne({
      where: { estudianteId },
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
    sesionId: sesionId || null,
    visible: visible !== undefined ? visible : true,
    esAutomatica: esAutomatica || false,
    likesCount: 0,
    estudianteId,
  });

  const novedadWithAutor = await Novedad.findByPk(novedad.id, {
    include: [
      autorInclude,
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
    ],
  });

  const createdData = novedadWithAutor.toJSON();
  if (createdData.autor?.Usuario) createdData.autor = createdData.autor.Usuario;
  res.status(201).json({
    data: {
      ...createdData,
      likes: [],
    },
  });
};

export const update = async (req, res) => {
  const novedad = await Novedad.findByPk(req.params.id, {
    include: [
      autorInclude,
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
      {
        model: Sesion,
        as: 'sesion',
        required: false,
      },
    ],
  });

  if (!novedad) {
    return res.status(404).json({
      message: `No se encontró una novedad con id ${req.params.id}`,
    });
  }

  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId',
    });
  }

  if (novedad.estudianteId !== estudianteId) {
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
      'sesion_creada',
      'sesion_cancelada',
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
      autorInclude,
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
      {
        model: Sesion,
        as: 'sesion',
        required: false,
      },
    ],
  });

  const data = novedadActualizada.toJSON();
  if (data.autor?.Usuario) data.autor = data.autor.Usuario;
  const likesCount = data.likes ? data.likes.length : 0;
  const liked = estudianteId
    ? data.likes?.some((l) => Number(l.usuarioId) === Number(estudianteId)) ||
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

  const estudianteId = getEstudianteIdFromReq(req);
  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId',
    });
  }

  if (Number(novedad.estudianteId) !== Number(estudianteId)) {
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
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId || isNaN(estudianteId)) {
    return res
      .status(400)
      .json({
        message: 'Debe proporcionar un estudianteId válido para dar like',
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

  if (Number(novedad.estudianteId) === Number(estudianteId)) {
    return res
      .status(403)
      .json({ message: 'No puedes dar like a tu propia publicación' });
  }

  const existingLike = await Like.findOne({
    where: { novedadId, usuarioId: estudianteId },
  });
  if (existingLike) {
    const likesCount = await Like.count({ where: { novedadId } });
    return res.json({
      data: { likesCount, liked: true },
    });
  }

  await Like.create({ novedadId, usuarioId: estudianteId });
  const likesCount = await Like.count({ where: { novedadId } });
  await novedad.update({ likesCount });

  try {
    const est = await Estudiante.findByPk(estudianteId, {
      include: [{ model: Usuario, attributes: ['nombre', 'apellido'] }],
    });
    if (est?.Usuario) {
      await crearNotificacion({
        usuarioId: novedad.estudianteId,
        tipo: 'novedad_like',
        titulo: `A ${est.Usuario.nombre} ${est.Usuario.apellido} le gustó tu publicación`,
        actorId: estudianteId,
        novedadId,
      });
    }
  } catch (err) {
    console.error('Error al notificar like:', err);
  }

  res.json({
    data: { likesCount, liked: true },
  });
};

export const unlike = async (req, res) => {
  const novedadId = parseInt(req.params.id);
  const estudianteId = getEstudianteIdFromReq(req);

  if (!estudianteId || isNaN(estudianteId)) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId válido para dar unlike',
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

  const deleted = await Like.destroy({
    where: { novedadId, usuarioId: estudianteId },
  });
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
    req.query.estudianteId || req.params.estudianteId || req.user?.id;

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId para ver las preferencias',
    });
  }

  let preferencias = await PreferenciasEstudiante.findOne({
    where: { estudianteId },
    include: [
      {
        model: Estudiante,
        as: 'estudiante',
        attributes: ['id'],
      },
    ],
  });

  if (!preferencias) {
    preferencias = await PreferenciasEstudiante.create({
      estudianteId,
      publicarInscripciones: true,
      publicarRegularizaciones: true,
      publicarAprobaciones: true,
      publicarSesiones: true,
      perfilPublico: true,
      mostrarEmail: false,
      mostrarSituacionAcademica: false,
      visibleEnDescubrir: true,
      recibirEmails: true,
    });
  }

  res.json({ data: preferencias.toJSON() });
};

export const updatePreferencias = async (req, res) => {
  const estudianteId =
    req.query.estudianteId || req.params.estudianteId || req.user?.id;

  if (!estudianteId) {
    return res.status(400).json({
      message:
        'Debe proporcionar un estudianteId para actualizar las preferencias',
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
    publicarSesiones,
    perfilPublico,
    mostrarEmail,
    mostrarSituacionAcademica,
    visibleEnDescubrir,
    recibirEmails,
  } = req.body;

  if (publicarInscripciones !== undefined)
    preferencias.publicarInscripciones = publicarInscripciones;
  if (publicarRegularizaciones !== undefined)
    preferencias.publicarRegularizaciones = publicarRegularizaciones;
  if (publicarAprobaciones !== undefined)
    preferencias.publicarAprobaciones = publicarAprobaciones;
  if (publicarSesiones !== undefined)
    preferencias.publicarSesiones = publicarSesiones;
  if (perfilPublico !== undefined) preferencias.perfilPublico = perfilPublico;
  if (mostrarEmail !== undefined) preferencias.mostrarEmail = mostrarEmail;
  if (mostrarSituacionAcademica !== undefined)
    preferencias.mostrarSituacionAcademica = mostrarSituacionAcademica;
  if (visibleEnDescubrir !== undefined)
    preferencias.visibleEnDescubrir = visibleEnDescubrir;
  if (recibirEmails !== undefined) preferencias.recibirEmails = recibirEmails;

  await preferencias.save();

  res.json({ data: preferencias.toJSON() });
};

export const createAutomatica = async (req, res) => {
  const { tipo, titulo, contenido, materiaId } = req.body;
  const estudianteId = getEstudianteIdFromReq(req);

  if (!tipo || !titulo) {
    return res.status(400).json({
      message: 'Los campos tipo y titulo son obligatorios',
    });
  }

  if (!estudianteId) {
    return res.status(400).json({
      message: 'Debe proporcionar un estudianteId de un estudiante',
    });
  }

  const est = await Estudiante.findByPk(estudianteId, { include: [Usuario] });
  if (!est || est.Usuario.rol === 'administrador') {
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
    where: { estudianteId },
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
    estudianteId,
  });

  res.status(201).json({ data: novedad.toJSON() });
};
