import pool from './db.js'; // tu conexión a PostgreSQL
import { generarCodigoBarras } from './utils/generarCodigoBarras.js';

async function generarCodigosExistentes() {
	try {
		// Traer todos los clientes sin código
		const res = await pool.query(
			'SELECT id, nombre, apellidos FROM usuarios WHERE fecha_baja IS NULL'
		);

		for (const user of res.rows) {
			const codigo = generarCodigoBarras(
				user.nombre,
				user.apellidos,
				'cliente',
				user.id
			);

			await pool.query('UPDATE usuarios SET codigo_barras = $1 WHERE id = $2', [
				codigo,
				user.id,
			]);

			console.log(
				`Código generado para ${user.nombre} ${user.apellidos}: ${codigo}`
			);
		}

		console.log('¡Todos los códigos generados!');
		process.exit(0);
	} catch (err) {
		console.error('Error generando códigos:', err);
		process.exit(1);
	}
}

generarCodigosExistentes();
