import pool from '../db.js';

// POST /api/visitas/registrar
// Necesita: req.body.codigo_barras
// Descripción: El controlador prinicipal
export const registrarVisita = async (req, res) => {
	const { codigo_barras } = req.body;
	if (!codigo_barras)
		return res.status(400).json({
			message: 'Código de barras no proporcionado',
			status: 'error',
		});

	const client = await pool.connect();

	try {
		const userQuery = await client.query(
			`SELECT id, nombre, apellidos
			FROM usuarios
			WHERE codigo_barras = $1
			AND fecha_baja IS NULL`,
			[codigo_barras]
		);

		if (userQuery.rows.length === 0) {
			return res.status(404).json({
				status: 'error',
				message: 'Código no encontrado.',
				usuario: { nombre: 'Desconocido', apellidos: '' },
			});
		}

		const usuario = userQuery.rows[0];

		const membresiaQuery = await client.query(
			`	SELECT 1
				FROM usuario_membresia
				WHERE usuario_id = $1
					AND status = 'activo'
					AND NOW() BETWEEN fecha_inicio AND fecha_fin
			`,
			[usuario.id]
		);

		if (membresiaQuery.rows.length === 0)
			return res.status(403).json({
				status: 'error',
				message: 'Acceso Denegado: Membresía Vencida o Inactiva',
				usuario: usuario,
			});

		const visitaAbierta = await client.query(
			'SELECT * FROM visitas WHERE usuario_id = $1 AND fecha_salida IS NULL AND DATE(fecha_entrada) = CURRENT_DATE',
			[usuario.id]
		);

		if (visitaAbierta.rowCount === 0) {
			await client.query(
				'INSERT INTO visitas (usuario_id) VALUES ($1) RETURNING *',
				[usuario.id]
			);
			return res.status(200).json({
				message: '¡Bienvenido!',
				status: 'success_in',
				usuario: usuario,
			});
			s;
		} else {
			await client.query(
				'UPDATE visitas SET fecha_salida = NOW() WHERE id = $1 RETURNING *',
				[visitaAbierta.rows[0].id]
			);
			return res.status(200).json({
				status: 'success_out',
				message: '¡Hasta luego!',
				usuario: usuario,
			});
		}
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: 'Error al registrar la entrada', status: 'error' });
		s;
	} finally {
		client.release();
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
			D: visitas.rows,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error al obtener las visitas' });
	}
};

export const getMiHistorialVisitas = async (req, res) => {
	const { perfil_id: usuarioId } = req.user; 

	try {
		const visitas = await pool.query(
			`SELECT id, fecha_entrada, fecha_salida, duracion_minutos
			 FROM visitas
			 WHERE usuario_id = $1
			 ORDER BY fecha_entrada DESC`, 
			[usuarioId]
		);
		res.json(visitas.rows);
	} catch (error) {
		console.error('Error al obtener mi historial de visitas:', error);
		res.status(500).json({ error: 'Error al obtener las visitas' });
	}
};
