import pool from '../db.js';
import moment from 'moment';

/**
 * KPI 1: Obtiene el estado de la membresía activa.
 * (Esta función estaba correcta, usaba perfil_id correctamente)
 */
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

/**
 * KPI 2: Obtiene la próxima clase agendada del usuario.
 * CORREGIDO:
 * 1. Usa 'perfil_id' en lugar de 'id'.
 * 2. La consulta SQL ahora calcula el día de la semana actual y lo compara
 * con el día (string) de la clase para encontrar la próxima clase real.
 */
export const getProximaClase = async (req, res) => {
	// --- CORRECCIÓN 1: Usar perfil_id ---
	const { perfil_id: usuarioId } = req.user;

	try {
		// --- CORRECCIÓN 2: Consulta SQL robusta ---
		const { rows } = await pool.query(
			`
            WITH mis_clases AS (
                SELECT 
                    c.nombre AS clase_nombre,
                    c.hora,
                    c.dia,
                    ins.nombre AS instructor_nombre,
                    ins.apellidos AS instructor_apellidos,
                    -- Mapea el día de la clase (string) a un número (0=Domingo, 1=Lunes...)
                    CASE 
                        WHEN c.dia = 'Domingo' THEN 0
                        WHEN c.dia = 'Lunes' THEN 1
                        WHEN c.dia = 'Martes' THEN 2
                        WHEN c.dia = 'Miercoles' THEN 3
                        WHEN c.dia = 'Jueves' THEN 4
                        WHEN c.dia = 'Viernes' THEN 5
                        WHEN c.dia = 'Sabado' THEN 6
                    END AS clase_dow
                FROM inscripciones i
                JOIN clases c ON i.clase_id = c.id 
                JOIN instructores ins ON c.id_instructor = ins.id 
                WHERE
                    i.usuario_id = $1
                    AND i.fechabaja IS NULL -- Inscripción activa
                    AND c.fechabaja IS NULL -- Clase activa
            ),
            calculos_hoy AS (
                SELECT 
                    EXTRACT(DOW FROM NOW()) AS hoy_dow, -- Día de la semana (num)
                    NOW()::time AS ahora_time
            )
            -- Selecciona la próxima clase
            SELECT * FROM mis_clases
            WHERE 
                -- Opción 1: La clase es más tarde hoy
                (clase_dow = (SELECT hoy_dow FROM calculos_hoy) AND hora > (SELECT ahora_time FROM calculos_hoy))
                OR
                -- Opción 2: La clase no es hoy (así la ordenamos)
                (clase_dow != (SELECT hoy_dow FROM calculos_hoy))
            ORDER BY
                -- Esta fórmula ordena por el "siguiente" día de la semana,
                -- manejando el salto de Sábado (6) a Domingo (0).
                (clase_dow - (SELECT hoy_dow FROM calculos_hoy) + 7) % 7 ASC,
                hora ASC
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
		// Formateamos la hora a un formato legible
		const horaFormateada = moment(proximaClase.hora, 'HH:mm:ss').format(
			'h:mm A'
		);

		return res.json({
			tieneProxima: true,
			mensaje: `${proximaClase.clase_nombre} - ${proximaClase.dia} ${horaFormateada}`,
			instructor: `${proximaClase.instructor_nombre} ${proximaClase.instructor_apellidos}`,
		});
	} catch (error) {
		console.error('Error al obtener próxima clase:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener próxima clase.' });
	}
};

/**
 * KPI 3: Obtiene el total de asistencias en el mes actual.
 * CORREGIDO: Usa 'perfil_id' en lugar de 'id'.
 */
export const getAsistenciasMes = async (req, res) => {
	// --- CORRECCIÓN: Usar perfil_id ---
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

/**
 * KPI 4: Obtiene los datos para la gráfica de asistencias.
 * CORREGIDO: Usa 'perfil_id' en lugar de 'id'.
 */
export const getGraficaAsistencias = async (req, res) => {
	// --- CORRECCIÓN: Usar perfil_id ---
	const { perfil_id: usuarioId } = req.user;

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
                    usuario_id = $1
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

		const data = rows[0]?.chart_data || { labels: [], data: [] };
		return res.json(data);
	} catch (error) {
		console.error('Error al obtener gráfica de asistencias:', error);
		return res
			.status(500)
			.json({ message: 'Error en el servidor al obtener gráfica.' });
	}
};
