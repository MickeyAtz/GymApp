import cron from 'node-cron';
import pool from '../db.js';

// Tarea programada para cerrar visitas abiertas a las 23:59 todos los días.
// Estas visitas no contaran para el resumen de tiempo total del usuario.
export const startJobs = () => {
	cron.schedule('0 * * * *', async () => {
		try {
			await pool.query(
				`UPDATE visitas
                SET fecha_salida = NOW()
                WHERE fecha_salida IS NULL
                AND fecha_entrada <= NOW() - INTERVAL '4 hours'`
			);
		} catch (error) {
			console.error('Error al cerrar visitas abiertas.', error);
		}
	});
};
