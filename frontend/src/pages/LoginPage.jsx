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
	// Añadamos un estado de carga para el botón
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
			<form className={styles.loginForm} onSubmit={handleSubmit}>
				<h2>Inicio de Sesión</h2>
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
