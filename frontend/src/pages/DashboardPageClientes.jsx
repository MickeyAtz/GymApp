import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUser } from '../context/UserContext';
import styles from './styles/DashboardPageAdmin.module.css';
import CardDashboard from '../components/atoms/CardDashboard';
import Card from '../components/molecules/Card.jsx';
import Badge from '../components/atoms/Badge.jsx';

import {
	getEstadoMembresia,
	getProximaClase,
	getAsistenciasMes,
	getGraficaAsistencias,
} from '../api/dashboardCliente.js';

export default function DashboardClientePages() {
	const { user } = useUser();

	useEffect(() => {
		document.title = 'Mi Dashboard - Clientes';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const [dashboardData, setDashboardData] = useState({
		estadoMembresia: 'Cargando...',
		proximaClase: 'Cargando...',
		asistenciasMes: 0,
		graficaAsistencias: { labels: [], data: [] },
		loading: true,
		error: null,
	});

	const fetchDashboardData = async () => {
		setDashboardData((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const results = await Promise.allSettled([
				getEstadoMembresia(),
				getProximaClase(),
				getAsistenciasMes(),
				getGraficaAsistencias(),
			]);

			const membresiaRes = results[0];
			const proximaClaseRes = results[1];
			const asistenciasRes = results[2];
			const graficaRes = results[3];

			const estadoMembresiaData =
				membresiaRes.status === 'fulfilled'
					? (membresiaRes.value?.mensaje ?? 'No disponible')
					: 'Error al cargar';

			const proximaClaseData =
				proximaClaseRes.status === 'fulfilled'
					? (proximaClaseRes.value?.mensaje ?? 'No disponible')
					: 'Error al cargar';

			const asistenciasMesData =
				asistenciasRes.status === 'fulfilled'
					? (asistenciasRes.value?.total_asistencias ?? 0)
					: 'Error';

			const graficaAsistenciasData =
				graficaRes.status === 'fulfilled'
					? { labels: graficaRes.value.labels, data: graficaRes.value.data }
					: { labels: [], data: [] };

			results.forEach((result, index) => {
				if (result.status === 'rejected') {
					console.warn(`API call ${index} falló: `, result.reason);
				}
			});

			setDashboardData({
				estadoMembresia: estadoMembresiaData,
				proximaClase: proximaClaseData,
				asistenciasMes: asistenciasMesData,
				graficaAsistencias: graficaAsistenciasData,
				loading: false,
				error: null,
			});
		} catch (err) {
			setDashboardData((prev) => ({
				...prev,
				loading: false,
				error: 'No se pudieron cargar los datos.',
			}));
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	return (
		<div className={styles.dashboard}>
			<div className={styles.header}>
				<h2>¡Hola, {user ? user.nombre : 'Cliente'}!</h2>
				<Badge variant="accent">Este es tu resumen de actividad.</Badge>
			</div>

			<div className={styles.resumenGrid}>
				<CardDashboard
					title="Estado de Membresía"
					value={dashboardData.estadoMembresia}
					icon="id"
				/>
				<CardDashboard
					title="Próxima Clase"
					value={dashboardData.proximaClase}
					icon="teacher"
				/>
				<CardDashboard
					title="Asistencias (este Mes)"
					value={dashboardData.asistenciasMes}
					icon="user"
				/>
			</div>

			<div className={styles.chartsGrid}>
				<Card title="Mi Historial de Asistencia (Mes Actual)">
					<div className={styles.chartContainer}>
						<Bar
							data={{
								labels: dashboardData.graficaAsistencias.labels,
								datasets: [
									{
										label: 'Mis Asistencias',
										data: dashboardData.graficaAsistencias.data,
										backgroundColor: 'rgba(54, 162, 235, 0.5)',
										borderColor: 'rgba(54, 162, 235, 1)',
										borderWidth: 1,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
							}}
						/>
					</div>
				</Card>
			</div>
		</div>
	);
}
