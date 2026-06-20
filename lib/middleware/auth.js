import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { Usuario } = db;

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

    req.user = {
      id: user.id,
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
