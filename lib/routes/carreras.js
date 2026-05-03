import express from 'express';

import {
  index,
  show,
  getPlanDeEstudio,
} from '../controllers/carrera_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.get('/:carreraId/plan', withErrorHandling(getPlanDeEstudio));

export default router;
