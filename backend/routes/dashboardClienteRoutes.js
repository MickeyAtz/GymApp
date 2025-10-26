import express from 'express';

import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

import {
	getEstadoMembresia,
	getProximaClase,
	getAsistenciasMes,
	getGraficaAsistencias,
} from '../controllers/dashboardClienteController.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('cliente'));

router.get('/estado-membresia', getEstadoMembresia);
router.get('/proxima-clase', getProximaClase);
router.get('/asistencias-mes', getAsistenciasMes);
router.get('/grafica-asistencias', getGraficaAsistencias);

export default router;
