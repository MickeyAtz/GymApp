import pool from '../db.js';
import bcrypt from 'bcrypt';

// =================================================================
//   Funciones de ADMIN (Gestión de Instructores)
// =================================================================

// POST /api/instructores/register
// Necesita: req.body (datos del instructor), req.user.perfil_id (empleado_id)
// Descripción: Registra un nuevo instructor y su cuenta de acceso usando un SP.
export const createInstructor = async (req, res) => {
	const { perfil_id: empleado_id } = req.user;
	const { nombre, especialidad, telefono, email, apellidos, password } =
		req.body;

	try {
		const instructorExist = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1',
			[email]
		);

		if (instructorExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El email ya está registrado.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		await pool.query(`CALL registrar_instructor($1, $2, $3, $4, $5, $6, $7)`, [
			nombre,
			apellidos,
			especialidad,
			telefono,
			empleado_id,
			email,
			hashedPassword,
		]);

		return res.status(200).json({ message: 'Instructor creado exitosamente' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al crear el instructor' });
	}
};

// GET /api/instructores
// Necesita: -
// Descripción: Obtiene todos los instructores activos desde la vista v_instructores.
export const getAllInstructores = async (req, res) => {
	try {
		const instructores = await pool.query('SELECT * FROM v_instructores');
		return res.json(instructores.rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener los instructores' });
	}
};

// GET /api/instructores/:id
// Necesita: req.params.id
// Descripción: Obtiene un instructor específico por su ID desde la vista.
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

// PUT /api/instructores/:id
// Necesita: req.params.id, req.body (datos a actualizar, incluye ca_id)
// Descripción: Actualiza los datos de un instructor usando un SP.
export const updateInstructor = async (req, res) => {
	const { id } = req.params;
	const { nombre, especialidad, telefono, email, apellidos, ca_id } = req.body;

	try {
		const checkEmail = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1 AND id != $2',
			[email, ca_id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otra cuenta' });
		}

		await pool.query(`CALL modificar_instructor($1, $2, $3, $4, $5, $6)`, [
			id,
			nombre,
			apellidos,
			telefono,
			especialidad,
			email,
		]);

		return res.json({ message: 'Instructor actualizado exitosamente. ' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al actualizar el instructor' });
	}
};

// PUT /api/instructores/:id/baja
// Necesita: req.params.id
// Descripción: Realiza la baja lógica de un instructor usando una función de DB.
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

// PUT /api/instructores/:id/passwordChange
// Necesita: req.params.id, req.body.password
// Descripción: Cambia la contraseña de la cuenta de un instructor usando una función.
export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
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

// =================================================================
//   Funciones de INSTRUCTOR (Gestión de "Mis Clases")
// =================================================================

// GET /api/instructores/mis-clases
// Necesita: req.user.perfil_id (del token de instructor)
// Descripción: Obtiene la lista de clases del instructor logueado, con conteo de inscritos.
export const getMisClases = async (req, res) => {
	const instructor_id = req.user.perfil_id;

	try {
		const { rows } = await pool.query(
			`
                SELECT 
                    c.*,
                    (SELECT COUNT(*) FROM inscripciones i WHERE i.clase_id = c.id AND i.fechabaja IS NULL) AS inscritos
                FROM clases c
                WHERE c.id_instructor = $1 AND c.fechabaja IS NULL
                ORDER BY c.dia, c.hora
            `,
			[instructor_id]
		);
		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener las clases.' });
	}
};

// GET /api/instructores/mis-clases/alumnos/:clase_id
// Necesita: req.params.clase_id, req.user.perfil_id (del token)
// Descripción: Obtiene la lista de alumnos inscritos en una clase específica del instructor.
export const getAlumnosDeMiClase = async (req, res) => {
	const { clase_id } = req.params;

	try {
		const { rows } = await pool.query(
			`
                SELECT 
					u.nombre,
					u.apellidos,
					ca.email,
					i.id AS inscripcion_id,
					i.fecha_inscripcion
				FROM inscripciones i
				JOIN usuarios u ON i.usuario_id = u.id
				JOIN cuentas_acceso ca ON u.id = ca.usuario_id 
				JOIN clases c ON i.clase_id = c.id
				WHERE i.clase_id = $1          
				AND u.fecha_baja IS NULL     
				AND i.fechabaja IS NULL      
				AND c.fechabaja IS NULL;
            `,
			[clase_id] 
		);

		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al obtener los clientes.' });
	}
};

// PUT /api/instructores/mis-clases/alumnos/:id_inscripcion
// Necesita: req.params.id_inscripcion, req.user.perfil_id (del token)
// Descripción: Da de baja a un alumno de una clase (baja lógica en inscripciones).
export const eliminarAlumnoDeClase = async (req, res) => {
	const { id_inscripcion } = req.params;
	const instructor_id = req.user.perfil_id;

	try {
		// Corregido: Añadida validación de seguridad
		const { rows, rowCount } = await pool.query(
			`
				UPDATE inscripciones
				SET fechabaja = NOW() 
				WHERE id = $1
				AND clase_id IN (
					SELECT id FROM clases 
					WHERE id_instructor = $2
				)
				RETURNING *
            `,
			[id_inscripcion, instructor_id]
		);

		if (rowCount === 0) {
			return res.status(404).json({
				error: 'Inscripción no encontrada o no tienes permiso para esta acción',
			});
		}

		return res.json({ message: 'Cliente eliminado de la clase' });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'Error al eliminar el cliente de la clase.' });
	}
};

// POST /api/instructores/mis-clases
// Necesita: req.body (datos de la clase), req.user.perfil_id (del token)
// Descripción: Crea una nueva clase y la asigna automáticamente al instructor logueado.
export const createClaseInstructor = async (req, res) => {
	const { nombre, descripcion, hora, dia, capacidad } = req.body;
	const id_instructor = req.user.perfil_id;
	try {
		const newClase = await pool.query(
			`
                INSERT INTO clases
                    (nombre, descripcion, hora, dia, capacidad, id_instructor) -- Corregido
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
			[nombre, descripcion, hora, dia, capacidad, id_instructor]
		);

		return res
			.status(201)
			.json({ clase: newClase.rows[0], message: 'Clase creada exitosamente' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al crear nueva clase' });
	}
};

// PUT /api/instructores/mis-clases/:clase_id
// Necesita: req.params.clase_id, req.body (datos), req.user.perfil_id (del token)
// Descripción: Actualiza una clase, verificando que pertenezca al instructor.
export const updateClaseInstructor = async (req, res) => {
	const { clase_id } = req.params;
	const { nombre, descripcion, hora, dia, capacidad } = req.body;
	const instructor_id = req.user.perfil_id;

	try {
		const { rows, rowCount } = await pool.query(
			`
                UPDATE clases
                   SET nombre = $1,
                       descripcion = $2,
                       hora = $3,
                       dia = $4, 
                       capacidad = $5
                 WHERE id = $6 AND id_instructor = $7 -- (Esto estaba bien)
                 RETURNING *
            `,
			[nombre, descripcion, hora, dia, capacidad, clase_id, instructor_id]
		);
		if (rowCount === 0) {
			return res
				.status(404)
				.json({ error: 'Clase no encontrada o no autorizada.' });
		}

		return res.json({
			clase: rows[0],
			message: 'Clase actualizada exitosamente',
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al actualizar clase' });
	}
};

// DELETE /api/instructores/mis-clases/:clase_id
// Necesita: req.params.clase_id, req.user.perfil_id (del token)
// Descripción: Elimina (baja lógica) una clase, verificando que pertenezca al instructor.
export const deleteClaseInstructor = async (req, res) => {
	const { clase_id } = req.params;
	const instructor_id = req.user.perfil_id;
	try {
		const { rows, rowCount } = await pool.query(
			`
                UPDATE clases
                SET fechabaja = NOW()
                WHERE id = $1 AND id_instructor = $2 -- (Esto estaba bien)
                RETURNING *
            `,
			[clase_id, instructor_id]
		);
		if (rowCount === 0) {
			return res
				.status(404)
				.json({ error: 'Clase no encontrada o no autorizada' });
		}

		return res.json({
			message: 'Clase eliminada (baja lógica)',
			clase: rows[0],
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al eliminar clase' });
	}
};
