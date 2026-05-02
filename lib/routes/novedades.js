import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
  like,
  unlike,
  getPreferencias,
  updatePreferencias,
  createAutomatica,
} from '../controllers/novedad_controller';
import comentarios from './comentarios';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/feed/contactos', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.post('/', withErrorHandling(create));
router.post('/automatica', withErrorHandling(createAutomatica));
router.post('/:id/like', withErrorHandling(like));
router.post('/:id/unlike', withErrorHandling(unlike));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));

router.use('/:novedadId/comentarios', comentarios);

router.get('/preferencias/:estudianteId?', withErrorHandling(getPreferencias));
router.put(
  '/preferencias/:estudianteId?',
  withErrorHandling(updatePreferencias)
);

export default router;
