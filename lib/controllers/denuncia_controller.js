import db from '../models/index.js';
import crearNotificacion from '../utils/crearNotificacion';

const { Denuncia, MotivoDenuncia, Material, ConfiguracionModeracion } = db;

export const verificarSuspensionAutomatica = async (materialId) => {
  const [
    denunciasPendientes,
    denunciasConfirmadas,
    configs,
  ] = await Promise.all([
    Denuncia.count({ where: { materialId, estado: 'pendiente' } }),
    Denuncia.count({ where: { materialId, estado: 'confirmada' } }),
    ConfiguracionModeracion.findAll(),
  ]);

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.clave] = c.valor;
  });

  const n = configMap.N_DENUNCIAS_PENDIENTES || 10;
  const m = configMap.M_DENUNCIAS_VERIFICADAS || 3;

  if (denunciasPendientes >= n || denunciasConfirmadas >= m) {
    await Material.update(
      {
        suspendido: true,
        suspendidoEn: new Date(),
        revocado: false,
        revocadoEn: null,
      },
      { where: { id: materialId } }
    );

    try {
      const mat = await Material.findByPk(materialId);
      if (mat?.estudianteId) {
        await crearNotificacion({
          usuarioId: mat.estudianteId,
          tipo: 'material_suspendido',
          titulo: `Tu material "${mat.titulo}" fue suspendido`,
          materialId,
        });
      }
    } catch (err) {
      console.error('Error al notificar suspensión:', err);
    }

    return true;
  }

  await Material.update(
    { suspendido: false, suspendidoEn: null },
    { where: { id: materialId } }
  );
  return false;
};

export const crearDenuncia = async (req, res) => {
  try {
    const { materialId, motivoId, detalle } = req.body;
    const denuncianteId =
      parseInt(req.body.estudianteId) || parseInt(req.query.estudianteId);

    if (!denuncianteId) {
      return res.status(400).json({ message: 'Se requiere estudianteId' });
    }

    if (!materialId || !motivoId) {
      return res
        .status(400)
        .json({ message: 'materialId y motivoId son obligatorios' });
    }

    const material = await Material.findByPk(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    const motivo = await MotivoDenuncia.findByPk(motivoId);
    if (!motivo || !motivo.activo) {
      return res.status(400).json({ message: 'Motivo de denuncia no válido' });
    }

    const existente = await Denuncia.findOne({
      where: { materialId, denuncianteId, estado: 'pendiente' },
    });
    if (existente) {
      return res.status(409).json({
        message: 'Ya has denunciado este material con una denuncia pendiente',
      });
    }

    const denuncia = await Denuncia.create({
      materialId: parseInt(materialId),
      denuncianteId,
      motivoId: parseInt(motivoId),
      detalle: detalle || null,
      estado: 'pendiente',
    });

    try {
      if (material.estudianteId) {
        await crearNotificacion({
          usuarioId: material.estudianteId,
          tipo: 'denuncia_recibida',
          titulo: `Denunciaron tu material "${material.titulo}"`,
          actorId: denuncianteId,
          materialId: material.id,
          denunciaId: denuncia.id,
        });
      }
    } catch (err) {
      console.error('Error al crear notificación de denuncia:', err);
    }

    const suspendido = await verificarSuspensionAutomatica(
      parseInt(materialId)
    );

    res.status(201).json({
      message: suspendido
        ? 'Denuncia creada. El material ha sido suspendido automáticamente.'
        : 'Denuncia creada exitosamente',
      data: denuncia,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al crear la denuncia', error: error.message });
  }
};

export const verificarDenunciaExistente = async (req, res) => {
  try {
    const { materialId, estudianteId } = req.query;

    if (!materialId || !estudianteId) {
      return res
        .status(400)
        .json({ message: 'materialId y estudianteId son obligatorios' });
    }

    const parsedEstudianteId = parseInt(estudianteId);
    if (!parsedEstudianteId) {
      return res.json({ yaDenuncio: false });
    }

    const existente = await Denuncia.findOne({
      where: {
        materialId: parseInt(materialId),
        denuncianteId: parsedEstudianteId,
        estado: 'pendiente',
      },
    });

    res.json({ yaDenuncio: !!existente });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al verificar denuncia', error: error.message });
  }
};

export const listarMotivosPublicos = async (req, res) => {
  try {
    const motivos = await MotivoDenuncia.findAll({
      where: { activo: true },
      attributes: ['id', 'nombre', 'descripcion'],
      order: [['nombre', 'ASC']],
    });
    res.json({ data: motivos });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al listar motivos', error: error.message });
  }
};
