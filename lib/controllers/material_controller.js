import { Op } from 'sequelize';
import db from '../models/index.js';
import { cloudinary } from '../config/storage.js';
import { getEstudianteMateriaScope } from '../utils/estudianteMateriaScope.js';

const {
  Material,
  MaterialTag,
  MaterialMaterialTag,
  MaterialRating,
  Materia,
  Usuario,
  Estudiante,
  Denuncia,
  Notificacion,
  MotivoDenuncia,
} = db;

const isDiscordLink = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('discord') && lowerUrl.includes('/invite');
};

const detectLinkTipo = (url) => {
  if (!url) return 'web';
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be'))
    return 'youtube';
  if (lowerUrl.includes('drive.google.com')) return 'drive';
  if (lowerUrl.includes('dropbox.com')) return 'dropbox';
  if (isDiscordLink(url)) return 'discord';
  if (lowerUrl.includes('github.com')) return 'github';
  return 'web';
};

const getEstudianteIdFromReq = (req) => {
  return (
    parseInt(req.query.estudianteId) ||
    (req.user && req.user.estudianteId) ||
    parseInt(req.body.estudianteId)
  );
};

export const index = async (req, res) => {
  try {
    const { materiaId, search, sortBy, estudianteId } = req.query;
    const where = {};

    const currentUserId = getEstudianteIdFromReq(req);
    const isAdmin = req.user?.rol === 'administrador';
    const scope = currentUserId
      ? await getEstudianteMateriaScope({ estudianteId: currentUserId })
      : null;

    if (!isAdmin && currentUserId) {
      if (!scope?.materiaIds?.length) {
        return res.json({ data: [] });
      }

      if (materiaId) {
        const parsedMateriaId = parseInt(materiaId);
        if (!scope.materiaIds.includes(parsedMateriaId)) {
          return res.json({ data: [] });
        }
        where.materiaId = parsedMateriaId;
      } else {
        where.materiaId = { [Op.in]: scope.materiaIds };
      }
    } else if (materiaId) {
      where.materiaId = parseInt(materiaId);
    }

    if (!isAdmin) {
      where[Op.or] = [
        { suspendido: false },
        { suspendido: true, estudianteId: currentUserId },
      ];
    }

    let include = [
      { model: Materia, as: 'materia', attributes: ['id', 'nombre', 'codigo'] },
      {
        model: Estudiante,
        as: 'creador',
        attributes: ['id'],
        include: [{ model: Usuario, attributes: ['id', 'nombre', 'apellido'] }],
      },
      {
        model: MaterialTag,
        as: 'tags',
        through: { attributes: [] },
        attributes: ['id', 'nombre'],
      },
      {
        model: MaterialRating,
        as: 'ratings',
        attributes: ['valor', 'estudianteId'],
      },
      {
        model: Denuncia,
        as: 'denuncias',
        attributes: ['estado'],
        required: false,
      },
    ];

    const materiales = await Material.findAll({
      where,
      include,
      order: [['fecha', sortBy === 'fecha_asc' ? 'ASC' : 'DESC']],
    });

    let filteredMateriales = materiales.map((m) => m.toJSON());

    if (search) {
      const searchLower = search.toLowerCase();
      filteredMateriales = filteredMateriales.filter(
        (m) =>
          m.titulo.toLowerCase().includes(searchLower) ||
          m.descripcion?.toLowerCase().includes(searchLower) ||
          m.tags.some((t) => t.nombre.toLowerCase().includes(searchLower)) ||
          m.materia?.nombre.toLowerCase().includes(searchLower)
      );
    }

    if (sortBy === 'rating_desc' || sortBy === 'rating_asc') {
      filteredMateriales = filteredMateriales.map((m) => {
        const ratings = m.ratings || [];
        const upvotes = ratings.filter((r) => r.valor === 1).length;
        const downvotes = ratings.filter((r) => r.valor === -1).length;
        const totalRatings = upvotes + downvotes;

        return {
          ...m,
          _upvotes: upvotes,
          _downvotes: downvotes,
          _totalRatings: totalRatings,
          _ratio: totalRatings > 0 ? upvotes / totalRatings : -1,
          denuncias: m.denuncias || [],
        };
      });

      filteredMateriales.sort((a, b) => {
        const aUnrated = a._totalRatings === 0;
        const bUnrated = b._totalRatings === 0;

        if (aUnrated !== bUnrated) return aUnrated ? 1 : -1;
        if (aUnrated) return 0;

        if (sortBy === 'rating_desc') {
          if (a._upvotes !== b._upvotes) return b._upvotes - a._upvotes;
          if (a._ratio !== b._ratio) return b._ratio - a._ratio;
          return b._totalRatings - a._totalRatings;
        } else {
          if (a._upvotes !== b._upvotes) return a._upvotes - b._upvotes;
          if (a._ratio !== b._ratio) return a._ratio - b._ratio;
          return b._totalRatings - a._totalRatings;
        }
      });
    }

    const result = filteredMateriales.map((m) => {
      const ratings = m.ratings || [];
      const upvotes = ratings.filter((r) => r.valor === 1).length;
      const downvotes = ratings.filter((r) => r.valor === -1).length;
      const userRating = estudianteId
        ? ratings.find((r) => r.estudianteId === parseInt(estudianteId))
        : null;

      const denuncias = m.denuncias || [];
      const denunciasPendientes = denuncias.filter(
        (d) => d.estado === 'pendiente'
      ).length;
      const denunciasConfirmadas = denuncias.filter(
        (d) => d.estado === 'confirmada'
      ).length;

      const isSuspended = m.suspendido === true;

      return {
        id: m.id,
        titulo: m.titulo,
        descripcion: m.descripcion,
        tipo: m.tipo,
        url: isSuspended ? null : m.url,
        nombreArchivo: isSuspended ? null : m.nombreArchivo,
        tamanho: m.tamanho,
        tipoLink: m.tipoLink,
        discordInfo: isSuspended ? null : m.discordInfo,
        suspendido: isSuspended,
        suspendidoEn: m.suspendidoEn,
        revocado: m.revocado,
        revocadoEn: m.revocadoEn,
        materiaId: m.materiaId,
        materia: m.materia,
        creadorId: m.estudianteId,
        creador: m.creador
          ? { ...m.creador.Usuario, id: m.creador.Usuario.id }
          : null,
        tags: m.tags,
        fecha: m.fecha,
        ratings: { upvotes, downvotes },
        userRating: userRating ? userRating.valor : null,
        denunciasPendientes,
        denunciasConfirmadas,
      };
    });

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los materiales',
      error: error.message,
    });
  }
};

export const getMaterias = async (req, res) => {
  try {
    const estudianteId = getEstudianteIdFromReq(req);
    const scope = estudianteId
      ? await getEstudianteMateriaScope({ estudianteId })
      : null;

    const where = {};
    if (estudianteId) {
      if (!scope?.materiaIds?.length) {
        return res.json({ data: [] });
      }
      where.id = { [Op.in]: scope.materiaIds };
    }

    const materias = await Materia.findAll({
      where,
      attributes: ['id', 'nombre', 'codigo'],
      order: [['nombre', 'ASC']],
    });
    res.json({ data: materias });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener las materias', error: error.message });
  }
};

export const show = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id, {
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo'],
        },
        {
          model: Estudiante,
          as: 'creador',
          attributes: ['id'],
          include: [
            { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
          ],
        },
        { model: MaterialTag, as: 'tags', through: { attributes: [] } },
        { model: MaterialRating, as: 'ratings' },
        {
          model: Denuncia,
          as: 'denuncias',
          attributes: ['estado'],
          include: [
            {
              model: MotivoDenuncia,
              as: 'motivo',
              attributes: ['nombre'],
            },
          ],
          required: false,
        },
      ],
    });

    if (!material) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    const currentUserId = getEstudianteIdFromReq(req);
    const isAdmin = req.user?.rol === 'administrador';

    if (
      material.suspendido &&
      !isAdmin &&
      material.estudianteId !== currentUserId
    ) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    const ratings = material.ratings || [];
    const upvotes = ratings.filter((r) => r.valor === 1).length;
    const downvotes = ratings.filter((r) => r.valor === -1).length;

    const denuncias = material.denuncias || [];
    const denunciasPendientes = denuncias.filter(
      (d) => d.estado === 'pendiente'
    ).length;
    const denunciasConfirmadas = denuncias.filter(
      (d) => d.estado === 'confirmada'
    ).length;

    const denunciasActivas = denuncias.filter(
      (d) => d.estado === 'pendiente' || d.estado === 'confirmada'
    );
    const motivosUnicos = [
      ...new Set(denunciasActivas.map((d) => d.motivo?.nombre).filter(Boolean)),
    ];
    const suspendidoMotivo =
      motivosUnicos.length > 0 ? motivosUnicos.join(', ') : null;

    const isSuspended = material.suspendido === true;

    const data = {
      ...material.toJSON(),
      ratings: { upvotes, downvotes },
      denunciasPendientes,
      denunciasConfirmadas,
      suspendidoMotivo,
      creadorId: material.estudianteId,
    };

    if (data.creador?.Usuario) data.creador = data.creador.Usuario;

    if (isSuspended && !isAdmin) {
      data.url = null;
      data.nombreArchivo = null;
      data.discordInfo = null;
    }

    res.json({ data });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener el material', error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const estudianteId = getEstudianteIdFromReq(req);
    if (!estudianteId) {
      return res.status(400).json({ message: 'Se requiere estudianteId' });
    }

    const { titulo, descripcion, tipo, url, materiaId } = req.body;
    let { tags } = req.body;
    if (typeof tags === 'string') tags = [tags];

    if (!titulo || !tipo || !materiaId) {
      return res
        .status(400)
        .json({ message: 'El título, tipo y materiaId son obligatorios' });
    }

    if (tipo === 'file' && !req.file) {
      return res
        .status(400)
        .json({ message: 'Se requiere un archivo para tipo file' });
    }

    if (tipo === 'link' && !url) {
      return res
        .status(400)
        .json({ message: 'Se requiere una URL para tipo link' });
    }

    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res
        .status(404)
        .json({ message: `No se encontró una materia con id ${materiaId}` });
    }

    const scope = await getEstudianteMateriaScope({ estudianteId });
    if (!scope.materiaIds.includes(Number(materiaId))) {
      return res.status(403).json({
        message:
          'No podés publicar materiales en materias que no pertenecen a tus carreras.',
      });
    }

    const materialData = {
      titulo,
      descripcion,
      tipo,
      materiaId: parseInt(materiaId),
      estudianteId,
      fecha: new Date(),
    };

    if (tipo === 'file') {
      materialData.nombreArchivo = req.file.originalname;
      materialData.tamanho = req.file.size;
      materialData.url = req.file.path;
    } else {
      materialData.url = url;
      materialData.tipoLink = detectLinkTipo(url);
      if (materialData.tipoLink === 'discord') {
        materialData.discordInfo = {
          servidor: 'Servidor de Estudio',
          canal: 'General',
        };
      }
    }

    const material = await Material.create(materialData);

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tag = await MaterialTag.findOne({ where: { nombre: tagName } });
        if (!tag) {
          tag = await MaterialTag.create({ nombre: tagName });
        }
        await MaterialMaterialTag.create({
          materialId: material.id,
          tagId: tag.id,
        });
      }
    }

    const createdMaterial = await Material.findByPk(material.id, {
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo'],
        },
        {
          model: Estudiante,
          as: 'creador',
          attributes: ['id'],
          include: [
            { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
          ],
        },
        { model: MaterialTag, as: 'tags', through: { attributes: [] } },
      ],
    });

    const materialJson = createdMaterial.toJSON();
    if (materialJson.creador?.Usuario)
      materialJson.creador = materialJson.creador.Usuario;
    res.status(201).json({
      message: 'Material creado exitosamente',
      data: {
        ...materialJson,
        creadorId: materialJson.estudianteId,
        ratings: { upvotes: 0, downvotes: 0 },
        userRating: null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al crear el material', error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const estudianteId = getEstudianteIdFromReq(req);
    if (!estudianteId) {
      return res.status(400).json({ message: 'Se requiere estudianteId' });
    }

    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    if (material.estudianteId !== estudianteId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para actualizar este material' });
    }

    const denunciasActivas = await Denuncia.count({
      where: { materialId: material.id, estado: ['pendiente', 'confirmada'] },
    });
    if (denunciasActivas > 0) {
      return res.status(409).json({
        message:
          'No puedes editar un material con denuncias pendientes o confirmadas.',
      });
    }

    const { titulo, descripcion, tags } = req.body;

    await material.update({
      ...(titulo && { titulo }),
      ...(descripcion !== undefined && { descripcion }),
    });

    if (tags && Array.isArray(tags)) {
      await MaterialMaterialTag.destroy({ where: { materialId: material.id } });
      for (const tagName of tags) {
        let tag = await MaterialTag.findOne({ where: { nombre: tagName } });
        if (!tag) {
          tag = await MaterialTag.create({ nombre: tagName });
        }
        await MaterialMaterialTag.create({
          materialId: material.id,
          tagId: tag.id,
        });
      }
    }

    const updatedMaterial = await Material.findByPk(material.id, {
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo'],
        },
        {
          model: Estudiante,
          as: 'creador',
          attributes: ['id'],
          include: [
            { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
          ],
        },
        { model: MaterialTag, as: 'tags', through: { attributes: [] } },
        { model: MaterialRating, as: 'ratings' },
      ],
    });

    const ratings = updatedMaterial.ratings || [];
    const upvotes = ratings.filter((r) => r.valor === 1).length;
    const downvotes = ratings.filter((r) => r.valor === -1).length;
    const userRating = ratings.find((r) => r.estudianteId === estudianteId);

    const materialJson = updatedMaterial.toJSON();
    if (materialJson.creador?.Usuario)
      materialJson.creador = materialJson.creador.Usuario;
    res.json({
      message: 'Material actualizado exitosamente',
      data: {
        ...materialJson,
        creadorId: materialJson.estudianteId,
        ratings: { upvotes, downvotes },
        userRating: userRating ? userRating.valor : null,
      },
    });
  } catch (error) {
    console.error('Error al actualizar material:', error);
    res.status(500).json({
      message: 'Error al actualizar el material',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const estudianteId = getEstudianteIdFromReq(req);
    if (!estudianteId) {
      return res.status(400).json({ message: 'Se requiere estudianteId' });
    }

    const material = await Material.findByPk(req.params.id);
    if (!material) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    if (material.estudianteId !== estudianteId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar este material' });
    }

    const denunciasActivas = await Denuncia.count({
      where: { materialId: material.id, estado: ['pendiente', 'confirmada'] },
    });
    if (denunciasActivas > 0) {
      return res.status(409).json({
        message:
          'No puedes eliminar un material con denuncias pendientes o confirmadas.',
      });
    }

    if (material.tipo === 'file' && material.url) {
      try {
        const match = material.url.match(/\/materiales\/(.+)$/);
        if (match) {
          const publicId = `materiales/${match[1]}`;
          const resourceType = material.url.includes('/raw/') ? 'raw' : 'image';
          await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
        }
      } catch (fileError) {
        console.error(
          'Error deleting file from Cloudinary:',
          fileError.message
        );
      }
    }

    await MaterialMaterialTag.destroy({ where: { materialId: material.id } });
    await MaterialRating.destroy({ where: { materialId: material.id } });
    await Denuncia.destroy({ where: { materialId: material.id } });
    await Notificacion.destroy({ where: { materialId: material.id } });
    await material.destroy();

    res.json({ message: 'Material eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    res
      .status(500)
      .json({ message: 'Error al eliminar el material', error: error.message });
  }
};

export const rate = async (req, res) => {
  try {
    const estudianteId = getEstudianteIdFromReq(req);
    if (!estudianteId) {
      return res.status(400).json({ message: 'Se requiere estudianteId' });
    }

    const { value } = req.body;
    if (value === undefined || (value !== 1 && value !== -1)) {
      return res
        .status(400)
        .json({ message: 'El valor debe ser 1 (upvote) o -1 (downvote)' });
    }

    const material = await Material.findByPk(req.params.id, {
      include: [{ model: MaterialRating, as: 'ratings' }],
    });

    if (!material) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    const existingRating = material.ratings?.find(
      (r) => r.estudianteId === estudianteId
    );

    if (existingRating) {
      if (existingRating.valor === value) {
        await existingRating.destroy();
      } else {
        await existingRating.update({ valor: value });
      }
    } else {
      await MaterialRating.create({
        materialId: material.id,
        estudianteId,
        valor: value,
      });
    }

    const updatedMaterial = await Material.findByPk(material.id, {
      include: [
        {
          model: Materia,
          as: 'materia',
          attributes: ['id', 'nombre', 'codigo'],
        },
        {
          model: Estudiante,
          as: 'creador',
          attributes: ['id'],
          include: [
            { model: Usuario, attributes: ['id', 'nombre', 'apellido'] },
          ],
        },
        { model: MaterialTag, as: 'tags', through: { attributes: [] } },
        { model: MaterialRating, as: 'ratings' },
      ],
    });

    const ratings = updatedMaterial.ratings || [];
    const upvotes = ratings.filter((r) => r.valor === 1).length;
    const downvotes = ratings.filter((r) => r.valor === -1).length;
    const userRating = ratings.find((r) => r.estudianteId === estudianteId);

    const materialJson = updatedMaterial.toJSON();
    if (materialJson.creador?.Usuario)
      materialJson.creador = materialJson.creador.Usuario;
    res.json({
      message: 'Calificación actualizada',
      data: {
        ...materialJson,
        creadorId: materialJson.estudianteId,
        ratings: { upvotes, downvotes },
        userRating: userRating ? userRating.valor : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al calificar el material',
      error: error.message,
    });
  }
};

export const download = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: `No se encontró un material con id ${req.params.id}`,
      });
    }

    if (material.tipo !== 'file') {
      return res
        .status(400)
        .json({ message: 'Este material no es un archivo' });
    }

    const isAdmin = req.user?.rol === 'administrador';
    if (material.suspendido && !isAdmin) {
      return res.status(403).json({ message: 'Este material está suspendido' });
    }

    if (!material.url) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    res.redirect(material.url);
  } catch (error) {
    res.status(500).json({
      message: 'Error al descargar el material',
      error: error.message,
    });
  }
};
