
import pool from '../db.js';

export const getAllUsuarioMembresias = async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM usuario_membresia');
		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener las membresias' });
	}
};

export const getUsuarioMembresiaById = async (req, res) => {
	const { usuario_id } = req.params;
	try {
		const result = await pool.query(
			'SELECT * FROM usuario_membresia WHERE usuario_id = $1 ORDER BY fecha_fin DESC',
			[usuario_id]
		);
		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: 'Error al obtener la membresia del usuario' });
	}
};

export const getUsuarioMembresiaActiva = async (req, res) => {
	const { usuario_id } = req.params;
	try {
		const result = await pool.query(
			`SELECT * FROM usuario_membresia 
            WHERE usuario_id = $1 AND status = 'activo'
            ORDER BY fecha_fin DESC LIMIT 1`,
			[usuario_id]
		);

		if (result.rows.length === 0) {
			return res
				.tatus(404)
				.json({ message: 'No se encontró una membresía activa' });
		}

		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error: 'Error al obtener la membresía activa del usuario' });
	}
};
