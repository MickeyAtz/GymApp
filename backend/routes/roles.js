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
router.use(verifyToken);

// ----------------------------CRUD-----------------------------
router.post('/', createRol);
router.get('/', getAllRoles);
router.get('/:id', getRolbyId);
router.put('/:id', updateRol);
router.put('/:id/baja', deleteRol);

export default router;
