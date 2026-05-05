import express from 'express';
import {
  index,
  getPendientes,
  invite,
  respond,
  remove,
} from '../controllers/conexion_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/pendientes', withErrorHandling(getPendientes));
router.post('/invite', withErrorHandling(invite));
router.put('/respond/:id', withErrorHandling(respond));
router.delete('/:id', withErrorHandling(remove));

export default router;
