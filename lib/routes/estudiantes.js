import express from 'express';

import {
  index,
  show,
  getPlanMaterias,
  updateEstadoMateria,
  inscribirCarrera,
  darDeBajaCarrera,
  getElegibilidadInscripcionCarrera,
  getMateriasIds,
  importarMateriasDesdeExcel,
  getAsistenteAcademico,
} from '../controllers/estudiante_controller.js';
import { getPlanMateriasDebug } from '../controllers/debug_controller.js';
import { withErrorHandling } from './utils.js';

const router = express.Router();

router.get('/', withErrorHandling(index));
router.get('/:id', withErrorHandling(show));
router.get(
  '/:estudianteId/carreras/elegibilidad',
  withErrorHandling(getElegibilidadInscripcionCarrera)
);
router.post('/:estudianteId/carreras', withErrorHandling(inscribirCarrera));
router.delete(
  '/:estudianteId/carreras/:carreraId',
  withErrorHandling(darDeBajaCarrera)
);
router.get('/:usuarioId/materias-ids', withErrorHandling(getMateriasIds));
router.get(
  '/:estudianteId/plan-materias-debug',
  withErrorHandling(getPlanMateriasDebug)
);
router.get('/:estudianteId/plan-materias', withErrorHandling(getPlanMaterias));
router.get(
  '/:estudianteId/asistente',
  withErrorHandling(getAsistenteAcademico)
);
router.patch(
  '/:estudianteId/materias/:materiaId/estado',
  withErrorHandling(updateEstadoMateria)
);
router.post(
  '/:estudianteId/importar-materias',
  withErrorHandling(importarMateriasDesdeExcel)
);

export default router;
