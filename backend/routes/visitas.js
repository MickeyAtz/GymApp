
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
	addVisita,
	getVisitasByUsuarioId,
	getVisitasUsuarioByFecha,
	getAllVisitas,
} from '../controllers/visitasController.js';

const router = express.Router();

router.post('/', addVisita); //Agregar Visita

//Obtener vistas por ID de usuario y rango de fechas
//Params -> usuario_id, fecha_inicio, fecha_final
router.get(
	'/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin',

	getVisitasUsuarioByFecha
);
//Obtener todas las visitas con el ID del usuario.
//Params -> usuario_id
router.get('/usuario/:usuario_id', getVisitasByUsuarioId);
router.get('/', getAllVisitas);

export default router;

//FALTA IMPLEMENTAR CHECKROLE Y VERIFY TOKEN, POR AHORA QUEDAN DESASCTIVADOS EN TODOS LADOS
