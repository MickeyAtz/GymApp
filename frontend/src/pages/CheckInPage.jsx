import React, { useState, useEffect, useRef } from 'react';
import { registrarVisita } from '../api/visitas.js';
import styles from './styles/CheckInPage.module.css'; // ¡CSS 100% Nuevo!

// Importamos los íconos
import {
	FaCheckCircle,
	FaTimesCircle,
	FaSignOutAlt,
	FaSpinner,
	FaBarcode,
} from 'react-icons/fa';

export default function CheckInPage() {
	const [scanData, setScanData] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [scanResult, setScanResult] = useState(null);
	const inputRef = useRef(null);

	// --- Lógica de Submit (sin cambios) ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!scanData || isLoading) return;
		setIsLoading(true);
		setScanResult(null);
		try {
			const response = await registrarVisita(scanData);
			setScanResult({
				status: response.status, // 'success_in' o 'success_out'
				message: response.message,
				user: `${response.usuario.nombre} ${response.usuario.apellidos}`,
			});
		} catch (error) {
			const errorData = error.response?.data || {};
			setScanResult({
				status: 'error',
				message: errorData.message || 'Error desconocido',
				user: errorData.usuario
					? `${errorData.usuario.nombre} ${errorData.usuario.apellidos}`
					: 'Usuario Desconocido',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// --- Lógica de Focus y Reseteo (sin cambios) ---
	useEffect(() => {
		// Enfoca el input al cargar y si se pierde el foco
		inputRef.current?.focus();
		const handleFocusLoss = () => inputRef.current?.focus();
		window.addEventListener('blur', handleFocusLoss);
		return () => window.removeEventListener('blur', handleFocusLoss);
	}, []);

	useEffect(() => {
		// Resetea el formulario después de 4s
		if (scanResult) {
			const timer = setTimeout(() => {
				setScanResult(null);
				setScanData('');
				inputRef.current?.focus();
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [scanResult]);

	// --- Funciones de Renderizado (Actualizadas) ---
	const getResultClass = () => {
		if (!scanResult) return '';
		if (scanResult.status === 'success_in') return styles.success;
		if (scanResult.status === 'success_out') return styles.goodbye;
		if (scanResult.status === 'error') return styles.error;
		return '';
	};

	const getResultIcon = () => {
		if (!scanResult) return null;
		if (scanResult.status === 'success_in')
			return <FaCheckCircle className={styles.iconResult} />;
		if (scanResult.status === 'success_out')
			return <FaSignOutAlt className={styles.iconResult} />;
		if (scanResult.status === 'error')
			return <FaTimesCircle className={styles.iconResult} />;
		return null;
	};

	return (
		<div
			className={`${styles.kioskContainer} ${scanResult ? styles.showResult : ''}`}
			onClick={() => inputRef.current?.focus()}
		>
			<div className={styles.scanLight}></div>

			{scanResult ? (
				<div className={`${styles.resultCard} ${getResultClass()}`}>
					{getResultIcon()}
					<div className={styles.resultText}>
						<h2 className={styles.messageText}>{scanResult.message}</h2>
						<h3 className={styles.userText}>{scanResult.user}</h3>
					</div>
				</div>
			) : (
				<div className={styles.promptSection}>
					{isLoading ? (
						<FaSpinner className={`${styles.iconPrompt} ${styles.spinner}`} />
					) : (
						<FaBarcode className={styles.iconPrompt} />
					)}
					<h2 className={styles.promptTitle}>
						{isLoading ? 'Procesando...' : 'REGISTRO DE VISITAS'}
					</h2>
					<p className={styles.promptSubtitle}>
						Escribe el código y presiona Enter o usa el escáner
					</p>
					<form onSubmit={handleSubmit}>
						<input
							ref={inputRef}
							type="text"
							className={styles.scanInput} 
							value={scanData}
							onChange={(e) => setScanData(e.target.value)}
							autoComplete="off"
							autoFocus
						/>
					</form>
				</div>
			)}
		</div>
	);
}
