
import pool from '../db.js';
import bcrypt from 'bcrypt';

// Crear instructor
export const createInstructor = async (req, res) => {
	const { nombre, especialidad, telefono, email, apellidos, password } =
		req.body;

	try {
		// Validar que el email no exista
		const instructorExist = await pool.query(
			'SELECT * FROM instructores WHERE email = $1 AND fechabaja IS NULL',
			[email]
		);

		if (instructorExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El email ya está registrado en otro instructor.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newInstructor = await pool.query(
			`INSERT INTO instructores (nombre, especialidad, telefono, email, apellidos, password) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[nombre, especialidad, telefono, email, apellidos, hashedPassword]
		);

		res.json({
			message: 'Instructor creado exitosamente',
			instructor: newInstructor.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al crear el instructor' });
	}
};

// Obtener todos los instructores activos
export const getAllInstructores = async (req, res) => {
	try {
		const instructores = await pool.query(
			'SELECT * FROM instructores WHERE fechabaja IS NULL'
		);
		res.json(instructores.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los instructores' });
	}
};

// Obtener instructor por ID
export const getInstructorById = async (req, res) => {
	const { id } = req.params;
	try {
		const instructor = await pool.query(
			'SELECT * FROM instructores WHERE id = $1 AND fechabaja IS NULL',
			[id]
		);

		if (instructor.rows.length === 0) {
			return res.status(404).json({ error: 'Instructor no encontrado' });
		}

		res.json(instructor.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener el instructor' });
	}
};

// Actualizar instructor
export const updateInstructor = async (req, res) => {
	const { id } = req.params;
	const { nombre, especialidad, telefono, email, apellidos } = req.body;

	try {
		// Validar que el email no se repita en otro instructor
		const checkEmail = await pool.query(
			'SELECT * FROM instructores WHERE email = $1 AND id != $2 AND fechabaja IS NULL',
			[email, id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otro instructor' });
		}

		const updatedInstructor = await pool.query(
			`UPDATE instructores 
             SET nombre = $1, especialidad = $2, telefono = $3, email = $4, apellidos = $6
             WHERE id = $5 AND fechabaja IS NULL
             RETURNING *`,
			[nombre, especialidad, telefono, email, id, apellidos]
		);

		if (updatedInstructor.rows.length === 0) {
			return res
				.status(404)
				.json({ error: 'Instructor no encontrado o ya dado de baja' });
		}

		res.json({ instructor: updatedInstructor.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar el instructor' });
	}
};

// Baja lógica (fecha de baja)
export const deleteInstructor = async (req, res) => {
	const { id } = req.params;
	try {
		const deletedInstructor = await pool.query(
			'UPDATE instructores SET fechabaja = NOW() WHERE id = $1 RETURNING *',
			[id]
		);

		if (deletedInstructor.rows.length === 0) {
			return res.status(404).json({ error: 'Instructor no encontrado' });
		}

		res.json({
			message: 'Instructor eliminado (baja lógica)',
			instructor: deletedInstructor.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar el instructor' });
	}
};

//CAMBIAR SOLO CONTRASEÑA
export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
	try {
		
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updateInstructor = await pool.query(
			`UPDATE instructores SET password = $1 WHERE id = $2`,
			[hashedPassword, id]
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
