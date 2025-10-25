
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import pool from '../db.js';

dotenv.config();

export const authLogin = async (req, res) => {
	const { email, password } = req.body;

	try {
		const empleadoResult = await pool.query(
			`SELECT e.id, e.email, e.nombre, e.password, r.id AS role_id, r.nombre AS role_nombre
			FROM empleados e
			JOIN roles r ON e.role_id = r.id
			WHERE e.email = $1 AND e.fecha_baja IS NULL`,
			[email]
		);

		if (empleadoResult.rows.length > 0) {
			const empleado = empleadoResult.rows[0];

			const isValidPassowrd = await bcrypt.compare(password, empleado.password);

			if (!isValidPassowrd)
				return res.status(401).json({ error: 'Credenciales incorrectas' });

			const token = jwt.sign(
				{
					id: empleado.id,
					email: empleado.email,
					rol: empleado.rol_id,
					tipo: 'empleado',
				},
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES_IN }
			);

			return res.json({
				message: 'Inicio de sesión exitoso',
				token,
				usuario: {
					id: empleado.id,
					email: empleado.email,
					nombre: empleado.nombre,
					rol: empleado.role_id,
					rol_nombre: empleado.role_nombre,
					tipo: 'empleado',
				},
			});
		}

		const clienteResult = await pool.query(
			`SELECT id, email, nombre, password
			FROM usuarios
			WHERE email = $1 AND fecha_baja IS NULL`,
			[email]
		);

		if (clienteResult.rows.length > 0) {
			const cliente = clienteResult.rows[0];

			const isValidPassword = await bcrypt.compare(password, cliente.password);

			if (!isValidPassword)
				return res.status(401).json({ error: 'Credenciales incorrectas' });

			const token = jwt.sign(
				{
					id: cliente.id,
					email: cliente.email,
					tipo: 'cliente',
				},
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES_IN }
			);

			res.json({
				message: 'Inicio de sesión exitoso',
				token,
				usuario: {
					id: cliente.id,
					email: cliente.email,
					nombre: cliente.nombre,
					tipo: 'cliente',
				},
			});
		}
		const instructorResult = await pool.query(
			`SELECT id, email, nombre, password
       		FROM instructores
       		WHERE email = $1 AND fechabaja IS NULL`,
			[email]
		);

		if (instructorResult.rows.length > 0) {
			const instructor = instructorResult.rows[0];
			const isValidPassword = await bcrypt.compare(
				password,
				instructor.password
			);
			if (!isValidPassword)
				return res.status(401).json({ error: 'Credenciales incorrectas' });

			const token = jwt.sign(
				{ id: instructor.id, email: instructor.email, tipo: 'instructor' },
				process.env.JWT_SECRET,
				{ expiresIn: process.env.JWT_EXPIRES_IN }
			);

			return res.json({
				message: 'Inicio de sesión exitoso',
				token,
				usuario: {
					id: instructor.id,
					email: instructor.email,
					nombre: instructor.nombre,
					tipo: 'instructor',
				},
			});
		}
		return res.status(401).json({ error: 'Credenciales incorrectas' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	}
};
