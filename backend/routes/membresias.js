import express from 'express';

import {
	createMembresia,
	getAllMembresias,
	updateMembresia,
	deleteMembresia,
	getActiveMembresias,
	getUsuarioMembresiaActiva,
} from '../controllers/membresiasController.js';

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
//----------------------------------- CRUD -------------------------------
router.post('/', verifyToken, createMembresia); //Crear una membresía
router.get('/', verifyToken, getAllMembresias); //Obtener todas las membresías
router.put('/:id', verifyToken, updateMembresia); //Modificar membresía
router.put('/:id/baja', verifyToken, deleteMembresia); //Eliminar membresía
router.get('/activas', getActiveMembresias);
router.get('/usuario/:usuario_id/activa', getUsuarioMembresiaActiva);
export default router;
