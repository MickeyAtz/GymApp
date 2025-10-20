
import express from 'express';
import {
	createUsuario,
	getAllUsuarios,
	getUsuarioById,
	updateUsuario,
	deleteUsuario,
	passwordChange,
} from '../controllers/usuariosController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();

// ----------------------------CRUD-----------------------------
router.post('/register', createUsuario); //Crear usuario
router.get('/', getAllUsuarios); // Leer usuarios (obtener todos)
router.get('/:id', getUsuarioById); // Leer usuario (Obtener por ID)
router.put('/:id', updateUsuario); // Actualizar usuario
router.put('/:id/baja', deleteUsuario); // Eliminar usuario  ----- ELMINACIÓN LÓGICA PARA TODOS LOS REGISTROS ----
router.put('/:id/passwordChange', passwordChange);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
