import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/checkRole.js';
import {
	registrarVisita,
	getVisitasByUsuarioId,
	getVisitasUsuarioByFecha,
	getAllVisitas,
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

// Obtener todas las visitas con el ID del usuario.
// Params -> usuario_id
router.get(
	'/usuario/:usuario_id',
	authorizeRoles('admin', 'empleado'),
	getVisitasByUsuarioId
);

// Obtener TODAS las visitas (probablemente sin params)
router.get(
	'/:fecha_inicio/:fecha_fin',
	authorizeRoles('admin', 'empleado'),
	getAllVisitas
);

export default router;
