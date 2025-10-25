// backend/services/generarTarjetaPDF.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import bwipjs from 'bwip-js';
import path from 'path';

export async function generarTarjetaPDF(cliente) {
	return new Promise(async (resolve, reject) => {
		try {
			const carpetaTarjetas = path.join('tarjetas');
			if (!fs.existsSync(carpetaTarjetas)) fs.mkdirSync(carpetaTarjetas);

			const barcodeBuffer = await bwipjs.toBuffer({
				bcid: 'code128',
				text: cliente.codigo_barras,
				scale: 3,
				height: 40,
				includetext: false,
				backgroundcolor: 'FFFFFF',
				barcolor: '000000',
			});

			const doc = new PDFDocument({
				size: [340, 210],
				margins: { top: 10, left: 10, bottom: 10, right: 10 },
			});

			const filePath = path.join(carpetaTarjetas, `tarjeta_${cliente.id}.pdf`);
			doc.pipe(fs.createWriteStream(filePath));

			doc.rect(0, 0, 340, 210).fill('#293133');

			doc.lineWidth(2).strokeColor('#FFD700').rect(5, 5, 330, 200).stroke();

			const logoPath = path.join('./img/logo.png');
			if (fs.existsSync(logoPath)) {
				doc.image(logoPath, (340 - 60) / 2, 15, { width: 60 });
			} else {
				console.warn('Logo no encontrado en:', logoPath);
			}

			doc.fillColor('#FFD700').fontSize(18);

			const nombreText = cliente.nombre + ' ' + cliente.apellidos;
			const nombreHeight = doc.heightOfString(nombreText, { width: 300 });
			doc.text(nombreText, 20, 90, { width: 300, align: 'center' });

			doc.fontSize(12).text('CLIENTE', 20, 90 + nombreHeight + 5, {
				width: 300,
				align: 'center',
			});

			doc.image(barcodeBuffer, 20, 140, { width: 300, height: 40 });

			doc
				.fillColor('#FFFFFF')
				.fontSize(10)
				.text(cliente.codigo_barras, 20, 140 + 40 + 2, {
					width: 300,
					align: 'center',
				});

			doc.end();
			resolve(filePath);
		} catch (error) {
			reject(error);
		}
	});
}
