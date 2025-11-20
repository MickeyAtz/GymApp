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

export const getActiveMembresias = async (req, res) => {
	try {
		const membresias = await pool.query(`
				SELECT * FROM membresias
				WHERE fecha_baja IS NULL 
					AND activo = true
				ORDER BY nombre ASC
				LIMIT 20
			`);
		res.json(membresias.rows);
	} catch (error) {
		console.error('Error al obtener las membresías activas.', error);
		res.status(500).json({ message: 'Error al consultar membresias activas.' });
	}
};

export const getUsuarioMembresiaActiva = async (req, res) => {
	const { usuario_id } = req.params;

	try {
		const result = await pool.query(
			`
				SELECT
					um.id,
					um.fecha_inicio,
					um.fecha_fin,
					um.status,
					m.nombre AS membresia_nombre,
					m.precio,
					(um.fecha_fin - CURRENT_DATE) AS dias_restantes
				FROM usuario_membresia um
				JOIN membresias m ON um.membresia_id = m.id
				WHERE um.usuario_id = $1
					AND um.status = 'activo'
					AND um.fecha_fin >= CURRENT_DATE
				ORDER BY um.fecha_fin DESC
				LIMIT 1
			`,
			[usuario_id]
		);

		if (result.rows.length === 0)
			return res.json({
				activa: false,
				mensaje: 'El usuario no tiene membresía activa.',
			});
		const membresia = result.rows[0];
		res.status(201).json({
			activa: true,
			...membresia,
		});
		
	} catch (error) {
		console.error('Error al obtener membresía activa: ', error);
		res
			.status(500)
			.json({ error: 'Error del servidor al verificar membresía' });
	}
};
