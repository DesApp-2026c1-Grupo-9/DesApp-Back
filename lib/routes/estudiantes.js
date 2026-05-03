import express from 'express';

import {
  index,
  show,
  getPlanMaterias,
  updateEstadoMateria,
} from '../controllers/estudiante_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.get('/:estudianteId/plan-materias', withErrorHandling(getPlanMaterias));
router.patch(
  '/:estudianteId/materias/:materiaId/estado',
  withErrorHandling(updateEstadoMateria)
);

export default router;
