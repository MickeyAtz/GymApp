import pool from '../db.js';
import moment from 'moment';

//Creación del pago
export const createPago = async (req, res) => {
	const { usuario_id, membresia_id, monto, tipo_pago } = req.body;
	const cliente = await pool.connect();
	
	console.log(req.body);

	try {
		await cliente.query('BEGIN');

		const membresiaResult = await cliente.query(
			'SELECT * FROM membresias WHERE id = $1 AND fecha_baja IS NULL',
			[membresia_id]
		);

		if (membresiaResult.rows.length === 0) {
			await cliente.query('ROLLBACK');
			return res.status(404).json({ error: 'Membresía no encontrada' });
		}

		const duracion_dias_nueva = membresiaResult.rows[0].duracion_dias;
		let dias_restantes_vieja = 0;
		let membresia_vieja_id = null;

		const activoResult = await cliente.query(
			`
				SELECT id, fecha_fin
				FROM usuario_membresia
				WHERE usuario_id = $1
					AND status = 'activo'
					AND fecha_fin >= CURRENT_DATE
				ORDER BY fecha_fin DESC
				LIMIT 1
			`,
			[usuario_id]
		);

		if (activoResult.rows.length > 0) {
			const membresia_vieja = activoResult.rows[0];
			membresia_vieja_id = membresia_vieja.id;

			dias_restantes_vieja = moment(membresia_vieja.fecha_fin).diff(
				moment().startOf('day'),
				'days'
			);

			dias_restantes_vieja = Math.max(0, dias_restantes_vieja);

			console.log(
				`Membresía vieja encontrada (ID: ${membresia_vieja_id}). Días restantes: ${dias_restantes_vieja}`
			);

			await cliente.query(
				`
				UPDATE usuario_membresia 
				SET status = 'expirado'
				WHERE id = $1	
			`,
				[membresia_vieja_id]
			);

			console.log(
				`Membresía vieja (ID: ${membresia_vieja_id}) actualizada a 'expirado'`
			);
		}

		const fecha_inicio_nueva = moment().startOf('day');
		const duracion_total = duracion_dias_nueva + dias_restantes_vieja;
		const fecha_fin_nueva = moment(fecha_inicio_nueva).add(
			duracion_total,
			'days'
		);

		const fecha_inicio_db = fecha_inicio_nueva.toDate();
		const fecha_fin_db = fecha_fin_nueva.toDate();

		console.log(
			`Nueva membresía: Inicio = ${fecha_inicio_nueva.format('YYYY-MM-DD')}, Fin=${fecha_fin_nueva.format('YYYY-MM-DD')}`
		);

		console.log(usuario_id, membresia_id, fecha_inicio_db, fecha_fin_db);

		const usuarioMembresia = await cliente.query(
			`
			INSERT INTO usuario_membresia (usuario_id, membresia_id, fecha_inicio, fecha_fin, status)
			VALUES($1, $2, $3, $4, 'activo')
			RETURNING id, fecha_inicio, fecha_fin`,
			[usuario_id, membresia_id, fecha_inicio_db, fecha_fin_db]
		);
		const nuevaUsuarioMembresiaId = usuarioMembresia.rows[0].id;
		console.log(
			`Nuevo registro usuario_membresia creado (ID: ${nuevaUsuarioMembresiaId}.)`
		);

		const newPago = await cliente.query(
			`INSERT INTO pagos(usuario_membresia_id, monto, tipo_pago, fecha_pago)
			VALUES ($1, $2, $3, NOW())
			RETURNING id, fecha_pago`,
			[nuevaUsuarioMembresiaId, monto, tipo_pago]
		);
		console.log(`Nuevo registro de pago creado (ID: ${newPago.rows[0].id})`);
		await cliente.query('COMMIT');
		console.log('Transacción completada (COMMIT)');

		return res.status(201).json({
			message:
				'Pago y membresía registrados existosamente' +
				(dias_restantes_vieja > 0
					? `(se añadieron ${dias_restantes_vieja} días de la membresía anterior).`
					: '.'),
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
