import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
} from '../controllers/usuario_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.get('/:id', withErrorHandling(show));

export default router;
