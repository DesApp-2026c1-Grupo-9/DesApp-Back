import express from 'express';

import {
  index,
  getMaterias,
  show,
  create,
  update,
  remove,
  rate
} from '../controllers/material_controller.js';
import { withErrorHandling } from './utils.js';
import { uploadMaterial } from '../config/storage.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/materias', withErrorHandling(getMaterias));
router.get('/:id', withErrorHandling(show));
router.post('/', uploadMaterial.single('archivo'), withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.post('/:id/rate', withErrorHandling(rate));

export default router;