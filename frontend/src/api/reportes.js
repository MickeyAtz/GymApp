import axiosInstance from './axiosInstance'; //

export const getReportePagosJSON = async (fechaInicio, fechaFin) => {
	const params = new URLSearchParams({
		fecha_inicio: fechaInicio,
		fecha_fin: fechaFin,
	});
	// Usamos /pagos/reporte como definimos en el backend
	return (await axiosInstance.get(`/pagos/reporte?${params.toString()}`)).data;
};

export const getReportePagosPDF = async (fechaInicio, fechaFin) => {
	const params = new URLSearchParams({
		fecha_inicio: fechaInicio,
		fecha_fin: fechaFin,
	});
	return (
		await axiosInstance.get(`/pagos/reporte/pdf?${params.toString()}`, {
			responseType: 'blob',
		})
	).data;
};
