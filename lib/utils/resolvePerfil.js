import db from '../models/index.js';

const { Estudiante, Administrador } = db;

export const getEstudianteId = async (usuarioId) => {
  if (!usuarioId) return null;
  const est = await Estudiante.findOne({ where: { usuarioId } });
  return est ? est.id : null;
};

export const getAdministradorId = async (usuarioId) => {
  if (!usuarioId) return null;
  const admin = await Administrador.findOne({ where: { usuarioId } });
  return admin ? admin.id : null;
};

export const flattenUsuario = (obj) => {
  if (!obj || !obj.Usuario) return obj;
  return { ...obj.Usuario };
};

export const resolveEstudiante = async (req, defaultValue = null) => {
  const usuarioId =
    parseInt(req.query.usuarioId) ||
    (req.user && req.user.id) ||
    parseInt(req.body.usuarioId) ||
    defaultValue;
  if (!usuarioId) return null;
  const est = await Estudiante.findOne({
    where: { usuarioId },
    include: [{ model: db.Usuario, attributes: ['id', 'nombre', 'apellido', 'avatarUrl', 'rol', 'email'] }],
  });
  return est;
};
