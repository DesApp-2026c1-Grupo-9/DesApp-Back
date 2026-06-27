import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { Usuario, Estudiante, Administrador } = db;

function getSecret() {
  return process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol, email: user.email },
    getSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'rol', 'activo', 'nombre', 'apellido', 'email'],
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    let estudianteId = null;
    if (user.rol === 'estudiante') {
      const estudiante = await Estudiante.findOne({ where: { usuarioId: user.id } });
      estudianteId = estudiante ? estudiante.id : null;
    }
    let administradorId = null;
    if (user.rol === 'administrador') {
      const administrador = await Administrador.findOne({ where: { usuarioId: user.id } });
      administradorId = administrador ? administrador.id : null;
    }

    req.user = {
      id: user.id,
      estudianteId,
      administradorId,
      rol: user.rol,
      activo: user.activo,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const getEstudiante = async (req) => {
  if (!req.user) return null;
  return Estudiante.findOne({ where: { usuarioId: req.user.id } });
};

export const getAdministrador = async (req) => {
  if (!req.user) return null;
  return Administrador.findOne({ where: { usuarioId: req.user.id } });
};
