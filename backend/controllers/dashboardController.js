import pool from '../db.js';
import moment from 'moment';

//OPERACIONES dashboard empleados
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
                WHERE EXTRACT(MONTH FROM fecha_registro) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM fecha_registro) = EXTRACT(YEAR FROM CURRENT_DATE)
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
                SELECT TO_CHAR(fecha_registro, 'Month') AS mes, COUNT(*) AS total
                FROM usuarios
                WHERE fecha_baja IS NULL
                GROUP BY mes, EXTRACT(MONTH FROM fecha_registro)
                ORDER BY EXTRACT(MONTH FROM fecha_registro)
            `);
		res.json({
			labels: result.rows.map((r) => r.mes.trim()),
			data: result.rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener usuarios por mes' });
	}
};

export const totalMembresiasMes = async (req, res) => {
	try {
		const ahora = new Date();
		const mes = ahora.toLocaleString('es-Es', { month: 'long' });
		const anio = ahora.getFullYear();

		const result = await pool.query(`
                SELECT COALESCE(SUM(m.precio), 0) AS total
                FROM usuario_membresia um
                INNER JOIN membresias m ON um.membresia_id = m.id
                WHERE EXTRACT(MONTH FROM um.fecha_inicio) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM um.fecha_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
            `);

		res.json({
			totalMembresias: parseFloat(result.rows[0].total),
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
                WHERE fecha_fin >= CURRENT_DATE
            `);
		res.json({ totalMembresiasActivas: parseInt(result.rows[0].total, 10) });
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener total de membresias' });
	}
};

export const totalClases = async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT COUNT(*) AS total FROM clases WHERE fechabaja IS NULL'
		);
		res.json({ totalClases: parseInt(result.rows[0].total) });
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
            WHERE i.fechabaja IS NULL
            GROUP BY c.nombre
            ORDER BY total DESC
        `);
		res.json({
			labels: result.rows.map((r) => r.clase),
			data: result.rows.map((r) => parseInt(r.total)),
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener inscripciones por clase' });
	}
};

export const estadisticasGenerales = async (req, res) => {
	try {
		const resultUsuarios = await pool.query(
			'SELECT COUNT(*) AS total FROM usuarios WHERE fecha_baja IS NULL'
		);
		const resultClases = await pool.query(
			'SELECT COUNT(*) AS total FROM clases WHERE fechabaja IS NULL'
		);
		const resultNuevos = await pool.query(`
                SELECT COUNT(*) AS total
                FROM usuarios
                WHERE EXTRACT(MONTH FROM fecha_registro) = EXTRACT(MONTH FROM CURRENT_DATE)
            `);

		res.json({
			usuariosActivos: parseInt(resultUsuarios.rows[0].total),
			clasesActivas: parseInt(resultClases.rows[0].total),
			nuevosUsuarios: parseInt(resultNuevos.rows[0].total),
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener estadísticas generales' });
	}
};

export const visitasSemana = async (req, res) => {
	try {
		const inicioSemana = moment().startOf('week').format('YYYY-MM-DD');
		const finSemana = moment().endOf('week').format('YYYY-MM-DD');

		const { rows } = await pool.query(
			`
				SELECT 
				TO_CHAR(fecha_entrada, 'FMDay') AS dia,
				COUNT(*) AS total,
				EXTRACT(DOW FROM fecha_entrada) AS dia_num
				FROM visitas
				WHERE fecha_entrada BETWEEN $1 AND $2
				GROUP BY dia, dia_num
				ORDER BY dia_num;
			`,
			[inicioSemana, finSemana]
		);

		console.log(inicioSemana, finSemana);
		const traduccion = {
			Monday: 'Lunes',
			Tuesday: 'Martes',
			Wednesday: 'Miércoles',
			Thursday: 'Jueves',
			Friday: 'Viernes',
			Saturday: 'Sábado',
			Sunday: 'Domingo',
		};

		const data = rows.map((r) => ({
			dia: traduccion[r.dia],
			total: r.total,
		}));

		res.json(data);
	} catch (error) {
		console.error('Error al recuperar visitas semanales: ', error);
		res.status(500).json({ message: 'Error al obtener visitas semanales.' });
	}
};

export const visitasMes = async (req, res) => {
	try {
		const inicioMes = moment().startOf('month').format('YYYY-MM-DD');
		const finMes = moment().endOf('month').format('YYYY-MM-DD');

		console.log(inicioMes, finMes);

		const { rows } = await pool.query(
			`
				WITH conteo_diario AS (
					SELECT 
						TO_CHAR(fecha_entrada, 'DD') AS dia,
						COUNT(*) AS total
					FROM visitas
					WHERE fecha_entrada::date BETWEEN $1 AND $2
					GROUP BY dia
				)

				SELECT dia, total 
				FROM conteo_diario
				ORDER BY CAST(dia AS INTEGER); 
            `,
			[inicioMes, finMes]
		);

		const data = rows.map((r) => ({
			dia: parseInt(r.dia, 10),
			total: parseInt(r.total, 10),
		}));

		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Error al obtener visitas mensuales.' });
	}
};
//OPERACIONES clientes

//OPERACIONES instructores
