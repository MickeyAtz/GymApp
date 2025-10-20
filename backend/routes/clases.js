
import express from 'express';
import {
	createClase,
	getAllClases,
	getClaseById,
	updateClase,
	deleteClase,
} from '../controllers/clasesController.js';

const router = express.Router();

router.post('/register', createClase);
router.get('/', getAllClases);
router.get('/:id', getClaseById);
router.put('/:id', updateClase);
router.put('/:id/baja', deleteClase);

export default router;
