import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
  getPlanDeEstudio,
  getPlanesByCarrera,
  createPlan,
  updatePlan,
  removePlan,
  addMateriaToPlan,
  removeMateriaFromPlan,
} from '../controllers/carrera_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.get('/:carreraId/planes', withErrorHandling(getPlanesByCarrera));
router.get('/:carreraId/plan', withErrorHandling(getPlanDeEstudio));
router.post('/:carreraId/planes', withErrorHandling(createPlan));
router.put('/:carreraId/planes/:planId', withErrorHandling(updatePlan));
router.delete('/:carreraId/planes/:planId', withErrorHandling(removePlan));
router.post(
  '/:carreraId/planes/:planId/materias',
  withErrorHandling(addMateriaToPlan)
);
router.delete(
  '/:carreraId/planes/:planId/materias/:materiaId',
  withErrorHandling(removeMateriaFromPlan)
);

export default router;
