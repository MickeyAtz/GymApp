import pool from '../db.js';
import moment from 'moment';
import PDFDocument from 'pdfkit';

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

export const getReportePagos = async (req, res) => {
	const { fecha_inicio, fecha_fin } = req.query;

	if (!fecha_inicio || !fecha_fin)
		return res
			.status(400)
			.json({ error: 'Se requieren fecha de inicio y fecha de fin.' });

	try {
		const pagosResult = await pool.query(
			`SELECT 
				p.id AS pago_id,
				p.monto,
				p.tipo_pago,
				p.fecha_pago,
				u.nombre AS cliente_nombre,
				u.apellidos AS cliente_apellidos,
				m.nombre AS membresia_nombre
			FROM pagos p 
			JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
			JOIN usuarios u ON um.usuario_id = u.id
			JOIN membresias m ON um.membresia_id = m.id
			WHERE DATE(p.fecha_pago) BETWEEN $1 AND $2
			ORDER BY p.fecha_pago ASC
			`,
			[fecha_inicio, fecha_fin]
		);

		const totalResult = await pool.query(
			`
				SELECT COALESCE(SUM(monto), 0) AS total_ingresos
				FROM pagos
				WHERE DATE(fecha_pago) BETWEEN $1 AND $2
			`,
			[fecha_inicio, fecha_fin]
		);

		res.json({
			pagos: pagosResult.rows,
			total_ingresos: parseFloat(totalResult.rows[0].total_ingresos),
			fecha_inicio,
			fecha_fin,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'Error al generar el reporte de pagos.', error });
	}
};

export const generarReportePDF = async (req, res) => {
	const { fecha_inicio, fecha_fin } = req.query;

	if (!fecha_inicio || !fecha_fin)
		return res
			.status(400)
			.json({ error: 'Se requieren fecha de inicio y fecha de fin.' });

	try {
		const { rows: pagos } = await pool.query(
			`
				SELECT
					p.fecha_pago,
					u.nombre,
					u.apellidos,
					m.nombre AS membresia,
					p.tipo_pago,
					p.monto
				FROM pagos p
				JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
				JOIN usuarios u ON usuario_id = u.id
				JOIN membresias m ON um.membresia_id = m.id
				WHERE DATE(p.fecha_pago) BETWEEN $1 AND $2
				ORDER BY p.fecha_pago ASC
			`,
			[fecha_inicio, fecha_fin]
		);
		const { rows: totalRows } = await pool.query(
			`SELECT COALESCE(SUM(monto), 0) AS total_ingresos FROM pagos
				WHERE DATE(fecha_pago) BETWEEN $1 AND $2
			`,
			[fecha_inicio, fecha_fin]
		);

		const total = parseFloat(totalRows[0].total_ingresos);

		const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

		res.setHeader(
			'Content-Disposition',
			`attachment; filename = "reporte_pagos_${fecha_inicio}_al_${fecha_fin}.pdf"`
		);

		res.setHeader('Content-Type', 'application/pdf');
		doc.pipe(res);

		// CONTENIDO DEL PDF
		doc.rect(0, 0, doc.page.width, doc.page.height).fill('#121212');
		doc.fontSize(18).fillColor('#FFD700').text('Reporte de Ingresos', {
			align: 'center',
		});

		doc.moveDown(0.5);
		doc
			.fontSize(12)
			.fillColor('#FFFFFF')
			.text(
				`Periodo: ${moment(fecha_inicio).format(
					'DD/MM/YYYY'
				)} - ${moment(fecha_fin).format('DD/MM/YYYY')}`
			);
		doc
			.fontSize(14)
			.fillColor('#FFD700')
			.text(`Total de Ingresos: $${total.toFixed(2)}`, { align: 'right' });

		doc.moveDown(1);

		const yInicioTabla = doc.y;
		doc.fontSize(10).fillColor('#FFFFFF');
		doc.text('Fecha', 50, yInicioTabla, { width: 80, lineBreak: false });
		doc.text('Cliente', 130, yInicioTabla, { width: 150, lineBreak: false });
		doc.text('Membresía', 280, yInicioTabla, { width: 100, lineBreak: false });
		doc.text('Tipo Pago', 380, yInicioTabla, { width: 80, lineBreak: false });
		doc.text('Monto', 500, yInicioTabla, { width: 60, align: 'right' });
		doc
			.strokeColor('#FFD700')
			.moveTo(50, doc.y + 5)
			.lineTo(560, doc.y + 5)
			.stroke();
		doc.moveDown(0.5);

		for (const pago of pagos) {
			const y = doc.y;
			doc
				.fontSize(9)
				.fillColor('#DDDDDD')
				.text(moment(pago.fecha_pago).format('DD/MM/YY HH:mm'), 50, y, {
					width: 80,
				});
			doc.text(`${pago.nombre} ${pago.apellidos || ''}`, 130, y, {
				width: 150,
			});
			doc.text(pago.membresia, 280, y, { width: 100 });
			doc.text(pago.tipo_pago, 380, y, { width: 80 });
			doc.text(`$${parseFloat(pago.monto).toFixed(2)}`, 500, y, {
				width: 60,
				align: 'right',
			});
			doc.moveDown(0.5);
		}
		// --- Fin del PDF ---
		doc.end();
	} catch (error) {
		console.error('Error al generar PDF de pagos: ', error);
		res.status(500).json({ error: 'Error al generar el PDF.' });
	}
};

// OBTENER INFORMACIÓN DE PAGOS DE CLIENTE
export const getMiHistorialPagos = async (req, res) => {
	const { perfil_id: usuarioId } = req.user; // <-- Obtenemos el ID del token

	try {
		// Es la misma lógica que getPagosByUsuarioId, pero usando el ID del token
		const pagos = await pool.query(
			`SELECT p.id AS pago_id, p.monto, p.tipo_pago, p.fecha_pago,
				um.id AS usuario_membresia_id, um.fecha_inicio, um.fecha_fin,
				m.id AS membresia_id, m.nombre AS membresia_nombre
			FROM pagos p
			JOIN usuario_membresia um ON p.usuario_membresia_id = um.id
			JOIN membresias m ON um.membresia_id = m.id
			WHERE um.usuario_id = $1
			ORDER BY p.fecha_pago DESC`,
			[usuarioId] // <-- Usamos el ID seguro del token
		);
		res.json(pagos.rows);
	} catch (error) {
		console.error('Error al obtener mi historial de pagos:', error);
		res.status(500).json({ error: 'Error al obtener los pagos' });
	}
};
