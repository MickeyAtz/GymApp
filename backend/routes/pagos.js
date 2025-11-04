import express from 'express';

import {
	createPago,
	getPagosByUsuarioId,
	getAllPagos,
	getAllPagosByFecha,
	getPagosByUsuarioIdAndFecha,
	getReportePagos,
	generarReportePDF,
} from '../controllers/pagosController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('empleado'));
// localhost/api/pagos
//-------------------------CRUD-----------------------------
router.post('/', createPago); //Creación del pago
router.get('/usuario/:usuario_id', getPagosByUsuarioId);
router.get('/', getAllPagos); //Obtener todos los pagos

router.get('/reporte', authorizeRoles('empleado'), getReportePagos);
router.get('/reporte/pdf', authorizeRoles('empleado'), generarReportePDF);

router.get(
	'/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	getAllPagosByFecha
);
router.get(
	'/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	getPagosByUsuarioIdAndFecha
);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
