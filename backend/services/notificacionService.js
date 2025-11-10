import { sendEmail } from './emailService.js';
import fs from 'fs';
import path from 'path';

export const sendWelcomeEmail = async (
	nombre,
	apellidos,
	email,
	codigo,
	pdfPath
) => {
	const welcomeSubject = '¡Bienvenido a LFT Gym! Tu registro es exitoso';
	const welcomeText = `
        Hola ${nombre}, 

        !Bienvenido a LFT Gym! Tu cuenta ha sido creada exitosamente.

        Tu código de barras para el Check-In es: ${codigo}

        Puedes acceder a la palicación utiliznado tu email: ${email}

        ¡Esperamos verte pronto!

        Saludos, 
        El equipo de LFT Gym
    `;

	const welcomeHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background-color: #1e1e1e; color: #f5f5f5;">
            <h2 style="color: #FFD700;">¡Bienvenido a Gym LFT!</h2>
            <p>Hola <strong>${nombre} ${apellidos}</strong>,</p>
            <p>Tu cuenta ha sido creada exitosamente. ¡Ya eres parte de nuestra comunidad!</p>
            <p>Utiliza tu código para registrar tus visitas en el gimnasio:</p>
            <h3 style="color: #FFD700; background-color: #222; padding: 10px; border-radius: 5px;">Código de Check-In: ${codigo}</h3>
            <p>Puedes iniciar sesión con tu email: <strong>${email}</strong>.</p>
            <p>¡Te esperamos!</p>
        </div>
    `;

	const attachments = [
		{
			filename: `Tarjeta_Acceso_${codigo}.pdf`,
			path: pdfPath,
			contentType: 'application/pdf',
		},
	];

	await sendEmail(email, welcomeSubject, welcomeText, welcomeHtml, attachments);

	try {
		if (pdfPath && fs.existsSync(pdfPath)) {
			fs.unlinkSync(pdfPath);
			console.log('[FILE CLEANUP] Tarjeta PDF eliminada de: ', pdfPath);
		}
	} catch (err) {
		console.error('[FILE ERROR] No se pudo eliminar la tarjeta PDF: ', pdfPath);
	}
};

export const sendMembershipPurchaseEmail = async (
	nombre,
	apellidos,
	email,
	membresia_nombre,
	monto,
	tipo_pago,
	fecha_fin_formateada,
	dias_restantes_vieja
) => {
	const purchaseSubject = `Confirmación de Compra: Membresía ${membresia_nombre}`;
	const diasAnadidosMsg =
		dias_restantes_vieja > 0
			? `Se han añadido ${dias_restantes_vieja} días restantes de tu membresía anterior.`
			: '';

	const purchaseText = `Hola ${nombre},

        ¡Gracias por tu compra! Tu membresía ${membresia_nombre} ha sido activada.

        Detalles: 
        - Tipo de Membresía: ${membresia_nombre}
        - Monto: $${parseFloat(monto).toFixed(2)}
        - Vence el: ${fecha_fin_formateada}

        ${diasAnadidosMsg}

        Saludos,
        El equipo de LFT Gym
    `;

	const purchaseHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background-color: #1e1e1e; color: #f5f5f5;">
            <h2 style="color: #FFD700;">Confirmación de Compra</h2>
            <p>Hola <strong>${nombre} ${apellidos}</strong>,</p>
            <p>¡Tu membresía ha sido activada exitosamente!</p>
            <div style="background-color: #222; padding: 15px; border-radius: 8px;">
                <p style="color: #f5f5f5; margin: 0;"><strong>Membresía:</strong> ${membresia_nombre}</p>
                <p style="color: #f5f5f5; margin: 5px 0;"><strong>Vence el:</strong> ${fecha_fin_formateada}</p>
                <h3 style="color: #FFD700; margin-top: 10px; margin-bottom: 0;">Monto pagado: $${parseFloat(
									monto
								).toFixed(2)} (${tipo_pago})</h3>
            </div>
            <p style="margin-top: 20px;">${diasAnadidosMsg} ¡Gracias por ser parte de GymApp!</p>
        </div>
    `;
	await sendEmail(email, purchaseSubject, purchaseText, purchaseHtml);
};
