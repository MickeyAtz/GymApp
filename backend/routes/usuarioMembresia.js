
import express from 'express';

import {
	getAllUsuarioMembresias,
	getUsuarioMembresiaById,
	getUsuarioMembresiaActiva,
} from '../controllers/usuarioMembresiaController.js';

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// localhost/api/usuario_membresia
router.get('/', getAllUsuarioMembresias);
router.get('/:usuario_id', getUsuarioMembresiaById);
router.get('/activo/:usuario_id', getUsuarioMembresiaActiva);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
