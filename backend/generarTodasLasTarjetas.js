import pool from './db.js';
import { generarTarjetaPDF } from './services/generarTarjetaPDF.js';

async function generarTodasLasTarjetas() {
	try {
		const res = await pool.query(
			'SELECT * FROM usuarios WHERE fecha_baja IS NULL'
		);

		for (const row of res.rows) {
			const cliente = { ...row, tipo_usuario: 'cliente' };

			const filePath = await generarTarjetaPDF(cliente);
			console.log(
				`Generando tarjeta para: ${cliente.nombre} - ${cliente.codigo_barras}`
			);
		}

		console.log('Todas las tarjetas generadas exitosamente.');
		process.exit(0);
	} catch (error) {
		console.error('Error generando tarjetas:', error);
		process.exit(1);
	}
}

generarTodasLasTarjetas();
