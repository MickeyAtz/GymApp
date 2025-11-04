import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import pool from '../db.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const authLogin = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Email y contraseña requeridos.' });
	}

	try {
		const { rows } = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE LOWER(email) = LOWER($1)',
			[email]
		);

		if (rows.length === 0)
			return res.status(404).json({ message: 'Credenciales incorrectas.' });

		const cuenta = rows[0];

		const validPassword = await bcrypt.compare(password, cuenta.password_hash);
		console.log(validPassword);

		if (!validPassword) {
			return res.status(401).json({ message: 'Credenciales incorrectas.' });
		}

		let perfil = '';
		let perfilId = null;
		let nombre = '';
		let apellidos = '';
		let rol = '';

		if (cuenta.usuario_id) {
			perfil = 'cliente';
			perfilId = cuenta.usuario_id;

			const { rows: usuarioRows } = await pool.query(
				`SELECT nombre, apellidos FROM usuarios WHERE id = $1 AND fecha_baja IS NULL`,
				[perfilId]
			);
			if (usuarioRows.length === 0) {
				return res.status(403).json({ message: 'El usuario no está activo.' });
			}

			nombre = usuarioRows[0].nombre;
			apellidos = usuarioRows[0].apellidos;
			rol = 'cliente';
		} else if (cuenta.instructor_id) {
			perfil = 'instructor';
			perfilId = cuenta.instructor_id;

			const { rows: instructorRows } = await pool.query(
				`SELECT nombre, apellidos FROM instructores WHERE id = $1 AND fecha_baja IS NULL`,
				[perfilId]
			);
			if (instructorRows.length === 0) {
				return res
					.status(403)
					.json({ message: 'El instructor no está activo.' });
			}

			nombre = instructorRows[0].nombre;
			apellidos = instructorRows[0].apellidos;
			rol = 'instructor';
		} else if (cuenta.empleado_id) {
			perfil = 'empleado';
			rol = 'empleado';
			perfilId = cuenta.empleado_id;

			const { rows: empleadoRows } = await pool.query(
				`
					SELECT e.nombre, e.apellidos, r.nombre AS rol
					FROM empleados e
					JOIN roles r ON r.id = e.role_id
					WHERE e.id = $1 AND e.fecha_baja IS NULL
				`,
				[perfilId]
			);
			if (empleadoRows.length === 0) {
				return res.status(403).json({ message: 'El empleado no está activo.' });
			}

			nombre = empleadoRows[0].nombre;
			apellidos = empleadoRows[0].apellidos;
		}

		const payload = {
			cuenta_id: cuenta.id,
			perfil,
			perfil_id: perfilId,
			rol,
		};

		const token = jwt.sign(payload, JWT_SECRET, {
			expiresIn: '1d',
		});

		const usuario = {
			nombre,
			apellidos,
			perfil,
			rol,
		};

		return res.json({
			message: 'Inicio de sesión éxitoso',
			token,
			usuario,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	}
};
