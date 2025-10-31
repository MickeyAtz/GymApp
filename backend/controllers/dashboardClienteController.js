import pool from '../db.js'; // Asegúrate que la ruta a tu conexión DB sea correcta
import moment from 'moment'; // Necesitas moment para las fechas

/**
 * KPI 1: Obtiene el estado de la membresía activa del usuario logueado.
 * Corrige la consulta para usar las fechas y el status de 'usuario_membresia'.
 */
export const getEstadoMembresia = async (req, res) => {
	// req.user viene del middleware verifyToken
	const { perfil_id: usuarioId } = req.user;
	console.log('Usuario ID para membresía:', usuarioId);
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

		console.log(rows);

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
			mensaje += `Vencida recientemente.`;
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
	const { id: usuarioId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT 
                c.nombre AS clase_nombre,
                c.hora, 
                ins.nombre AS instructor_nombre,
                ins.apellidos AS instructor_apellidos
            FROM inscripciones i
            JOIN clases c ON i.clase_id = c.id 
            JOIN instructores ins ON c.id_instructor = ins.id 
            WHERE
                i.usuario_id = $1
                AND c.hora >= NOW()::time
            ORDER BY c.hora ASC
            LIMIT 1;
            `,
			[usuarioId]
		);

		if (rows.length === 0) {
			return res.json({
				tieneProxima: false,
				mensaje: 'No tienes clases agendadas',
			});
		}

		const proximaClase = rows[0];
		const fechaFormateada = moment(proximaClase.hora).calendar();

		return res.json({
			tieneProxima: true,
			mensaje: `${proximaClase.clase_nombre} - ${fechaFormateada}`,
			instructor: `${proximaClase.instructor_nombre} ${proximaClase.instructor_apellidos}`,
		});
	} catch (error) {
		console.error('Error al obtener próxima clase:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener próxima clase.' });
	}
};

export const getAsistenciasMes = async (req, res) => {
	const { id: usuarioId } = req.user;

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
	const { id: usuarioId } = req.user;

	// Calcula inicio y fin de mes una sola vez
	const inicioMes = moment().startOf('month').format('YYYY-MM-DD');
	const finMes = moment().endOf('month').format('YYYY-MM-DD');

	try {
		const { rows } = await pool.query(
			`
            WITH conteo_diario AS (
                SELECT 
                    CAST(TO_CHAR(fecha_entrada, 'DD') AS INTEGER) AS dia,
                    COUNT(*) AS total
                FROM visitas
                WHERE
                    usuario_id = $1   -- Filtro por el cliente logueado
                    AND fecha_entrada::date BETWEEN $2 AND $3 
                GROUP BY dia 
            )
            SELECT json_build_object(
                'labels', COALESCE(json_agg(dia ORDER BY dia ASC), '[]'::json),
                'data', COALESCE(json_agg(total ORDER BY dia ASC), '[]'::json)
            ) AS chart_data
            FROM conteo_diario; 
            `,
			[usuarioId, inicioMes, finMes]
		);

		// Devolvemos el objeto chart_data o un objeto vacío si no hay resultados
		// COALESCE en SQL ya asegura que labels/data no sean null, sino arrays vacíos '[]'
		const data = rows[0]?.chart_data || { labels: [], data: [] };

		return res.json(data); // Enviamos { labels: [...], data: [...] }
	} catch (error) {
		console.error('Error al obtener gráfica de asistencias:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener gráfica.' });
	}
};
