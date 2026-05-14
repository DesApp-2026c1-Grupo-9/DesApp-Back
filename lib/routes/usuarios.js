import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
  getAllEstudiantes,
  updateEstadoMateria,
  getPlanMaterias,
} from '../controllers/usuario_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/estudiantes', withErrorHandling(getAllEstudiantes));
router.get('/:id/plan-materias', withErrorHandling(getPlanMaterias));
router.get('/', withErrorHandling(index));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.get('/:id', withErrorHandling(show));
router.put(
  '/:id/materia/:materiaId/estado',
  withErrorHandling(updateEstadoMateria)
);

export default router;
