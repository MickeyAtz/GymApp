import axiosInstance from './axiosInstance';

const API_URL = '/visitas';

/**
 * POST /api/visitas/registrar
 * Necesita: codigo_barras (string)
 * Descripción: Envía el código escaneado para registrar la visita (entrada o salida).
 */
export const registrarVisita = async (codigo_barras) => {
	return (await axiosInstance.post(`${API_URL}/registrar`, { codigo_barras }))
		.data;
};

/**
 * GET /api/visitas/usuario/:usuario_id/fecha_inicio/:fecha_inicio/fecha_fin/:fecha_fin
 * Necesita: usuario_id, fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)
 * Descripción: Obtiene las visitas de un usuario en un rango de fechas.
 */
export const getVisitasUsuarioByFecha = async (
	usuario_id,
	fecha_inicio,
	fecha_fin
) => {
	return (
		await axiosInstance.get(
			`${API_URL}/usuario/${usuario_id}/fecha_inicio/${fecha_inicio}/fecha_fin/${fecha_fin}`
		)
	).data;
};

/**
 * GET /api/visitas/usuario/:usuario_id
 * Necesita: ID del usuario
 * Descripción: Obtiene el historial de visitas de un solo usuario.
 */
export const getVisitasByUsuarioId = async (usuario_id) => {
	return (await axiosInstance.get(`${API_URL}/usuario/${usuario_id}`)).data;
};

/**
 * GET /api/visitas/:fecha_inicio/:fecha_fin
 * Necesita: fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)
 * Descripción: Obtiene TODAS las visitas en un rango de fechas (para reportes).
 * NOTA: ¡Revisa la alerta de abajo!
 */
export const getAllVisitas = async (fecha_inicio, fecha_fin) => {
	// Esta URL asume que la ruta en el backend es /:fecha_inicio/:fecha_fin
	return (await axiosInstance.get(`${API_URL}/${fecha_inicio}/${fecha_fin}`))
		.data;
};

/**
 * GET /api/visitas/mi-historial
 * Necesita: Token de cliente
 * Descripción: Obtiene el historial de visitas del cliente logueado.
 */
export const getMiHistorialVisitas = async () => {
	return (await axiosInstance.get(`${API_URL}/mi-historial`)).data;
};
