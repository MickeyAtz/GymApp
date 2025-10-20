
import cron from 'node-cron';
import pool from '../db.js';

export const closeMembresiasJob = () => {
	cron.schedule('0 0 * * *', async () => {
		try {
			await pool.query(`
                UPDATE usuario_membresia
                SET status = 'inactivo'
                WHERE DATE(fecha_fin) < CURRENT_DATE 
                AND status = 'activo'
                RETURNING * 
            `);
		} catch (error) {
			console.error('Error al cerrar membresias caducadas.', error);
		}
	});
};
