import pool from '../db.js';
import moment from 'moment';

export const getEstadoMembresia = async (req, res) => {
	const { perfil_id: usuarioId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT 
                m.nombre AS membresia_nombre,
                um.fecha_fin, 
                TO_CHAR(um.fecha_fin, 'DD/MM/YYYY') AS fecha_vencimiento_formateada
            FROM usuario_membresia um
            JOIN membresias m ON um.membresia_id = m.id
            WHERE
                um.usuario_id = $1
                AND NOW() BETWEEN um.fecha_inicio AND um.fecha_fin 
                AND um.status = 'activo'
            ORDER BY um.fecha_fin DESC
            LIMIT 1;
            `,
			[usuarioId]
		);

		if (rows.length === 0) {
			return res.json({
				activa: false,
				mensaje: 'Sin membresía activa',
			});
		}

		const membresia = rows[0];
		const diasRestantes = moment(membresia.fecha_fin).diff(moment(), 'days');

		let mensaje = `Membresía ${membresia.membresia_nombre}. `;
		if (diasRestantes > 0) {
			mensaje += `Vence en ${diasRestantes} días (${membresia.fecha_vencimiento_formateada}).`;
		} else if (diasRestantes === 0) {
			mensaje += `Vence Hoy (${membresia.fecha_vencimiento_formateada}).`;
		} else {
			mensaje += `Vencida.`;
		}

		return res.json({
			activa: true,
			mensaje: mensaje,
		});
	} catch (error) {
		console.error('Error al obtener estado de membresía:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener membresía.' });
	}
};

export const getProximaClase = async (req, res) => {
	const { perfil_id: usuarioId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT 
                c.nombre AS clase_nombre,
                c.hora
            FROM inscripciones i
            JOIN clases c ON i.clase_id = c.id
            WHERE i.usuario_id = $1
                AND i.fechabaja IS NULL
                AND c.fechabaja IS NULL
                -- 1. Obtiene el nombre del día de hoy (Ej: 'Lunes')
                AND c.dia = TO_CHAR(NOW(), 'Day')
                -- 2. Filtra solo las clases que aún no han pasado hoy
                AND c.hora > NOW()::time
            ORDER BY c.hora ASC -- Ordena por la más próxima
            LIMIT 1;
            `,
			[usuarioId]
		);

		if (rows.length === 0) {
			return res.json({
				tieneProxima: false,
				mensaje: 'No tienes más clases hoy',
			});
		}

		const proximaClase = rows[0];
		const horaFormateada = moment(proximaClase.hora, 'HH:mm:ss').format(
			'h:mm A'
		);

		return res.json({
			tieneProxima: true,
			mensaje: `${proximaClase.clase_nombre} - Hoy ${horaFormateada}`,
		});
	} catch (error) {
		console.error('Error al obtener próxima clase:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener próxima clase.' });
	}
};

export const getAsistenciasMes = async (req, res) => {
	const { perfil_id: usuarioId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT COUNT(*) AS total_asistencias
            FROM visitas
            WHERE
                usuario_id = $1
                AND fecha_entrada >= DATE_TRUNC('month', NOW()) 
                AND fecha_entrada < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
            `,
			[usuarioId]
		);

		const total = parseInt(rows[0]?.total_asistencias || 0, 10);
		return res.json({ total_asistencias: total });
	} catch (error) {
		console.error('Error al obtener asistencias del mes:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener asistencias.' });
	}
};

export const getGraficaAsistencias = async (req, res) => {
	const { perfil_id: usuarioId } = req.user;

	const inicioMes = moment().startOf('month').format('YYYY-MM-DD');
	const finMes = moment().endOf('month').format('YYYY-MM-DD');

	try {
		const { rows } = await pool.query(
			`
            WITH dias_mes AS (
                SELECT GENERATE_SERIES($2::date, $3::date, '1 day'::interval) AS dia
            ),
            conteo_diario AS (
                SELECT 
                    DATE_TRUNC('day', fecha_entrada) AS dia,
                    COUNT(*) AS total
                FROM visitas
                WHERE
                    usuario_id = $1
                    AND fecha_entrada::date BETWEEN $2 AND $3 
                GROUP BY 1
            )
            SELECT 
                TO_CHAR(d.dia, 'DD') AS dia_label,
                COALESCE(cd.total, 0) AS total
            FROM dias_mes d
            LEFT JOIN conteo_diario cd ON d.dia = cd.dia
            ORDER BY d.dia;
            `,
			[usuarioId, inicioMes, finMes]
		);

		res.json({
			labels: rows.map((r) => r.dia_label),
			data: rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		console.error('Error al obtener gráfica de asistencias:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener gráfica.' });
	}
};
