import pool from '../db.js';
import moment from 'moment';

export const totalusuarios = async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT COUNT(*) AS total FROM usuarios WHERE fecha_baja IS NULL'
		);
		res.json({ totalUsuarios: parseInt(result.rows[0].total) });
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener total de usuarios' });
	}
};

export const nuevosUsuarios = async (req, res) => {
	try {
		const ahora = new Date();
		const mes = ahora.toLocaleString('es-ES', { month: 'long' });
		const anio = ahora.getFullYear();

		const result = await pool.query(`
                SELECT COUNT(*) AS total
                FROM usuarios
                WHERE fecha_registro >= DATE_TRUNC('month', CURRENT_DATE)
                  AND fecha_registro < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            `);
		res.json({
			nuevosUsuarios: parseInt(result.rows[0].total),
			mes: mes.charAt(0).toUpperCase() + mes.slice(1),
			anio: anio,
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener usuarios nuevos del mes' });
	}
};

export const usuariosPorMes = async (req, res) => {
	try {
		const result = await pool.query(`
            WITH meses AS (
                SELECT DATE_TRUNC('month', GENERATE_SERIES(
                    CURRENT_DATE - INTERVAL '11 months',
                    CURRENT_DATE,
                    INTERVAL '1 month'
                )) AS mes_inicio
            )
            SELECT 
                TO_CHAR(m.mes_inicio, 'Mon YYYY') AS mes,
                COUNT(u.id) AS total
            FROM meses m
            LEFT JOIN usuarios u ON DATE_TRUNC('month', u.fecha_registro) = m.mes_inicio
                                 AND u.fecha_baja IS NULL
            GROUP BY m.mes_inicio
            ORDER BY m.mes_inicio ASC;
            `);

		res.json({
			labels: result.rows.map((r) => r.mes.trim()),
			data: result.rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		console.error('Error en usuariosPorMes:', error);
		res.status(500).json({ error: 'Error al obtener usuarios por mes' });
	}
};

export const totalMembresiasMes = async (req, res) => {
	try {
		const ahora = new Date();
		const mes = ahora.toLocaleString('es-Es', { month: 'long' });
		const anio = ahora.getFullYear();

		const result = await pool.query(`
                SELECT COALESCE(SUM(p.monto), 0) AS total
                FROM pagos p
                WHERE p.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
                  AND p.fecha_pago < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            `);

		res.json({
			totalMembresias: parseFloat(result.rows[0].total), // El frontend lo lee como 'totalMembresias'
			mes: mes.charAt(0).toUpperCase() + mes.slice(1),
			anio: anio,
		});
	} catch (error) {
		res
			.status(500)
			.json({ error: 'Error al obtener total de membresias al mes' });
	}
};

export const totalMembresiasActivas = async (req, res) => {
	try {
		const result = await pool.query(`
                SELECT COUNT(*) AS total
                FROM usuario_membresia
                WHERE status = 'activo'
                  AND fecha_fin >= CURRENT_DATE
            `);
		res.json({ total: parseInt(result.rows[0].total, 10) }); // El frontend lo lee como 'total'
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener total de membresias' });
	}
};

export const totalClases = async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT COUNT(*) AS total FROM clases WHERE fechabaja IS NULL'
		);
		res.json({ total: parseInt(result.rows[0].total) }); // El frontend lo lee como 'total'
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener total de clases' });
	}
};

export const inscripcionesPorClase = async (req, res) => {
	try {
		const result = await pool.query(`
            SELECT c.nombre AS clase, COUNT(i.id) AS total
            FROM inscripciones i
            JOIN clases c ON i.clase_id = c.id
            WHERE i.fechabaja IS NULL AND c.fechabaja IS NULL
            GROUP BY c.nombre
            ORDER BY total DESC
            LIMIT 10; -- Muestra solo las 10 más populares
        `);
		res.json({
			labels: result.rows.map((r) => r.clase),
			data: result.rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener inscripciones por clase' });
	}
};

// (Las consultas de Visitas ya estaban bien y eran robustas)
export const visitasMes = async (req, res) => {
	try {
		const inicioMes = moment().startOf('month').format('YYYY-MM-DD');
		const finMes = moment().endOf('month').format('YYYY-MM-DD');

		const { rows } = await pool.query(
			`
            WITH dias_mes AS (
                SELECT GENERATE_SERIES($1::date, $2::date, '1 day'::interval) AS dia
            ),
            conteo_diario AS (
                SELECT 
                    DATE_TRUNC('day', fecha_entrada) AS dia,
                    COUNT(*) AS total
                FROM visitas
                WHERE fecha_entrada::date BETWEEN $1 AND $2
                GROUP BY 1
            )
            SELECT 
                TO_CHAR(d.dia, 'DD') AS dia_label,
                COALESCE(cd.total, 0) AS total
            FROM dias_mes d
            LEFT JOIN conteo_diario cd ON d.dia = cd.dia
            ORDER BY d.dia;
            `,
			[inicioMes, finMes]
		);

		res.json({
			labels: rows.map((r) => r.dia_label),
			data: rows.map((r) => parseInt(r.total)),
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Error al obtener visitas mensuales.' });
	}
};

export const visitasSemana = async (req, res) => {
	try {
		const inicioSemana = moment().startOf('week').format('YYYY-MM-DD');
		const finSemana = moment().endOf('week').format('YYYY-MM-DD');

		const { rows } = await pool.query(
			`
            WITH dias_semana AS (
                SELECT 
                    GENERATE_SERIES(0, 6) AS dia_num,
                    TO_CHAR( ($1::date + MAKE_INTERVAL(days => GENERATE_SERIES(0, 6))), 'Day') AS dia_nombre
            ),
            conteo_semanal AS (
                SELECT 
                    EXTRACT(DOW FROM fecha_entrada) AS dia_num,
                    COUNT(*) AS total
                FROM visitas
                WHERE fecha_entrada::date BETWEEN $1 AND $2 
                GROUP BY dia_num
            )
            SELECT 
                TRIM(ds.dia_nombre) AS dia,
                COALESCE(cs.total, 0) AS total
            FROM dias_semana ds
            LEFT JOIN conteo_semanal cs ON ds.dia_num = cs.dia_num
            ORDER BY ds.dia_num;
            `,
			[inicioSemana, finSemana]
		);

		res.json({
			labels: rows.map((r) => r.dia),
			data: rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		console.error('Error al recuperar visitas semanales: ', error);
		res.status(500).json({ message: 'Error al obtener visitas semanales.' });
	}
};
