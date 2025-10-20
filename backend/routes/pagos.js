
import express from 'express';

import {
	createPago,
	getPagosByUsuarioId,
	getAllPagos,
	getAllPagosByFecha,
	getPagosByUsuarioIdAndFecha,
} from '../controllers/pagosController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// localhost/api/pagos
//-------------------------CRUD-----------------------------
router.post('/', verifyToken, createPago); //Creación del pago
router.get('/usuario/:usuario_id', verifyToken, getPagosByUsuarioId);
router.get('/', verifyToken, getAllPagos); //Obtener todos los pagos
// //Obtención de pagos por rango de fechas
router.get(
	'/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	verifyToken,
	getAllPagosByFecha
);
//Obtención de pagos por ID de usuario y rango de fechas
router.get(
	'/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	verifyToken,
	getPagosByUsuarioIdAndFecha
);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
