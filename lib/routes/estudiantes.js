import express from 'express';

import {
  index,
  show,
  getPlanMaterias,
  updateEstadoMateria,
  getMateriasIds,
} from '../controllers/estudiante_controller.js';
import { getPlanMateriasDebug } from '../controllers/debug_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.get('/:usuarioId/materias-ids', withErrorHandling(getMateriasIds));
router.get(
  '/:estudianteId/plan-materias-debug',
  withErrorHandling(getPlanMateriasDebug)
);
router.get('/:estudianteId/plan-materias', withErrorHandling(getPlanMaterias));
router.patch(
  '/:estudianteId/materias/:materiaId/estado',
  withErrorHandling(updateEstadoMateria)
);

export default router;
