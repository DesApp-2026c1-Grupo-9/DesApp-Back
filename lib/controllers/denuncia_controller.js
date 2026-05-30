import db from '../models/index.js';

const { Denuncia, MotivoDenuncia, Material, ConfiguracionModeracion } = db;

export const verificarSuspensionAutomatica = async (materialId) => {
  const [denunciasPendientes, denunciasConfirmadas, configs] = await Promise.all([
    Denuncia.count({ where: { materialId, estado: 'pendiente' } }),
    Denuncia.count({ where: { materialId, estado: 'confirmada' } }),
    ConfiguracionModeracion.findAll(),
  ]);

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.clave] = c.valor;
  });

  const n = configMap.N_DENUNCIAS_PENDIENTES || 10;
  const m = configMap.M_DENUNCIAS_VERIFICADAS || 1;

  if (denunciasPendientes >= n || denunciasConfirmadas >= m) {
    await Material.update(
      { suspendido: true, suspendidoEn: new Date(), revocado: false, revocadoEn: null },
      { where: { id: materialId } }
    );
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
      parseInt(req.body.usuarioId) || parseInt(req.query.usuarioId);

    if (!denuncianteId) {
      return res
        .status(400)
        .json({ message: 'Se requiere usuarioId' });
    }

    if (!materialId || !motivoId) {
      return res
        .status(400)
        .json({ message: 'materialId y motivoId son obligatorios' });
    }

    const material = await Material.findByPk(materialId);
    if (!material) {
      return res
        .status(404)
        .json({ message: 'Material no encontrado' });
    }

    const motivo = await MotivoDenuncia.findByPk(motivoId);
    if (!motivo || !motivo.activo) {
      return res
        .status(400)
        .json({ message: 'Motivo de denuncia no válido' });
    }

    const existente = await Denuncia.findOne({
      where: { materialId, denuncianteId, estado: 'pendiente' },
    });
    if (existente) {
      return res
        .status(409)
        .json({
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
    const { materialId, usuarioId } = req.query;

    if (!materialId || !usuarioId) {
      return res.status(400).json({ message: 'materialId y usuarioId son obligatorios' });
    }

    const existente = await Denuncia.findOne({
      where: {
        materialId: parseInt(materialId),
        denuncianteId: parseInt(usuarioId),
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
