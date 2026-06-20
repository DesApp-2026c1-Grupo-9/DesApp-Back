import express from 'express';
import auth from './auth';
import usuarios from './usuarios';
import novedades from './novedades';
import conexiones from './conexiones';
import carreras from './carreras.js';
import estudiantes from './estudiantes.js';
import materias from './materias.js';
import sesiones from './sesiones';
import materiales from './materiales.js';
import denuncias from './denuncias.js';
import admin from './admin.js';
import notificaciones from './notificaciones.js';
import { requireActiveUser } from './utils.js';

const router = express.Router();

router.use('/auth', auth);
router.use(requireActiveUser);

router.use('/api/usuarios', usuarios);
router.use('/api/novedades', novedades);
router.use('/api/conexiones', conexiones);
router.use('/api/carreras', carreras);
router.use('/api/estudiantes', estudiantes);
router.use('/api/materias', materias);
router.use('/api/sesiones', sesiones);
router.use('/api/materiales', materiales);
router.use('/api/denuncias', denuncias);
router.use('/api/notificaciones', notificaciones);
router.use('/api/admin', admin);

export default router;
