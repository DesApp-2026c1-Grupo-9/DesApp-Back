import db from '../models';
import { sendEmail } from './mailer';
import buildEmail from './emailTemplates';

const { Notificacion, Usuario, PreferenciasEstudiante, Materia } = db;

async function enviarEmailNotificacion({
  usuarioId,
  tipo,
  titulo,
  actorId,
  materiaId,
}) {
  try {
    const [usuario, preferencias, actor, materia] = await Promise.all([
      Usuario.findByPk(usuarioId, { attributes: ['email'] }),
      PreferenciasEstudiante.findOne({
        where: { estudianteId: usuarioId },
        attributes: ['recibirEmails'],
      }),
      actorId
        ? Usuario.findByPk(actorId, { attributes: ['nombre', 'apellido'] })
        : Promise.resolve(null),
      materiaId
        ? Materia.findByPk(materiaId, { attributes: ['nombre'] })
        : Promise.resolve(null),
    ]);

    const puedeRecibir = preferencias?.recibirEmails ?? true;
    if (!puedeRecibir || !usuario?.email) return;

    const { subject, html } = buildEmail(tipo, {
      titulo,
      actorNombre: actor?.nombre || 'Alguien',
      actorApellido: actor?.apellido || '',
      materiaNombre: materia?.nombre || null,
    });

    await sendEmail({ to: usuario.email, subject, html });
  } catch (err) {
    console.error('[crearNotificacion] Error al enviar email:', err);
  }
}

export default async function crearNotificacion({
  usuarioId,
  tipo,
  titulo,
  actorId,
  materiaId,
  sesionId,
  denunciaId,
  materialId,
  novedadId,
}) {
  const notificacion = await Notificacion.create({
    usuarioId,
    tipo,
    titulo,
    actorId: actorId || null,
    materiaId: materiaId || null,
    sesionId: sesionId || null,
    denunciaId: denunciaId || null,
    materialId: materialId || null,
    novedadId: novedadId || null,
  });

  enviarEmailNotificacion({ usuarioId, tipo, titulo, actorId, materiaId });

  return notificacion;
}
