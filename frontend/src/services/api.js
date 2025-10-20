import axios from 'axios';

// Creando la configuración base de axios
const api = axios.create({
	baseURL: 'http://localhost:3000/api', // Asegúrate que sea el puerto correcto de tu backend
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers['authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
