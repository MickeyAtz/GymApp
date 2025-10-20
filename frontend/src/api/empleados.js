
import axiosInstance from './axiosInstance';

export const getEmpleados = async () =>
	(await axiosInstance.get('/empleados')).data;

export const createEmpleado = async (data) =>
	(await axiosInstance.post('/empleados/register', data)).data;

export const updateEmpleado = async (id, data) =>
	(await axiosInstance.put(`/empleados/${id}`, data)).data;

export const deleteEmpleado = async (id) =>
	(await axiosInstance.put(`/empleados/${id}/baja`)).data;

export const updatePassword = async (id, data) =>
	(await axiosInstance.put(`/empleados/${id}/passwordChange`, data)).data;
