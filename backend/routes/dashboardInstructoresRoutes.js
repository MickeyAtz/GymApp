import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';
import {
	getProximaClaseInstructor,
	getInscritosClase,
	getTotalClasesHoy,
	getPopularidadClasesInstructor,
} from '../controllers/dashboardInstructoresController.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('instructor'));

router.get('/proxima-clase', getProximaClaseInstructor);

router.get('/inscritos/:claseId', getInscritosClase);

router.get('/clases-hoy', getTotalClasesHoy);

router.get('/popularidad-clases', getPopularidadClasesInstructor);

export default router;
