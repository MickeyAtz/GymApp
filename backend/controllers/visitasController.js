
import pool from '../db.js';

// Agregar visita
export const addVisita = async (req, res) => {
	const { usuario_id } = req.body;

	try {
		const visitaAbierta = await pool.query(
			'SELECT * FROM visitas WHERE usuario_id = $1 AND fecha_salida IS NULL AND DATE(fecha_entrada) = CURRENT_DATE',
			[usuario_id]
		);

		if (visitaAbierta.rowCount === 0) {
			// Registrar entrada
			const nuevaVisita = await pool.query(
				'INSERT INTO visitas (usuario_id) VALUES ($1) RETURNING *',
				[usuario_id]
			);
			res.json({ message: 'Entrada registrada', visita: nuevaVisita.rows[0] });
		} else {
			// Registrar salida
			const actualizarVisita = await pool.query(
				'UPDATE visitas SET fecha_salida = NOW() WHERE id = $1 RETURNING *',
				[visitaAbierta.rows[0].id]
			);
			res.json({
				message: 'Salida registrada',
				visita: actualizarVisita.rows[0],
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al registrar la entrada' });
	}
};

// Obtener las visitas de un cliente
export const getVisitasByUsuarioId = async (req, res) => {
	const { usuario_id } = req.params;
	try {
		const visitas = await pool.query(
			'SELECT * FROM visitas WHERE visitas.usuario_id = $1',
			[usuario_id]
		);
		res.json({ message: 'Visitas obtenidas', visitas: visitas.rows });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al obtener las visitas' });
	}
};

// Obtener visitas por fechas y usuario
export const getVisitasUsuarioByFecha = async (req, res) => {
	const { usuario_id, fecha_inicio, fecha_fin } = req.params;
	try {
		const visitas = await pool.query(
			'SELECT * FROM visitas WHERE visitas.usuario_id = $1 AND DATE(fecha_entrada) BETWEEN $2 AND $3',
			[usuario_id, fecha_inicio, fecha_fin]
		);
		res.json({ message: 'Visitas obtenidas', visitas: visitas.rows });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al obtener las visitas' });
	}
};

// Obtener TODAS las visitas
export const getAllVisitas = async (req, res) => {
	const { fecha_inicio, fecha_fin } = req.params;
	try {
		const visitas = await pool.query(
			'SELECT * FROM visitas WHERE DATE(fecha_entrada) BETWEEN $1 AND $2',
			[fecha_inicio, fecha_fin]
		);
		res.json({
			message: 'Visitas obtenidas',
			visitas: visitas.rows,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al obtener las visitas' });
	}
};
