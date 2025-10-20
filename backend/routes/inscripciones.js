
import { Router } from 'express';
import {
	createInscripcion,
	getAllInscripciones,
	getInscripcionesByUsuario,
	deleteInscripcion,
} from '../controllers/inscripcionesController.js';

const router = Router();

router.post('/', createInscripcion);
router.get('/', getAllInscripciones);
router.get('/usuario/:usuario_id', getInscripcionesByUsuario);
router.put('/:id/baja', deleteInscripcion);

export default router;
