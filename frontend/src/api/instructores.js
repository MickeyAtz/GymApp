import axiosInstance from './axiosInstance';

// GET /api/instructores
// Necesita: -
// Descripción: Obtiene la lista de todos los instructores.
export const getAllInstructores = async () => {
	return (await axiosInstance.get('/instructores')).data;
};

// GET /api/instructores/:id
// Necesita: ID del instructor
// Descripción: Obtiene un solo instructor por su ID.
export const getInstructorById = async (id) => {
	return (await axiosInstance.get(`/instructores/${id}`)).data;
};

// POST /api/instructores/register
// Necesita: data (objeto con { nombre, email, password, etc. })
// Descripción: Crea un nuevo instructor (como admin).
export const createInstructor = async (data) => {
	return (await axiosInstance.post('/instructores/register', data)).data;
};

// PUT /api/instructores/:id
// Necesita: id, data (objeto con datos a actualizar)
// Descripción: Actualiza un instructor existente (como admin).
export const updateInstructor = async (id, data) => {
	return (await axiosInstance.put(`/instructores/${id}`, data)).data;
};

// PUT /api/instructores/:id/baja
// Necesita: id
// Descripción: Da de baja (lógica) a un instructor (como admin).
export const deleteInstructor = async (id) => {
	return (await axiosInstance.put(`/instructores/${id}/baja`)).data;
};

// PUT /api/instructores/:id/passwordChange
// Necesita: id, data (objeto { password: '...' })
// Descripción: Cambia la contraseña de un instructor (como admin).
export const updatePassword = async (id, data) => {
	return (await axiosInstance.put(`/instructores/${id}/passwordChange`, data))
		.data;
};

// GET /api/instructores/mis-clases
// Necesita: - (El token se encarga de identificar al instructor)
// Descripción: Obtiene solo las clases del instructor logueado.
export const getMisClases = async () => {
	return (await axiosInstance.get('/instructores/mis-clases')).data;
};

// GET /api/instructores/mis-clases/alumnos/:clase_id
// Necesita: idClase
// Descripción: Obtiene los alumnos inscritos en una clase específica.
export const getAlumnosDeMiClase = async (idClase) => {
	return (
		await axiosInstance.get(`/instructores/mis-clases/alumnos/${idClase}`)
	).data;
};

// PUT /api/instructores/mis-clases/alumnos/:id_inscripcion
// Necesita: idInscripcion
// Descripción: Da de baja a un alumno de una clase.
export const eliminarAlumnoDeClase = async (idInscripcion) => {
	return (
		await axiosInstance.put(`/instructores/mis-clases/alumnos/${idInscripcion}`)
	).data;
};

// POST /api/instructores/mis-clases
// Necesita: claseData (objeto { nombre, dia, hora, etc. })
// Descripción: Crea una nueva clase para el instructor logueado.
export const createClase = async (claseData) => {
	return (await axiosInstance.post('/instructores/mis-clases', claseData)).data;
};

// PUT /api/instructores/mis-clases/:clase_id
// Necesita: idClase, claseData (datos a actualizar)
// Descripción: Actualiza una de las clases del instructor.
export const updateClase = async (idClase, claseData) => {
	return (
		await axiosInstance.put(`/instructores/mis-clases/${idClase}`, claseData)
	).data;
};

// DELETE /api/instructores/mis-clases/:clase_id
// Necesita: idClase
// Descripción: Elimina (baja lógica) una de las clases del instructor.
export const deleteClase = async (idClase) => {
	return (await axiosInstance.delete(`/instructores/mis-clases/${idClase}`))
		.data;
};
