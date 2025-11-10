import PDFDocument from 'pdfkit';
import fs from 'fs';
import bwipjs from 'bwip-js';
import path from 'path';

export async function generarTarjetaDigitalPDF(cliente) {
	return new Promise(async (resolve, reject) => {
		try {
			const carpetaTarjetas = path.join('tarjetas_digitales');
			if (!fs.existsSync(carpetaTarjetas)) fs.mkdirSync(carpetaTarjetas);

			// 1. Generar la imagen del código de barras (PNG)
			const barcodeBuffer = await bwipjs.toBuffer({
				bcid: 'code128',
				text: cliente.codigo_barras,
				scale: 4,
				height: 50,
				includetext: false, // CRÍTICO: No incluir texto en la imagen para evitar solapamiento
				backgroundcolor: 'FFFFFF',
				barcolor: '000000',
			});

			// 2. Crear el documento PDF
			const doc = new PDFDocument({
				size: [280, 480], // Tamaño vertical optimizado (aprox 4x6 in)
				margins: { top: 30, left: 20, bottom: 20, right: 20 },
			});

			const filePath = path.join(
				carpetaTarjetas,
				`tarjeta_digital_${cliente.id}.pdf`
			);
			doc.pipe(fs.createWriteStream(filePath));

			// 3. Diseño base (Fondo blanco y Borde Dorado)
			doc.rect(0, 0, 280, 480).fill('#FFFFFF');
			doc.lineWidth(5).strokeColor('#FFD700').rect(5, 5, 270, 470).stroke();

			// 4. Logo (Asumiendo que el servidor se ejecuta desde la raíz del proyecto)
			const logoPath = path.join('backend', 'img', 'logo.png');
			const logoSize = 60;
			const logoX = (280 - logoSize) / 2;

			// Manejo seguro de la imagen para evitar corrupción de PDF
			try {
				doc.image(logoPath, logoX, 20, { width: logoSize });
			} catch (err) {
				console.error(
					'Advertencia: No se pudo cargar el logo, PDF no corrupto. Error:',
					err.message
				);
				// Si el logo no se carga, el PDF no se corrompe y la generación continúa
			}

			// 5. Título y Encabezado
			doc.y = 20 + logoSize + 15; // Inicia el texto 15px debajo del logo

			doc.fillColor('#121212').fontSize(16).font('Helvetica-Bold');
			// Usamos coordenadas relativas (doc.y) para el texto superior
			doc.text('TARJETA DE ACCESO DIGITAL', { align: 'center' });
			doc.moveDown(1.5);

			// 6. Nombre del Cliente (Dorado)
			doc.fillColor('#FFD700').fontSize(24).font('Helvetica-Bold');
			doc.text(cliente.nombre + ' ' + cliente.apellidos, {
				align: 'center',
			});
			doc.moveDown(0.5);

			// 7. Estatus
			doc.fillColor('#555555').fontSize(14).font('Helvetica');
			doc.text('MIEMBRO ACTIVO', { align: 'center' });

			// --- SECCIÓN CÓDIGO DE BARRAS (Fijado en la parte inferior) ---

			// 8. Separador
			doc
				.strokeColor('#EEEEEE')
				.lineWidth(1)
				.moveTo(40, 200) // Posición Y fija del separador
				.lineTo(240, 200)
				.stroke();

			// 9. Variables de Posición para el Código
			const barcodeWidth = 200;
			const barcodeHeight = 50;
			const barcodeY = 320; // Posición Y fija y prominente
			const barcodeX = (280 - barcodeWidth) / 2;

			// 10. Barcode Image
			doc.image(barcodeBuffer, barcodeX, barcodeY, {
				width: barcodeWidth,
				height: barcodeHeight,
			});

			// 11. Número de Código (grande y claro, debajo del código de barras)
			doc.fillColor('#121212').fontSize(16).font('Helvetica');
			doc.text(cliente.codigo_barras, {
				align: 'center',
				y: barcodeY + barcodeHeight + 10, // 10px debajo del código de barras
			});

			doc.end();
			resolve(filePath);
		} catch (error) {
			reject(error);
		}
	});
}
