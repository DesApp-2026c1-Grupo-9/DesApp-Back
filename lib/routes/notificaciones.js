import { Router } from 'express';
import {
  index,
  contador,
  marcarLeida,
  marcarTodasLeidas,
} from '../controllers/notificacion_controller';

const router = Router();

router.get('/', index);
router.get('/contador', contador);
router.patch('/leer-todas', marcarTodasLeidas);
router.patch('/:id/leer', marcarLeida);

export default router;
