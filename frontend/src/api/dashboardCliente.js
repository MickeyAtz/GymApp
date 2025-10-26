import axios from 'axios';
import axiosInstance from './axiosInstance';

const BASE_URL = '/dashboard-cliente';

export const getEstadoMembresia = async () =>
	await axiosInstance.get(`${BASE_URL}/estado-membresia`).data;

export const getProximaClase = async () =>
	await axiosInstance.get(`${BASE_URL}/proxima-clase`).data;

export const getAsistenciasMes = async () =>
	await axiosInstance.get(`${BASE_URL}/asistencias-mes`).data;

export const getGraficaAsistencias = async () =>
	(await axiosInstance.get(`${BASE_URL}/grafica-asistencias`)).data;
