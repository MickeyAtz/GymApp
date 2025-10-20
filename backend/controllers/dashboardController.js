
import pool from '../db.js';

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
        res.json({totalMembresiasActivas: parseInt(result.rows[0].total, 10)});
    }catch(error){
        res.status(500).json({error: 'Error al obtener total de membresias'});
    }
}

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

//OPERACIONES clientes


//OPERACIONES instructores

