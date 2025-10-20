import axiosInstance from './axiosInstance';

export const getMembresias = async () =>
	(await axiosInstance.get('/membresias')).data;

export const createMembresia = async (data) =>
	(await axiosInstance.post('/membresias/', data)).data;

export const updateMembresia = async (id, data) =>
	(await axiosInstance.put(`/membresias/${id}`, data)).data;

export const deleteMembresia = async (id) =>
	(await axiosInstance.put(`/membresias/${id}/baja`)).data;
