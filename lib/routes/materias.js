import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
  getCorrelatividades,
  getMateriasPorAnio,
} from '../controllers/materia_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.get(
  '/:materiaId/correlatividades',
  withErrorHandling(getCorrelatividades)
);
router.get(
  '/carrera/:carreraId/por-anio',
  withErrorHandling(getMateriasPorAnio)
);

export default router;
