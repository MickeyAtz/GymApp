import express from 'express';
import {
	// Controladores de Admin/Empleado
	createUsuario,
	getAllUsuarios,
	getUsuarioById,
	updateUsuario,
	deleteUsuario,
	passwordChange,
	searchUsuarios,

	// Controladores de Cliente
	getMisInscripciones,
	getClasesDisponibles,
	inscribirEnClase,
	darseDeBaja,
} from '../controllers/usuariosController.js';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js'; // Tu middleware corregido

const router = express.Router();

// Aplicamos autenticación general a todas las rutas de este archivo
router.use(verifyToken);

// =================================================================
//  RUTAS DE CLIENTE (Gestión de "Mis Inscripciones")
// =================================================================
// (Deben ir primero para no chocar con /:id)

// GET /api/usuarios/mis-inscripciones
router.get(
	'/mis-inscripciones',
	authorizeRoles('cliente'), // Solo clientes
	getMisInscripciones
);

// GET /api/usuarios/clases-disponibles
router.get(
	'/clases-disponibles',
	authorizeRoles('cliente'), // Solo clientes
	getClasesDisponibles
);

// POST /api/usuarios/inscribir/:clase_id
router.post(
	'/inscribir/:clase_id',
	authorizeRoles('cliente'), // Solo clientes
	inscribirEnClase
);

// PUT /api/usuarios/baja/:id_inscripcion
router.put(
	'/baja/:id_inscripcion',
	authorizeRoles('cliente'), // Solo clientes
	darseDeBaja
);

// =================================================================
//  RUTAS DE ADMIN/EMPLEADO (Gestión de Usuarios)
// =================================================================
// (Asumo roles 'admin' y 'recepcionista' según tu middleware de instructores)

// GET /api/usuarios/search (Debe ir antes de /:id)
router.get('/search', authorizeRoles('admin', 'empleado'), searchUsuarios);

// POST /api/usuarios/register
router.post(
	'/register',
	authorizeRoles('admin', 'empleado'),
	createUsuario
);

// GET /api/usuarios
router.get('/', authorizeRoles('admin', 'empleado'), getAllUsuarios);

// GET /api/usuarios/:id
router.get('/:id', authorizeRoles('admin', 'empleado'), getUsuarioById);

// PUT /api/usuarios/:id
router.put('/:id', authorizeRoles('admin', 'empleado'), updateUsuario);

// PUT /api/usuarios/:id/baja
router.put(
	'/:id/baja',
	authorizeRoles('admin', 'empleado'),
	deleteUsuario
);

// PUT /api/usuarios/:id/passwordChange
router.put(
	'/:id/passwordChange',
	authorizeRoles('admin', 'empleado'),
	passwordChange
);

export default router;
