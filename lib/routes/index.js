import express from 'express';
import usuarios from './usuarios';
import carreras from './carreras';

const router = express.Router();

router.use('/api/usuarios', usuarios);
router.use('/api/carreras', carreras);

export default router;
