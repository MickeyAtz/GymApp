import express from 'express';
import {
	createEmpleado,
	getAllEmpleados,
	getEmpleadoById,
	updateEmpleado,
	deleteEmpleado,
	passwordChange,
} from '../controllers/empleadosController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();
router.use(verifyToken);

// ----------------------------CRUD-----------------------------
router.post('/register', authorizeRoles('empleado'), createEmpleado); //Crear usuario
router.get('/', authorizeRoles('empleado'), getAllEmpleados); // Leer usuarios (obtener todos)
router.get('/:id', authorizeRoles('empleado'), getEmpleadoById); // Leer usuario (Obtener por ID)
router.put('/:id', authorizeRoles('empleado'), updateEmpleado); // Actualizar usuario
router.put('/:id/baja', authorizeRoles('empleado'), deleteEmpleado); // Eliminar usuario  ----- ELMINACIÓN LÓGICA PARA TODOS LOS REGISTROS ----
router.put('/:id/passwordChange', authorizeRoles('empleado'), passwordChange); // Actualizar solamente la password

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
