import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
	//Obtener la cabecera de autorización
	const authHeader = req.headers['authorization'];

	if (!authHeader)
		return res.status(401).json({ error: 'Token no proporcionado' });

	//Separación de Bearer y el token
	const token = authHeader.split(' ')[1];

	if (!token) return res.status(401).json({ error: 'Token inválido' });

	//Verificación del token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Token inválido o expirado' });
	}
};
