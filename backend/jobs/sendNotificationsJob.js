import pool from '../db.js';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { differenceInCalendarDays } from 'date-fns';

dotenv.config();

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASS,
	},
});

// Función que inicializa el job
export const sendNotificationsJob = () => {
	// Corre todos los días a las 12:00 del mediodía
	cron.schedule('0 12 * * *', async () => {
		await generarNotificaciones();
		await enviarNotificaciones();
		console.log('Job de notificaciones ejecutado.');
	});
};

// Función para generar las notificaciones
// Estas se gurdan en una tabla en la base de datos, después se envian
const generarNotificaciones = async () => {
	try {
		const result = await pool.query(`
            SELECT 
				um.id AS usuario_membresia_id, u.nombre, ca.email, um.fecha_fin
            FROM usuario_membresia um
				JOIN usuarios u ON um.usuario_id = u.id
				JOIN cuentas_acceso ca ON u.id = ca.usuario_id 
            WHERE um.status = 'activo'
        `);

		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0); // Ignorar la hora

		console.log('hoy');

		for (const row of result.rows) {
			const fechaFin = row.fecha_fin;

			console.log(fechaFin);

			fechaFin.setHours(0, 0, 0, 0);

			const diasRestantes = differenceInCalendarDays(fechaFin, hoy);

			console.log('Dias restantes: ' + diasRestantes);
			console.log('Fecha hoy: ' + hoy);
			console.log('Fecha fin: 	 ' + fechaFin);

			if (diasRestantes === 7 || diasRestantes === 1) {
				const msg = `Tu membresía expira en ${diasRestantes} día(s)`;

				const existing = await pool.query(
					`SELECT * FROM notificaciones_membresia
                     WHERE usuario_membresia_id = $1 AND mensaje = $2`,
					[row.usuario_membresia_id, msg]
				);

				if (existing.rows.length === 0) {
					await pool.query(
						`INSERT INTO notificaciones_membresia
                         (usuario_membresia_id, mensaje, enviado)
                         VALUES ($1, $2, $3)`,
						[row.usuario_membresia_id, msg, false]
					);
				}
			}
		}
	} catch (error) {
		console.error('Error al generar notificaciones: ', error);
	}
};

// Función para enviar las notificaciones pendientes
// Obtiene las notificaciones de la base de datos y marca las mandadas
const enviarNotificaciones = async () => {
	try {
		const pendientes = await pool.query(`
            SELECT n.id, n.mensaje, u.email, u.nombre
            FROM notificaciones_membresia n
            JOIN usuario_membresia um ON um.id = n.usuario_membresia_id
            JOIN usuarios u ON u.id = um.usuario_id
            WHERE n.enviado = false
        `);

		for (const notificacion of pendientes.rows) {
			const mailOptions = {
				from: process.env.EMAIL_ADDRESS,
				to: notificacion.email,
				subject: 'Recordatorio de membresía',
				text: `Hola ${notificacion.nombre}, ${notificacion.mensaje}`,
			};

			try {
				await transporter.sendMail(mailOptions);

				await pool.query(
					`UPDATE notificaciones_membresia
                     SET enviado = true, fecha_envio = NOW()
                     WHERE id = $1`,
					[notificacion.id]
				);
			} catch (error) {
				console.error('Error al enviar correo a:', notificacion.email, error);
			}
		}
	} catch (error) {
		console.error('Error al enviar notificaciones: ', error);
	}
};
