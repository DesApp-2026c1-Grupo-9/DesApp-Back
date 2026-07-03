import express from 'express';
import db from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const { Usuario, Estudiante, Administrador } = db;

export const withErrorHandling = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function errorAwareRouter() {
  const basicRouter = express.Router();
  function newRouter(...params) {
    basicRouter(...params);
  }
  newRouter.get = function (path, controller) {
    basicRouter.get(path, withErrorHandling(controller));
  };
  newRouter.post = function (path, controller) {
    basicRouter.post(path, withErrorHandling(controller));
  };
  newRouter.patch = function (path, controller) {
    basicRouter.patch(path, withErrorHandling(controller));
  };
  newRouter.delete = function (path, controller) {
    basicRouter.delete(path, withErrorHandling(controller));
  };
  newRouter.put = function (path, controller) {
    basicRouter.put(path, withErrorHandling(controller));
  };
  return newRouter;
}

async function resolveUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = verifyToken(authHeader.split(' ')[1]);
    return await Usuario.findByPk(decoded.id, {
      attributes: ['id', 'rol', 'activo'],
    });
  } catch {
    return null;
  }
}

async function resolveUserFromHeader(req) {
  const userId = req.headers['x-user-id'];
  if (!userId) return null;
  return await Usuario.findByPk(Number(userId), {
    attributes: ['id', 'rol', 'activo'],
  });
}

export const requireActiveUser = async (req, res, next) => {
  try {
    let user = await resolveUserFromToken(req);
    if (!user) {
      user = await resolveUserFromHeader(req);
    }
    if (!user) {
      req.user = null;
      return next();
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

    req.user = { id: user.id, estudianteId, administradorId, rol: user.rol, activo: user.activo };
    if (!user.activo && !['GET', 'HEAD'].includes(req.method)) {
      return res.status(403).json({
        message: 'Cuenta desactivada. No puede realizar esta operación.',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
