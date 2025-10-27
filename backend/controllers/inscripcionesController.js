
import pool from '../db.js';

// Inscribir usuario a clase
export const createInscripcion = async (req, res) => {
	const { usuario_id, clase_id } = req.body;

	try {
		const clase = await pool.query(
			'SELECT * FROM clases WHERE id = $1 AND fechabaja IS NULL',
			[clase_id]
		);
		if (clase.rows.length === 0) {
			return res.status(404).json({ error: 'Clase no encontrada' });
		}

		const inscripcionExist = await pool.query(
			'SELECT * FROM inscripciones WHERE usuario_id = $1 AND clase_id = $2 AND fechabaja IS NULL',
			[usuario_id, clase_id]
		);
		if (inscripcionExist.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'Usuario ya inscrito en esta clase' });
		}

		const count = await pool.query(
			'SELECT COUNT(*) FROM inscripciones WHERE clase_id = $1 AND fechabaja IS NULL',
			[clase_id]
		);
		if (parseInt(count.rows[0].count) >= clase.rows[0].capacidad) {
			return res
				.status(400)
				.json({ error: 'Clase llena, no se puede inscribir más usuarios' });
		}

		const newInscripcion = await pool.query(
			'INSERT INTO inscripciones (usuario_id, clase_id) VALUES ($1, $2) RETURNING *',
			[usuario_id, clase_id]
		);

		res.json({
			message: 'Usuario inscrito correctamente',
			inscripcion: newInscripcion.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al inscribir usuario' });
	}
};

// Obtener todas las inscripciones activas
export const getAllInscripciones = async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT i.id, i.fecha_inscripcion, 
              u.nombre AS usuario, 
              c.nombre AS clase, 
              ins.nombre AS instructor
       FROM inscripciones i
       JOIN usuarios u ON i.usuario_id = u.id
       JOIN clases c ON i.clase_id = c.id
       JOIN instructores ins ON c.id_instructor = ins.id
       WHERE i.fechabaja IS NULL
       ORDER BY i.fecha_inscripcion ASC`
		);
		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener inscripciones' });
	}
};

// Obtener inscripciones de un usuario
export const getInscripcionesByUsuario = async (req, res) => {
	const { usuario_id } = req.params;
	try {
		const result = await pool.query(
			`SELECT i.id, i.fecha_inscripcion, 
				c.nombre AS clase, 
				ins.nombre AS instructor
			FROM inscripciones i
			JOIN clases c ON i.clase_id = c.id
			JOIN instructores ins ON c.id_instructor = ins.id
			WHERE i.usuario_id = $1 AND i.fechabaja IS NULL`,
			[usuario_id]
		);
		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: 'Error al obtener inscripciones del usuario' });
	}
};

// Cancelar inscripción (baja lógica)
export const deleteInscripcion = async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query(
			'UPDATE inscripciones SET fechabaja = NOW() WHERE id = $1 RETURNING *',
			[id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Inscripción no encontrada' });
		}

		res.json({
			message: 'Inscripción cancelada correctamente',
			inscripcion: result.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al cancelar la inscripción' });
	}
};
