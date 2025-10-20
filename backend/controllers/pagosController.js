

import pool from '../db.js';

//Creación del pago
//Para la creación del pago es necesario tener usuario y membresia para poder realizar dos inserciones
//La primera inserción es en usuario_membresia y la segunda en pagos.
// Utilizamos el rollback para asegurarnos que si una de las dos inserciones falla, no se realice el pago
// De otra manera, al final realizamos un commit para guardar todos los cambios.
export const createPago = async (req, res) => {
	const { usuario_id, membresia_id, monto, tipo_pago } = req.body;
	const cliente = await pool.connect();

	try {
		await cliente.query('BEGIN');

		// Obtener duración de la membresía
		const membresiaResult = await cliente.query(
			'SELECT * FROM membresias WHERE id = $1',
			[membresia_id]
		);

		if (membresiaResult.rows.length === 0) {
			await cliente.query('ROLLBACK');
			return res.status(404).json({ error: 'Membresía no encontrada' });
		}

		const duracion_dias = membresiaResult.rows[0].duracion_dias;

		// Revisar si hay membresía activa
		const activoResult = await cliente.query(
			`SELECT * FROM usuario_membresia
			WHERE usuario_id = $1 AND status = 'activo' AND DATE(fecha_fin) >= CURRENT_DATE
			ORDER BY fecha_fin DESC LIMIT 1`,
			[usuario_id]
		);

		const fecha_inicio =
			activoResult.rows.length > 0
				? new Date(activoResult.rows[0].fecha_fin + 1)
				: new Date();

		const fecha_fin = new Date(fecha_inicio);
		fecha_fin.setDate(fecha_fin.getDate() + duracion_dias);

		// Crear usuario_membresia
		const usuarioMembresia = await cliente.query(
			'INSERT INTO usuario_membresia (usuario_id, membresia_id, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4) RETURNING *',
			[usuario_id, membresia_id, fecha_inicio, fecha_fin]
		);

		// Crear pago
		const newPago = await cliente.query(
			'INSERT INTO pagos (usuario_membresia_id, monto, tipo_pago) VALUES ($1, $2, $3) RETURNING *',
			[usuarioMembresia.rows[0].id, monto, tipo_pago]
		);

		await cliente.query('COMMIT');
		res.json({
			message: 'Pago y membresía registrados exitosamente',
			usuarioMembresia: usuarioMembresia.rows[0],
			pago: newPago.rows[0],
		});
	} catch (error) {
		await cliente.query('ROLLBACK');
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	} finally {
		cliente.release();
	}
};

export const getPagosByUsuarioId = async (req, res) => {
	const { usuario_id } = req.params;
	try {
		const pagos = await pool.query(
			`SELECT p.id AS pago_id, p.monto, p.tipo_pago, p.fecha_pago,
				um.id AS usuario_membresia_id, um.fecha_inicio, um.fecha_fin,
				m.id AS membresia_id, m.nombre AS membresia_nombre
			FROM pagos p
			JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
			JOIN membresias m ON um.membresia_id = m.id
			WHERE um.usuario_id = $1
			ORDER BY p.fecha_pago DESC`,
			[usuario_id]
		);
		res.json(pagos.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los pagos' });
	}
};

export const getAllPagos = async (req, res) => {
	try {
		const pagos = await pool.query(
			`SELECT p.*, um.usuario_id, um.membresia_id
			FROM pagos p
			JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
			ORDER BY p.fecha_pago DESC`
		);
		res.json(pagos.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los pagos' });
	}
};

//OBTENER TODOS LOS PAGOS POR RANGO DE FECHAS
export const getAllPagosByFecha = async (req, res) => {
	const { fecha_inicio, fecha_fin } = req.params;
	try {
		const pagos = await pool.query(
			` SELECT p.*, um.usuario_id, um.membresia_id
            FROM pagos p
            JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
            WHERE DATE(p.fecha_pago) BETWEEN $1 AND $2
            ORDER BY p.fecha_pago DESC
			`,
			[fecha_inicio, fecha_fin]
		);
		res.json({ finicio: fecha_inicio, ffinal: fecha_fin, pagos: pagos.rows });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener la información de pagos' });
	}
};

// OBTENER TODOS LOS PAGOS POR RANGO DE FECHAS E ID DEL USUARIO
export const getPagosByUsuarioIdAndFecha = async (req, res) => {
	const { usuario_id, fecha_inicio, fecha_fin } = req.params;
	try {
		const pagos = await pool.query(
			`
			SELECT p.*, um.usuario_id, um.membresia_id
            FROM pagos p
            JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
            WHERE DATE(p.fecha_pago) BETWEEN $1 AND $2
			AND um.usuario_id = $3
            ORDER BY p.fecha_pago DESC`,
			[fecha_inicio, fecha_fin, usuario_id]
		);
		res.json(pagos.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener la información de pagos' });
	}
};
