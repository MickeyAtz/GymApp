//routes/aut.js

import express from 'express';

import { authLogin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//Inicio de sesión
//Creación del token con JWT y hash de contraseña
router.post('/login', authLogin);
//Verificación del token
//Verifica el token con JWT compare, utilizando el usuario y contraseña
router.get('/perfil', (req, res) => {
	res.json({
		message: 'Perfil autenticado',
		usuario: req.user,
	});
});

export default router;
