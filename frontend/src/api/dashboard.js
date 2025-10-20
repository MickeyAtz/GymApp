
import axiosInstance from './axiosInstance';

//DASHBOARD empleados
export const getTotalUsuarios = async () =>
	(await axiosInstance.get('/dashboard/usuarios/total')).data;

export const getNuevosUsuarios = async () =>
	(await axiosInstance.get('/dashboard/usuarios/nuevos')).data;

export const getUsuariosPorMes = async () =>
	(await axiosInstance.get('/dashboard/usuarios/porMes')).data;

export const getTotalMembresiasMes = async () =>
	(await axiosInstance.get('/dashboard/membresias/totalMes')).data;

export const getTotalMembresiasActivas = async () =>
	(await axiosInstance.get('/dashboard/membresias/activas')).data;

export const getTotalClases = async () =>
	(await axiosInstance.get('/dashboard/clases/total')).data;

export const getInscripcionesPorClase = async () =>
	(await axiosInstance.get('/dashboard/clases/inscripciones')).data;

export const getEstadisticasGenerales = async () =>
	(await axiosInstance.get('/dashboard/estadisticas/generales')).data;

//DASHBOARD clientes

//DASHBOARD instructores