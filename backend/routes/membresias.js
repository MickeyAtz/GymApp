
import express from 'express';

import {
	createMembresia,
	getAllMembresias,
	updateMembresia,
	deleteMembresia,
} from '../controllers/membresiasController.js';

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//----------------------------------- CRUD -------------------------------
router.post('/', verifyToken, createMembresia); //Crear una membresía
router.get('/', verifyToken, getAllMembresias); //Obtener todas las membresías
router.put('/:id', verifyToken, updateMembresia); //Modificar membresía
router.put('/:id/baja', verifyToken, deleteMembresia); //Eliminar membresía

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
