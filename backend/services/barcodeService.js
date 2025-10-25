import bwipjs from 'bwip-js';

export async function generarImagenCodigo(codigo) {
	try {
		const png = await bwipjs.toBuffer({
			bcid: 'code128',
			text: codigo,
			scale: 3,
			height: 10,
			includetext: true,
			textxalign: 'center',
			backgroundcolor: 'ffffff',
			barcolor: '000000',
		});
		return png;
	} catch (err) {
		throw new Error('Error generando el código de barras: ' + err.message);
	}
}
