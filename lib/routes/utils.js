import express from 'express';
import db from '../models/index.js';

const { Usuario } = db;

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

export const requireActiveUser = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    req.user = null;
    return next();
  }
  try {
    const user = await Usuario.findByPk(Number(userId), {
      attributes: ['id', 'rol', 'activo'],
    });
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    req.user = { id: user.id, rol: user.rol, activo: user.activo };
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
