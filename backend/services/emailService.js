import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendEmail = async (to, subject, text, html, attachments = []) => {
	const mailOptions = {
		from: process.env.EMAIL_ADDRESS,
		to,
		subject,
		text,
		html,
		attachments: attachments,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Correo enviado: ', info.messageId);
		return info;
	} catch (error) {
		console.error('Error al enviar el correo a: ', to, error);
	}
};
