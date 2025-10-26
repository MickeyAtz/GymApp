import pool from '../db.js';
import moment from 'moment';

export const getProximaClaseInstructor = async (req, res) => {
	const { id: instructorId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT
                c.id, 
                c.nombre AS clase_nombre,
                c.hora,
                c.capacidad
            FROM clases c
            WHERE
                c.id_instructor = $1
                AND c.hora >= NOW()::time 
                -- AND c.dia ILIKE '%' || TO_CHAR(NOW(), 'Dy') || '%' 
            ORDER BY c.hora ASC
            LIMIT 1;
            `,
			[instructorId]
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
			mensaje: `${proximaClase.clase_nombre} - Hoy a las ${horaFormateada}`,
			clase_id: proximaClase.id,
			capacidad: proximaClase.capacidad,
		});
	} catch (error) {
		console.error('Error al obtener próxima clase instructor:', error);
		return res.status(500).json({ message: 'Error en el servidor' });
	}
};

export const getInscritosClase = async (req, res) => {
	const { claseId } = req.params;

	if (isNaN(parseInt(claseId))) {
		return res
			.status(400)
			.json({ message: 'El ID de la clase debe ser un número.' });
	}

	try {
		const { rows } = await pool.query(
			`
            SELECT COUNT(*) AS total_inscritos
            FROM inscripciones
            WHERE clase_id = $1;
            `,
			[parseInt(claseId)]
		);

		const total = parseInt(rows[0]?.total_inscritos || 0, 10);
		return res.json({ total_inscritos: total });
	} catch (error) {
		console.error('Error al obtener inscritos clase:', error);
		return res.status(500).json({ message: 'Error en el servidor' });
	}
};

export const getTotalClasesHoy = async (req, res) => {
	const { id: instructorId } = req.user;

	try {
		const { rows } = await pool.query(
			`
            SELECT COUNT(*) AS total_clases_hoy
            FROM clases
            WHERE
                id_instructor = $1
                AND dia ILIKE '%' || 
                    CASE EXTRACT(DOW FROM NOW()) 
                        WHEN 0 THEN 'Domingo'
                        WHEN 1 THEN 'Lunes'
                        WHEN 2 THEN 'Martes'
                        WHEN 3 THEN 'Miércoles'
                        WHEN 4 THEN 'Jueves'
                        WHEN 5 THEN 'Viernes'
                        WHEN 6 THEN 'Sábado'
                    END 
                || '%' 
                AND fechabaja IS NULL; -- Clases activas
            `,
			[instructorId]
		);

		const total = parseInt(rows[0]?.total_clases_hoy || 0, 10);
		return res.json({ total_clases_hoy: total });
	} catch (error) {
		console.error('Error al obtener total clases hoy:', error);
		return res.status(500).json({ message: 'Error en el servidor' });
	}
};

export const getPopularidadClasesInstructor = async (req, res) => {
	const { id: instructorId } = req.user;

	try {
		const inicioMes = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
		const finMes = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');

		const { rows } = await pool.query(
			`
            WITH conteo_clases AS (
                SELECT 
                    c.nombre AS clase_nombre,
                    COUNT(i.id) AS total_inscritos 
                FROM clases c
                JOIN inscripciones i ON c.id = i.clase_id
                WHERE
                    c.id_instructor = $1
                    AND i.fecha_inscripcion BETWEEN $2 AND $3 -- Inscripciones del mes
                    AND c.fechabaja IS NULL -- Clases activas
                GROUP BY c.nombre 
            )
            SELECT json_build_object(
                'labels', COALESCE(json_agg(clase_nombre ORDER BY total_inscritos DESC), '[]'::json),
                'data', COALESCE(json_agg(total_inscritos ORDER BY total_inscritos DESC), '[]'::json)
            ) AS chart_data
            FROM conteo_clases;
            `,
			[instructorId, inicioMes, finMes]
		);

		const data = rows[0]?.chart_data || { labels: [], data: [] };
		return res.json(data);
	} catch (error) {
		console.error('Error al obtener popularidad clases instructor:', error);
		return res.status(500).json({ message: 'Error en el servidor' });
	}
};
