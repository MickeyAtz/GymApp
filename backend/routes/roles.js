
import express from 'express';
import {
	createRol,
	deleteRol,
	getAllRoles,
	getRolbyId,
	updateRol,
} from '../controllers/rolesController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();

// ----------------------------CRUD-----------------------------
router.post('/', createRol);
router.get('/', getAllRoles);
router.get('/:id', getRolbyId);
router.put('/:id', updateRol);
router.put('/:id/baja', deleteRol);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
