import axiosInstance from './axiosInstance';

// Prefijo de la ruta base
const API_URL = '/usuarios';

// =================================================================
//  Funciones de ADMIN (Gestión de Clientes/Usuarios)
// =================================================================

// GET /api/usuarios
// Necesita: -
// Descripción: Obtiene la lista de todos los usuarios (clientes).
export const getAllUsuarios = async () => {
	return (await axiosInstance.get(API_URL)).data;
};

// GET /api/usuarios/:id
// Necesita: ID del usuario
// Descripción: Obtiene un solo usuario por su ID.
export const getUsuarioById = async (id) => {
	return (await axiosInstance.get(`${API_URL}/${id}`)).data;
};

// POST /api/usuarios/register
// Necesita: data (objeto con { nombre, email, password, etc. })
// Descripción: Crea un nuevo usuario (cliente) (como admin).
export const createUsuario = async (data) => {
	return (await axiosInstance.post(`${API_URL}/register`, data)).data;
};

// PUT /api/usuarios/:id
// Necesita: id, data (objeto con datos a actualizar)
// Descripción: Actualiza un usuario existente (como admin).
export const updateUsuario = async (id, data) => {
	return (await axiosInstance.put(`${API_URL}/${id}`, data)).data;
};

// PUT /api/usuarios/:id/baja
// Necesita: id
// Descripción: Da de baja (lógica) a un usuario (como admin).
export const deleteUsuario = async (id) => {
	return (await axiosInstance.put(`${API_URL}/${id}/baja`)).data;
};

// PUT /api/usuarios/:id/passwordChange
// Necesita: id, data (objeto { password: '...' })
// Descripción: Cambia la contraseña de un usuario (como admin).
export const updatePasswordUsuario = async (id, data) => {
	return (await axiosInstance.put(`${API_URL}/${id}/passwordChange`, data))
		.data;
};

// GET /api/usuarios/search
// Necesita: query (string de búsqueda)
// Descripción: Busca usuarios por nombre, apellido, email o código de barras.
export const searchUsuarios = async (query) => {
	return (
		await axiosInstance.get(`${API_URL}/search`, {
			params: { search: query },
		})
	).data;
};

// =================================================================
//  Funciones de CLIENTE (Gestión de "Mis Inscripciones")
// =================================================================

// GET /api/usuarios/mis-inscripciones
// Necesita: - (Token de cliente)
// Descripción: Obtiene las clases en las que el cliente ya está inscrito.
export const getMisInscripciones = async () => {
	return (await axiosInstance.get(`${API_URL}/mis-inscripciones`)).data;
};

// GET /api/usuarios/clases-disponibles
// Necesita: - (Token de cliente)
// Descripción: Obtiene todas las clases a las que el cliente se puede inscribir.
export const getClasesDisponibles = async () => {
	return (await axiosInstance.get(`${API_URL}/clases-disponibles`)).data;
};

// POST /api/usuarios/inscribir/:clase_id
// Necesita: idClase
// Descripción: Inscribe al cliente logueado en una nueva clase.
export const inscribirClase = async (idClase) => {
	return (await axiosInstance.post(`${API_URL}/inscribir/${idClase}`)).data;
};

// PUT /api/usuarios/baja/:id_inscripcion
// Necesita: idInscripcion
// Descripción: Da de baja al cliente de una clase.
export const darseDeBajaClase = async (idInscripcion) => {
	return (await axiosInstance.put(`${API_URL}/baja/${idInscripcion}`)).data;
};
