import express from 'express';
import usuarios from './usuarios';
import novedades from './novedades';
import carreras from './carreras.js';
import estudiantes from './estudiantes.js';
import materias from './materias.js';

const router = express.Router();

router.use('/api/usuarios', usuarios);
router.use('/api/novedades', novedades);
router.use('/api/carreras', carreras);
router.use('/api/estudiantes', estudiantes);
router.use('/api/materias', materias);

export default router;
