import express from 'express';
import { withErrorHandling } from './utils.js';
import {
  listarDenuncias,
  obtenerDenuncia,
  confirmarDenuncia,
  rechazarDenuncia,
  listarMotivos,
  crearMotivo,
  actualizarMotivo,
  eliminarMotivo,
  obtenerConfiguracion,
  actualizarConfiguracion,
  restaurarMaterial,
} from '../controllers/admin_controller.js';

const router = express.Router();

router.get('/denuncias', withErrorHandling(listarDenuncias));
router.get('/denuncias/:id', withErrorHandling(obtenerDenuncia));
router.put('/denuncias/:id/confirmar', withErrorHandling(confirmarDenuncia));
router.put('/denuncias/:id/rechazar', withErrorHandling(rechazarDenuncia));

router.get('/motivos-denuncia', withErrorHandling(listarMotivos));
router.post('/motivos-denuncia', withErrorHandling(crearMotivo));
router.put('/motivos-denuncia/:id', withErrorHandling(actualizarMotivo));
router.delete('/motivos-denuncia/:id', withErrorHandling(eliminarMotivo));

router.get(
  '/configuracion-moderacion',
  withErrorHandling(obtenerConfiguracion)
);
router.put(
  '/configuracion-moderacion',
  withErrorHandling(actualizarConfiguracion)
);

router.put(
  '/materiales/:id/restaurar',
  withErrorHandling(restaurarMaterial)
);

export default router;
