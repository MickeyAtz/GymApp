
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

// ----------------------------CRUD-----------------------------
router.post('/register', verifyToken, authorizeRoles('admin'), createEmpleado); //Crear usuario
router.get('/', verifyToken, authorizeRoles('admin'), getAllEmpleados); // Leer usuarios (obtener todos)
router.get('/:id', verifyToken, authorizeRoles('admin'), getEmpleadoById); // Leer usuario (Obtener por ID)
router.put('/:id', verifyToken, authorizeRoles('admin'), updateEmpleado); // Actualizar usuario
router.put('/:id/baja', verifyToken, authorizeRoles('admin'), deleteEmpleado); // Eliminar usuario  ----- ELMINACIÓN LÓGICA PARA TODOS LOS REGISTROS ----
router.put('/:id/passwordChange', verifyToken, authorizeRoles('admin'), passwordChange); // Actualizar solamente la password

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
