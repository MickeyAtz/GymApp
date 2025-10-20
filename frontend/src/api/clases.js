
import axiosInstance from './axiosInstance';

export const getClases = async () => (await axiosInstance.get('/clases')).data;

export const getClase = async (id) => await axiosInstance.get(`/clases/${id}`);

export const createClase = async (data) =>
	(await axiosInstance.post('/clases/register', data)).data;

export const updateClase = async (id, data) =>
	(await axiosInstance.put(`/clases/${id}`, data)).data;

export const deleteClase = async (id) =>
	(await axiosInstance.put(`/clases/${id}/baja`)).data;
