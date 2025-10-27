import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useUser } from '../context/UserContext';
import styles from './styles/DashboardPageAdmin.module.css';
import CardDashboard from '../components/atoms/CardDashboard';
import Loading from '../components/atoms/Loading';
import Card from '../components/molecules/Card.jsx';

import {
	getProximaClaseInstructor,
	getInscritosClase,
	getTotalClasesHoy,
	getPopularidadClasesInstructor,
} from '../api/dashboardInstructor.js';

export default function DashboardPageInstructor() {
	const { user } = useUser();

	useEffect(() => {
		document.title = 'Mi Dashboard - Instructor';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const [kpis, setKpis] = useState({
		proximaClaseMsg: 'Cargando...',
		inscritosMsg: 'Cargando...',
		clasesHoy: 0,
	});

	const [popularidadData, setPopularidadData] = useState({
		labels: [],
		datasets: [],
	});

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchInstructorData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [proximaClaseResult, totalClasesHoyResult, popularidadResult] =
					await Promise.allSettled([
						getProximaClaseInstructor(),
						getTotalClasesHoy(),
						getPopularidadClasesInstructor(),
					]);

				let proximaClaseMsg = 'Error al cargar';
				let inscritosMsg = '-';
				let claseIdParaInscritos = null;
				let capacidadClase = null;

				if (proximaClaseResult.status === 'fulfilled') {
					const data = proximaClaseResult.value;
					proximaClaseMsg = data?.mensaje ?? 'No disponible';
					if (data?.tieneProxima && data?.clase_id) {
						claseIdParaInscritos = data.clase_id;
						capacidadClase = data.capacidad;
					}
				} else {
					console.error('Error loading next class:', proximaClaseResult.reason);
				}

				const clasesHoyData =
					totalClasesHoyResult.status === 'fulfilled'
						? (totalClasesHoyResult.value?.total_clases_hoy ?? 0)
						: 'Error';

				if (
					popularidadResult.status === 'fulfilled' &&
					popularidadResult.value?.labels
				) {
					setPopularidadData({
						labels: popularidadResult.value.labels,
						datasets: [
							{
								label: 'Total Enrolled (Month)',
								data: popularidadResult.value.data,
								backgroundColor: 'rgba(255, 159, 64, 0.5)', // Orange color
								borderColor: 'rgba(255, 159, 64, 1)',
								borderWidth: 1,
							},
						],
					});
				} else {
					if (popularidadResult.status === 'rejected') {
						console.error(
							'Error loading popularity chart:',
							popularidadResult.reason
						);
					}
					setPopularidadData({ labels: [], datasets: [] });
				}

				if (claseIdParaInscritos !== null) {
					try {
						const inscritosData = await getInscritosClase(claseIdParaInscritos);
						const totalInscritos = inscritosData?.total_inscritos ?? '?';
						inscritosMsg = `${totalInscritos} / ${capacidadClase ?? '?'}`;
					} catch (inscritosError) {
						console.error(
							`Error loading enrollment for class ${claseIdParaInscritos}:`,
							inscritosError
						);
						inscritosMsg = 'Error';
					}
				} else if (
					proximaClaseResult.status === 'fulfilled' &&
					!proximaClaseResult.value?.tieneProxima
				) {
					inscritosMsg = '-';
				} else {
					inscritosMsg = 'Error';
				}

				setKpis({
					proximaClaseMsg: proximaClaseMsg,
					inscritosMsg: inscritosMsg,
					clasesHoy: clasesHoyData,
				});
			} catch (error) {
				console.error('Fatal error loading instructor dashboard data:', error);
				setError('Could not load all dashboard data.');
			} finally {
				setLoading(false);
			}
		};

		fetchInstructorData();
	}, []);

	return (
		<div className={styles.dashboard}>
			<div className={styles.header}>
				<h2>¡Hola, {user ? user.nombre : 'Instructor'}!</h2>
				<p>Este es tu resumen de clases.</p>
			</div>

			{loading && <Loading />}
			{error && <p style={{ color: 'red' }}>{error}</p>}

			{!loading && !error && (
				<>
					<div className={styles.resumenGrid}>
						<CardDashboard
							title="Próxima Clase Hoy"
							value={kpis.proximaClaseMsg}
							icon="teacher"
						/>
						<CardDashboard
							title="Inscritos (Próxima Clase)"
							value={kpis.inscritosMsg}
							icon="user"
						/>
						<CardDashboard
							title="Clases Programadas Hoy"
							value={kpis.clasesHoy}
							icon="calendar"
						/>
					</div>

					<div className={styles.chartsGrid}>
						<Card>
							<h3>Popularidad de Clases (Inscritos este Mes)</h3>
							<div className={styles.chartContainer}>
								<Bar
									data={popularidadData}
									options={{
										responsive: true,
										maintainAspectRatio: false,
									}}
								/>
							</div>
						</Card>
					</div>
				</>
			)}
		</div>
	);
}
