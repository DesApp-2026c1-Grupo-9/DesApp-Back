import { Op } from 'sequelize';
import db from '../models';
import crearNotificacion from '../utils/crearNotificacion';

const { Sesion, SesionParticipante, Materia } = db;

export default function iniciarRecordatorioSesiones() {
  const cron = require('node-cron');

  cron.schedule('0 * * * *', async () => {
    try {
      const ahora = new Date();
      const dentroDe24hs = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      const inicioVentana = new Date(dentroDe24hs.getTime() - 60 * 60 * 1000);
      const finVentana = new Date(dentroDe24hs.getTime() + 60 * 60 * 1000);

      const sesiones = await Sesion.findAll({
        where: {
          estado: 'activa',
          fechaHora: {
            [Op.between]: [inicioVentana, finVentana],
          },
        },
        include: [{ model: Materia, attributes: ['nombre'] }],
      });

      for (const sesion of sesiones) {
        const participantes = await SesionParticipante.findAll({
          where: { sesionId: sesion.id, estado: 'aprobado' },
        });

        for (const p of participantes) {
          await crearNotificacion({
            usuarioId: p.estudianteId,
            tipo: 'sesion_recordatorio',
            titulo: `Recordatorio: la sesión "${sesion.tema}" comienza mañana`,
            materiaId: sesion.materiaId,
            sesionId: sesion.id,
            sesionTema: sesion.tema,
            fechaHora: sesion.fechaHora,
          });
        }
      }

      if (sesiones.length > 0) {
        console.log(
          `[Recordatorio] Notificaciones enviadas para ${sesiones.length} sesiones`
        );
      }
    } catch (err) {
      console.error('[Recordatorio] Error al enviar recordatorios:', err);
    }
  });

  console.log('[Recordatorio] Job programado cada hora');
}
