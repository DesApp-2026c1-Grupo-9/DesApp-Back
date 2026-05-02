import express from 'express';
import usuarios from './usuarios';
import novedades from './novedades';

const router = express.Router();

router.use('/api/usuarios', usuarios);
router.use('/api/novedades', novedades);

export default router;
