import express from 'express';
import {
	createInstructor,
	deleteInstructor,
	getAllInstructores,
	getInstructorById,
	updateInstructor,
	passwordChange,
} from '../controllers/instructoresController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();
router.use(verifyToken);

// ----------------------------CRUD-----------------------------
router.post('/register', createInstructor);
router.get('/', getAllInstructores);
router.get('/:id', getInstructorById);
router.put('/:id', updateInstructor);
router.put('/:id/baja', deleteInstructor);
router.put('/:id/passwordChange', passwordChange);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
