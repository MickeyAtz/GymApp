import pool from '../db.js';

// Crear clase
export const createClase = async (req, res) => {
	const { nombre, descripcion, hora, dia, capacidad, instructor } = req.body;

	try {
		const newClase = await pool.query(
			`INSERT INTO clases (nombre, descripcion, hora, dia, capacidad, id_instructor) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[nombre, descripcion, hora, dia, capacidad, instructor]
		);

		res.json({
			message: 'Clase creada exitosamente',
			clase: newClase.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al crear la clase' });
	}
};

// Obtener todas las clases activas
export const getAllClases = async (req, res) => {
	try {
		const clases = await pool.query(
			`SELECT c.*, i.nombre AS instructor 
             FROM clases c
             LEFT JOIN instructores i ON c.id_instructor = i.id
             WHERE c.fechabaja IS NULL`
		);
		res.json(clases.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener las clases' });
	}
};

// Obtener clase por ID
export const getClaseById = async (req, res) => {
	const { id } = req.params;
	try {
		const clase = await pool.query(
			`SELECT c.*, i.nombre AS instructor 
             FROM clases c
             LEFT JOIN instructores i ON c.id_instructor = i.id
             WHERE c.id = $1 AND c.fechabaja IS NULL`,
			[id]
		);

		if (clase.rows.length === 0) {
			return res.status(404).json({ error: 'Clase no encontrada' });
		}

		res.json(clase.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener la clase' });
	}
};

// Actualizar clase
export const updateClase = async (req, res) => {
	const { id } = req.params;
	const { nombre, descripcion, hora, dia, capacidad, id_instructor } = req.body;

	try {
		const updatedClase = await pool.query(
			`UPDATE clases 
             SET nombre = $1, descripcion = $2, hora = $3, dia = $4, capacidad = $5, id_instructor = $6
             WHERE id = $7 AND fechabaja IS NULL
             RETURNING *`,
			[nombre, descripcion, hora, dia, capacidad, id_instructor, id]
		);

		if (updatedClase.rows.length === 0) {
			return res
				.status(404)
				.json({ error: 'Clase no encontrada o ya dada de baja' });
		}

		res.json({ clase: updatedClase.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar la clase' });
	}
};

// Baja lógica (fecha de baja)
export const deleteClase = async (req, res) => {
	const { id } = req.params;
	try {
		const deletedClase = await pool.query(
			'UPDATE clases SET fechabaja = NOW() WHERE id = $1 RETURNING *',
			[id]
		);

		if (deletedClase.rows.length === 0) {
			return res.status(404).json({ error: 'Clase no encontrada' });
		}

		res.json({
			message: 'Clase eliminada (baja lógica)',
			clase: deletedClase.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar la clase' });
	}
};

