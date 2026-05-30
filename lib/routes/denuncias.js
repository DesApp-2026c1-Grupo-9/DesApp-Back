import express from 'express';
import { withErrorHandling } from './utils.js';
import {
  crearDenuncia,
  listarMotivosPublicos,
  verificarDenunciaExistente,
} from '../controllers/denuncia_controller.js';

const router = express.Router();

router.get('/verificar', withErrorHandling(verificarDenunciaExistente));
router.get('/motivos', withErrorHandling(listarMotivosPublicos));
router.post('/', withErrorHandling(crearDenuncia));

export default router;
