import express from 'express';

import {
  index,
  show,
  create,
  update,
  remove,
  uploadAvatar,
} from '../controllers/usuario_controller.js';
import { withErrorHandling } from './utils.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../config/storage.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.get('/:id', withErrorHandling(show));
router.post(
  '/:id/avatar',
  uploadAvatarMiddleware.single('avatar'),
  withErrorHandling(uploadAvatar)
);

export default router;
