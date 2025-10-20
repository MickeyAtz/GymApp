import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import styles from './styles/LoginPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';

export default function LoginPage() {
	const navigate = useNavigate();
	const { user, setUser } = useUser();
	const [dataForm, setDataForm] = useState({ email: '', password: '' });
	const [error, setError] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDataForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	useEffect(() => {
		if (user) navigate('/');
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.post(
				'http://localhost:3000/api/auth/login',
				dataForm
			);
			const { token, usuario } = response.data;

			localStorage.setItem('token', token);
			localStorage.setItem('usuario', JSON.stringify(usuario));

			setUser(usuario);

			navigate('/');
		} catch (err) {
			setError(err.response?.data?.message || 'Error al iniciar sesión');
		}
	};

	return (
		<div className={styles.loginWrapper}>
			<form className={styles.loginForm} onSubmit={handleSubmit}>
				<h2>Inicio de Sesión</h2>
				{error && <p className={styles.error}>{error}</p>}
				<Input
					type="email"
					name="email"
					placeholder="Ingresa tu email"
					value={dataForm.email}
					onChange={handleChange}
					required
				></Input>
				<Input
					type="password"
					name="password"
					placeholder="Ingresa tu contraseña"
					value={dataForm.password}
					onChange={handleChange}
					required
				></Input>
				<button type="submit">Ingresar</button>
			</form>
		</div>
	);
}
