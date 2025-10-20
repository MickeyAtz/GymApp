
import pool from '../db.js';

//Creación de la membresia
export const createMembresia = async (req, res) => {
	const { nombre, duracion_dias, precio, activo } = req.body;

	try {
		const newMembresia = await pool.query(
			'INSERT INTO membresias (nombre, duracion_dias, precio, activo) VALUES ($1, $2, $3, $4) RETURNING *',
			[nombre, duracion_dias, precio, activo]
		);
		res.json({ membresia: newMembresia.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al crear la membresía' });
	}
};

//Obtener todas las membresias
export const getAllMembresias = async (req, res) => {
	try {
		const membresias = await pool.query(
			'SELECT * FROM membresias WHERE fecha_baja IS NULL'
		);
		res.json(membresias.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener las membresías' });
	}
};

//Actualizar membresia
export const updateMembresia = async (req, res) => {
	const { id } = req.params;
	const { nombre, duracion_dias, precio, activo } = req.body;
	try {
		const updateMembresia = await pool.query(
			'UPDATE membresias SET nombre = $1, duracion_dias = $2, precio = $3, activo = $4 WHERE id = $5 RETURNING * ',
			[nombre, duracion_dias, precio, activo, id]
		);
		res.json({ membresia: updateMembresia.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al editar la membresía' });
	}
};

//Eliminar membresia
export const deleteMembresia = async (req, res) => {
	const { id } = req.params;
	try {
		const deleteMembresia = await pool.query(
			'UPDATE membresias SET fecha_baja = NOW() WHERE id = $1 RETURNING *',
			[id]
		);
		res.json({
			message: 'Membresia eliminada',
			membresia: deleteMembresia.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar la membresía' });
	}
};
