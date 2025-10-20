
import express from 'express';
import {
	totalusuarios,
	nuevosUsuarios,
	usuariosPorMes,
	totalMembresiasMes,
	totalMembresiasActivas,
	totalClases,
	inscripcionesPorClase,
	estadisticasGenerales,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/usuarios/total', totalusuarios);
router.get('/usuarios/nuevos', nuevosUsuarios);
router.get('/usuarios/porMes', usuariosPorMes);

router.get('/membresias/totalMes', totalMembresiasMes);
router.get('/membresias/activas', totalMembresiasActivas);

router.get('/clases/total', totalClases);
router.get('/clases/inscripciones', inscripcionesPorClase);

router.get('/estadisticas/generales', estadisticasGenerales);

export default router;
