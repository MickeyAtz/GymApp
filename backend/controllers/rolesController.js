
import pool from '../db.js';

// Crear rol
export const createRol = async (req, res) => {
	const { nombre } = req.body;

	try {
		const newRol = await pool.query(
			`INSERT INTO roles (nombre) VALUES ($1) AND fecha_baja IS NULL RETURNING * `,
			[nombre]
		);

		res.json({
			message: 'Rol creado exitosamente.',
			instructor: newRol.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al crear el rol' });
	}
};

// Obtener todos los roles activos
export const getAllRoles = async (req, res) => {
	try {
		const roles = await pool.query(
			'SELECT * FROM roles WHERE fecha_baja IS NULL'
		);
		res.json(roles.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los roles' });
	}
};

// Obtener rol por ID
export const getRolbyId = async (req, res) => {
	const { id } = req.params;
	try {
		const rol = await pool.query(
			'SELECT * FROM roles WHERE id = $1 AND fecha_baja IS NULL',
			[id]
		);

		if (rol.rows.length === 0) {
			return res.status(404).json({ error: 'Rol no encontrado' });
		}

		res.json(rol.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener el rol' });
	}
};

// Actualizar rol
export const updateRol = async (req, res) => {
	const { id } = req.params;
	const { nombre } = req.body;

	try {
		const updatedRol = await pool.query(
			`UPDATE rol 
             SET nombre = $1
             WHERE id = $2 AND fechabaja IS NULL
             RETURNING *`,
			[nombre, id]
		);

		if (updatedRol.rows.length === 0) {
			return res
				.status(404)
				.json({ error: 'Rol no encontrado o ya dado de baja' });
		}

		res.json({ rol: updatedRol.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar el rol' });
	}
};

// Baja lógica (fecha de baja)
export const deleteRol = async (req, res) => {
	const { id } = req.params;
	try {
		const deleteRol = await pool.query(
			'UPDATE rol SET fechabaja = NOW() WHERE id = $1 RETURNING *',
			[id]
		);

		if (deleteRol.rows.length === 0) {
			return res.status(404).json({ error: 'Rol no encontrado' });
		}

		res.json({
			message: 'Rol eliminado (baja lógica)',
			instructor: deleteRol.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar el rol' });
	}
};
