import axiosInstance from './axiosInstance'; // instancia global

const BASE_ROUTE = '/usuarios';

// Obtener todos los usuarios
export const getUsuarios = async () => {
	return (await axiosInstance.get(BASE_ROUTE)).data;
};

// Obtener un usuario por ID
export const getUsuario = async (id) => {
	return (await axiosInstance.get(`${BASE_ROUTE}/${id}`)).data;
};

// Crear un nuevo usuario
export const createUsuario = async (data) => {
	return (await axiosInstance.post(`${BASE_ROUTE}/register`, data)).data;
};

// Actualizar usuario existente
export const updateUsuario = async (id, data) => {
	return (await axiosInstance.put(`${BASE_ROUTE}/${id}`, data)).data;
};

// Eliminación lógica de usuario
export const deleteUsuario = async (id) => {
	return (await axiosInstance.put(`${BASE_ROUTE}/${id}/baja`)).data;
};

// Actualizar contraseña de usuario
export const updatePassword = async (id, data) => {
	return (await axiosInstance.put(`${BASE_ROUTE}/${id}/passwordChange`, data))
		.data;
};
