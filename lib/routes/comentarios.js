import { Router } from 'express';
import * as comentarioController from '../controllers/comentario_controller';

const router = Router({ mergeParams: true });

router.get('/', comentarioController.index);
router.post('/', comentarioController.create);
router.put('/:id', comentarioController.update);
router.delete('/:id', comentarioController.remove);

export default router;
