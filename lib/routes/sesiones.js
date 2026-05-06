import express from 'express';
import {
  index, show, create, update, remove,
  inscribirse, getParticipantes, aprobarParticipante, rechazarParticipante,
  leaveSesion
} from '../controllers/sesion_controller';
import { withErrorHandling } from './utils';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.post('/', withErrorHandling(create));
router.put('/:id', withErrorHandling(update));
router.delete('/:id', withErrorHandling(remove));
router.post('/:id/inscribirse', withErrorHandling(inscribirse));
router.get('/:id/participantes', withErrorHandling(getParticipantes));
router.put('/:id/participantes/:participanteId/aprobar', withErrorHandling(aprobarParticipante));
router.put('/:id/participantes/:participanteId/rechazar', withErrorHandling(rechazarParticipante));
router.delete('/:id/participantes/:participanteId', withErrorHandling(leaveSesion));

export default router;
