import apiClient from './axiosInstance'; // Tu instancia de Axios configurada

const BASE_URL = '/dashboard-instructor';

export const getProximaClaseInstructor = async () =>
	(await apiClient.get(`${BASE_URL}/proxima-clase`)).data;

export const getInscritosClase = async (claseId) =>
	(await apiClient.get(`${BASE_URL}/inscritos/${claseId}`)).data;

export const getTotalClasesHoy = async () =>
	(await apiClient.get(`${BASE_URL}/clases-hoy`)).data;

export const getPopularidadClasesInstructor = async () =>
	(await apiClient.get(`${BASE_URL}/popularidad-clases`)).data;
