
export const formatDateTime = (isoString) => {
	if (!isoString) return '--'; // Maneja valores nulos (como una 'fecha_salida')

	const date = new Date(isoString);

	// 'es-ES' (o 'es-MX') nos da el formato dd/MM/yyyy y el AM/PM.
	return date.toLocaleString('es-ES', {
		year: 'numeric', // 2025
		month: '2-digit', // 11
		day: '2-digit', // 04
		hour: 'numeric', // 9
		minute: '2-digit', // 33
		hour12: true, // AM/PM
	});
};
