import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUser } from '../context/UserContext';
import styles from './styles/DashboardPageAdmin.module.css';
import CardDashboard from '../components/atoms/CardDashboard';

import {
	getEstadoMembresia,
	getProximaClase,
	getAsistenciasMes,
	getGraficaAsistencias,
} from '../api/dashboardCliente.js';

export default function DashboardClientePage() {
	const { user } = useUser();

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
			console.log('>>> fetchDashboardData INICIADA');
			const results = await Promise.allSettled([
				getEstadoMembresia(),
				getProximaClase(),
				getAsistenciasMes(),
				getGraficaAsistencias(),
			]);

			console.log(
				'Resultados Crudos (Promise.allSettled):',
				JSON.stringify(results, null, 2)
			);

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
			console.log('Error al cargar datos del dashboard cliente: ', err);
			setDashboardData((prev) => ({
				...prev,
				loading: false,
				error: 'No se pudieron cargar los datos.',
			}));
		}
	};

	useEffect(() => {
		console.log('>>> fetchDashboardData INICIADA USEEFFECT');
		fetchDashboardData();
	}, []);

	return (
		<div className={styles.dashboard}>
			<div className={styles.header}>
				<h2>¡Hola, {user ? user.nombre : 'Cliente'}!</h2>
				<p>Este es tu resumen de actividad.</p>
			</div>

			{/* --- KPIs (Tarjetas) --- */}
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

			{/* --- Gráfica --- */}
			<div className={styles.chartsGrid}>
				{/* Asumo que tienes un estilo .card o un componente <Card> */}
				<div className={styles.card}>
					<h3>Mi Historial de Asistencia (Mes Actual)</h3>
					{/* Contenedor para la gráfica con altura definida */}
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
				</div>
			</div>
		</div>
	);
}
