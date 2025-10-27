import apiClient from './axiosInstance';

export const searchUsuarios = async (searchTerm) =>
	(await apiClient.get(`/usuarios?search=${encodeURIComponent(searchTerm)}`))
		.data;

export const getActiveMemberships = async () =>
	(await apiClient.get('/membresias/activas')).data;

export const createMembershipPayment = async (paymentData) =>
	(await apiClient.post('/pagos', paymentData)).data;

// (Añade aquí otras funciones API que necesites)
