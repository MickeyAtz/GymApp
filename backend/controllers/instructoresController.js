import pool from '../db.js';
import bcrypt from 'bcrypt';

// Crear instructor
export const createInstructor = async (req, res) => {
	const { perfil_id: empleado_id } = req.user;
	const { nombre, especialidad, telefono, email, apellidos, password } =
		req.body;

	console.log(req.user);

	try {
		// Validar que el email no exista
		const instructorExist = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1',
			[email]
		);

		if (instructorExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El email ya está registrado en otro instructor.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		await pool.query(
			`
				CALL registrar_instructor($1, $2, $3, $4, $5, $6, $7)
			`,
			[
				nombre,
				apellidos,
				especialidad,
				telefono,
				empleado_id,
				email,
				hashedPassword,
			]
		);

		return res.status(200).json({ message: 'Instructor creado exitosamente' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al crear el instructor' });
	}
};

// Obtener todos los instructores activos
export const getAllInstructores = async (req, res) => {
	try {
		const instructores = await pool.query('SELECT * FROM v_instructores');
		return res.json(instructores.rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener los instructores' });
	}
};

// Obtener instructor por ID
export const getInstructorById = async (req, res) => {
	const { id } = req.params;
	try {
		const instructor = await pool.query(
			'SELECT * FROM v_instructores WHERE instructor_id = $1',
			[id]
		);

		if (instructor.rows.length === 0) {
			return res.status(404).json({ error: 'Instructor no encontrado' });
		}

		return res.json(instructor.rows[0]);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener el instructor' });
	}
};

// Actualizar instructor
export const updateInstructor = async (req, res) => {
	const { id } = req.params;
	const { nombre, especialidad, telefono, email, apellidos, ca_id } = req.body;

	console.log(req.body);

	try {
		// Validar que el email no se repita en otro instructor
		const checkEmail = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1 AND id != $2',
			[email, ca_id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otro instructor' });
		}

		await pool.query(
			`
				CALL modificar_instructor($1, $2, $3, $4, $5, $6)
			`,
			[id, nombre, apellidos, telefono, especialidad, email]
		);

		return res.json({ message: 'Instructor actualizado exitosamente. ' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al actualizar el instructor' });
	}
};

// Baja lógica (fecha de baja)
export const deleteInstructor = async (req, res) => {
	const { id } = req.params;
	try {
		const { rows } = await pool.query(
			'SELECT baja_instructor($1) AS instructor_eliminado_id',
			[id]
		);

		return res.json({
			message: 'Instructor eliminado (baja lógica)',
			instructor: rows[0],
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al eliminar el instructor' });
	}
};

//CAMBIAR SOLO CONTRASEÑA
export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
	console.log(req.params);
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updateInstructor = await pool.query(
			`SELECT cambio_password_instructor($1, $2) AS instructor_actualziado_id`,
			[id, hashedPassword]
		);
		res.json({
			message: 'Contraseña actualizada',
			usuario: updateInstructor.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar contraseña' });
	}
};
