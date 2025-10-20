import axiosInstance from './axiosInstance';

// Obtener todos los usuarios
export const getAllInstructores = async () => {
	return (await axiosInstance.get('/instructores')).data;
};

// Obtener un usuario por ID
export const getInstructorById = async (id) => {
	return (await axiosInstance.get(`'/instructores/${id}`)).data;
};

// Crear un nuevo instructor
export const createInstructor = async (data) => {
	return (await axiosInstance.post(`/instructores/register`, data)).data;
};

// Actualizar usuario existente
export const updateInstructor = async (id, data) => {
	return (await axiosInstance.put(`/instructores/${id}`, data)).data;
};

// Eliminación lógica de usuario
export const deleteInstructor = async (id) => {
	return (await axiosInstance.put(`/instructores/${id}/baja`)).data;
};

// Actualizar contraseña de usuario
export const updatePassword = async (id, data) => {
	return (await axiosInstance.put(`/instructores/${id}/passwordChange`, data))
		.data;
};
