import express from 'express';

import {
	createPago,
	getPagosByUsuarioId,
	getAllPagos,
	getAllPagosByFecha,
	getPagosByUsuarioIdAndFecha,
	getReportePagos,
	generarReportePDF,
	getMiHistorialPagos,
} from '../controllers/pagosController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();

router.use(verifyToken);

// Rutas de Empleado (Admin)
router.post('/', authorizeRoles('empleado'), createPago);
router.get(
	'/usuario/:usuario_id',
	authorizeRoles('empleado'),
	getPagosByUsuarioId
);
router.get('/', authorizeRoles('empleado'), getAllPagos);
router.get('/reporte', authorizeRoles('empleado'), getReportePagos);
router.get('/reporte/pdf', authorizeRoles('empleado'), generarReportePDF);

router.get(
	'/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	authorizeRoles('empleado'),
	getAllPagosByFecha
);
router.get(
	'/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	authorizeRoles('empleado'),
	getPagosByUsuarioIdAndFecha
);

// Ruta de Cliente
router.get('/mi-historial', authorizeRoles('cliente'), getMiHistorialPagos);

export default router;
