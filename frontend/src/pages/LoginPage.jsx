import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import styles from './styles/LoginPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

import { toast } from 'react-toastify';

import Input from '../components/atoms/Input';

export default function LoginPage() {
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const [dataForm, setDataForm] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		document.title = 'Gym App - Login';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDataForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (user) navigate('/');
	}, [user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);
		try {
			const response = await axios.post(
				'http://localhost:3000/api/auth/login',
				dataForm
			);
			const { token, usuario } = response.data;

			toast.success('Inicio de sesión exitoso.');
			localStorage.setItem('token', token);
			localStorage.setItem('usuario', JSON.stringify(usuario));

			setUser(usuario);
		} catch (err) {
			toast.error(err.response?.data?.message || 'Error al iniciar sesión');
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.loginWrapper}>
			<div className={styles.scanLight}></div>

			{/* --- INICIO DE LA MODIFICACIÓN --- */}
			{/* 1. Contenedor del Logo (va primero) */}
			<div className={styles.logoContainer}>
				<img
					src="/logo.png" // Apunta a /public/logo.png
					alt="Logo del Gym"
					className={styles.logo}
				/>
			</div>

			{/* 2. El formulario (va después) */}
			<form className={styles.loginForm} onSubmit={handleSubmit}>
				{/* El <h2> se mueve aquí para estar dentro del card */}
				<h2>Inicio de Sesión</h2>
				{/* --- FIN DE LA MODIFICACIÓN --- */}

				{error && <p className={styles.error}>{error}</p>}
				<Input
					type="email"
					name="email"
					placeholder="Ingresa tu email"
					value={dataForm.email}
					onChange={handleChange}
					disabled={isLoading}
					required
					autoComplete="email"
				></Input>
				<Input
					type="password"
					name="password"
					placeholder="Ingresa tu contraseña"
					value={dataForm.password}
					onChange={handleChange}
					disabled={isLoading}
					required
					autoComplete="current-password"
				></Input>
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Ingresando...' : 'Ingresar'}
				</button>
			</form>
		</div>
	);
}
