import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';
import {
	registrarVisita,
	getVisitasUsuarioByFecha,
	getAllVisitas,
	getMiHistorialVisitas,
} from '../controllers/visitasController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/registrar', authorizeRoles('admin', 'empleado'), registrarVisita);

// Obtener vistas por ID de usuario y rango de fechas
// Params -> usuario_id, fecha_inicio, fecha_final
router.get(
	'/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',
	authorizeRoles('admin', 'empleado'),
	getVisitasUsuarioByFecha
);

// Obtener TODAS las visitas (probablemente sin params)
router.get(
	'/:fecha_inicio/:fecha_fin',
	authorizeRoles('admin', 'empleado'),
	getAllVisitas
);

//HISTORIAL DE VISITAS DEL USUARIO
router.get(
	'/mi-historial',
	authorizeRoles('cliente'),
	getMiHistorialVisitas // <-- Nueva función
);

export default router;
