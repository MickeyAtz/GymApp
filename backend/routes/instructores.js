import express from 'express';
import {
	// Controladores de Admin
	createInstructor,
	deleteInstructor,
	getAllInstructores,
	getInstructorById,
	updateInstructor,
	passwordChange,
	// Controladores de Instructor
	getMisClases,
	getAlumnosDeMiClase,
	eliminarAlumnoDeClase,
	createClaseInstructor,
	updateClaseInstructor,
	deleteClaseInstructor,
} from '../controllers/instructoresController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();

// Aplicamos autenticación general a todas las rutas
router.use(verifyToken);

// =================================================================
//  RUTAS DE INSTRUCTOR (Gestión de "Mis Clases")
// =================================================================
// (Deben ir primero para que '/mis-clases' no sea capturado por '/:id')

// GET /api/instructores/mis-clases
router.get('/mis-clases', authorizeRoles('instructor'), getMisClases);

// POST /api/instructores/mis-clases
router.post('/mis-clases', authorizeRoles('instructor'), createClaseInstructor);

// GET /api/instructores/mis-clases/alumnos/:clase_id
router.get(
	'/mis-clases/alumnos/:clase_id',
	authorizeRoles('instructor'),
	getAlumnosDeMiClase
);

// PUT /api/instructores/mis-clases/alumnos/:id_inscripcion
router.put(
	'/mis-clases/alumnos/:id_inscripcion',
	authorizeRoles('instructor'),
	eliminarAlumnoDeClase
);

// PUT /api/instructores/mis-clases/:clase_id
router.put(
	'/mis-clases/:clase_id',
	authorizeRoles('instructor'),
	updateClaseInstructor
);

// DELETE /api/instructores/mis-clases/:clase_id
router.delete(
	'/mis-clases/:clase_id',
	authorizeRoles('instructor'),
	deleteClaseInstructor
);

// =================================================================
//  RUTAS DE ADMIN (Gestión de Instructores)
// =================================================================

// POST /api/instructores/register
router.post(
	'/register',
	authorizeRoles('admin', 'empleado'),
	createInstructor
);

// GET /api/instructores
router.get('/', authorizeRoles('admin', 'empleado'), getAllInstructores);

// GET /api/instructores/:id
router.get('/:id', authorizeRoles('admin', 'empleado'), getInstructorById);

// PUT /api/instructores/:id
router.put('/:id', authorizeRoles('admin', 'empleado'), updateInstructor);

// PUT /api/instructores/:id/baja
router.put(
	'/:id/baja',
	authorizeRoles('admin', 'empleado'),
	deleteInstructor
);

// PUT /api/instructores/:id/passwordChange
router.put(
	'/:id/passwordChange',
	authorizeRoles('admin', 'empleado'),
	passwordChange
);

export default router;
