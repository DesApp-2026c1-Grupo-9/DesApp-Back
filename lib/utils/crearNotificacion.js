import db from '../models';

const { Notificacion } = db;

export default async function crearNotificacion({
  usuarioId,
  tipo,
  titulo,
  actorId,
  materiaId,
  sesionId,
  denunciaId,
  materialId,
}) {
  return Notificacion.create({
    usuarioId,
    tipo,
    titulo,
    actorId: actorId || null,
    materiaId: materiaId || null,
    sesionId: sesionId || null,
    denunciaId: denunciaId || null,
    materialId: materialId || null,
  });
}
