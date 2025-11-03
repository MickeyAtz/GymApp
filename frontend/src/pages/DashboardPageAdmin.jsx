import { useEffect, useState } from 'react';
import styles from './styles/DashboardPages.module.css';
import Card from '../components/molecules/Card';
import CardDashboard from '../components/atoms/CardDashboard';
import { Line, Bar } from 'react-chartjs-2';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import {
	getTotalUsuarios,
	getNuevosUsuarios,
	getUsuariosPorMes,
	getTotalMembresiasMes,
	getTotalMembresiasActivas,
	getTotalClases,
	getInscripcionesPorClase,
	getVisitasMes,
	getVisitasSemana,
} from '../api/dashboard';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export default function DashboardPageAdmin() {
	const [dashboardData, setDashboardData] = useState({
		totalUsuarios: 0,
		nuevosUsuarios: { count: 0, mes: '', anio: '' },
		usuariosPorMes: { labels: [], data: [] },
		totalMembresiasMes: { total: 0, mes: '', anio: '' },
		totalMembresiasActivas: 0,
		totalClases: 0,
		inscripcionesPorClase: { labels: [], data: [] },
		visitasMensuales: { labels: [], data: [] },
		visitasSemanales: { labels: [], data: [] },
	});

	useEffect(() => {
		document.title = 'Mi Dashboard - Empleados';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	useEffect(() => {
		getTotalUsuarios()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					totalUsuarios: data?.totalUsuarios ?? 0,
				}));
			})
			.catch((err) => console.error('ERROR en getTotalUsuarios:', err));
	}, []);

	useEffect(() => {
		getNuevosUsuarios()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					nuevosUsuarios: {
						count: data?.count ?? 0,
						mes: data?.mes ?? '',
						anio: data?.anio ?? '',
					},
				}));
			})
			.catch((err) => console.error('ERROR en getNuevosUsuarios:', err));
	}, []);

	useEffect(() => {
		getUsuariosPorMes()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					usuariosPorMes: {
						labels: data?.labels ?? [],
						data: data?.data ?? [],
					},
				}));
			})
			.catch((err) => console.error('ERROR en getUsuariosPorMes:', err));
	}, []);

	useEffect(() => {
		getTotalMembresiasMes()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					totalMembresiasMes: {
						total: data?.total ?? 0,
						mes: data?.mes ?? '',
						anio: data?.anio ?? '',
					},
				}));
			})
			.catch((err) => console.error('ERROR en getTotalMembresiasMes:', err));
	}, []);

	useEffect(() => {
		getTotalMembresiasActivas()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					totalMembresiasActivas: data?.total ?? 0,
				}));
			})
			.catch((err) =>
				console.error('ERROR en getTotalMembresiasActivas:', err)
			);
	}, []);

	useEffect(() => {
		getTotalClases()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					totalClases: data?.total ?? 0,
				}));
			})
			.catch((err) => console.error('ERROR en getTotalClases:', err));
	}, []);

	useEffect(() => {
		getInscripcionesPorClase()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					inscripcionesPorClase: {
						labels: data?.labels ?? [],
						data: data?.data ?? [],
					},
				}));
			})
			.catch((err) => console.error('ERROR en getInscripcionesPorClase:', err));
	}, []);

	useEffect(() => {
		getVisitasMes()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					visitasMensuales: {
						// Asumimos que el backend ya da el formato {labels, data}
						labels: data?.labels ?? [],
						data: data?.data ?? [],
					},
				}));
			})
			.catch((err) => console.error('ERROR en getVisitasMes:', err));
	}, []);

	useEffect(() => {
		getVisitasSemana()
			.then((data) => {
				setDashboardData((prev) => ({
					...prev,
					visitasSemanales: {
						// Asumimos que el backend ya da el formato {labels, data}
						labels: data?.labels ?? [],
						data: data?.data ?? [],
					},
				}));
			})
			.catch((err) => console.error('ERROR en getVisitasSemana:', err));
	}, []);

	return (
		<div className={styles.dashboard}>
			<div className={styles.header}>
				<h2>Dashboard - Administrador</h2>
			</div>
			<div className={styles.resumenGrid}>
				<CardDashboard
					title="Clientes Totales"
					value={dashboardData.totalUsuarios}
					icon="user"
				></CardDashboard>
				<CardDashboard
					title={`Nuevos Clientes (${dashboardData.nuevosUsuarios.mes} ${dashboardData.nuevosUsuarios.anio} )`}
					value={dashboardData.nuevosUsuarios.count}
					icon="user"
				></CardDashboard>
				<CardDashboard
					title={`Membresías Registradas (${dashboardData.totalMembresiasMes.mes} ${dashboardData.totalMembresiasMes.anio})`}
					value={dashboardData.totalMembresiasMes.total}
					icon="id"
				></CardDashboard>
				<CardDashboard
					title="Membresías Activas"
					value={dashboardData.totalMembresiasActivas}
					icon="id"
				></CardDashboard>
				<CardDashboard
					title="Total de Clases"
					value={dashboardData.totalClases}
					icon="teacher"
				></CardDashboard>
			</div>

			{/* Gráficos */}
			<div className={styles.chartsGrid}>
				<Card title="Clientes por Mes">
					<Line
						data={{
							labels: dashboardData.usuariosPorMes.labels,
							datasets: [
								{
									label: 'Usuarios',
									data: dashboardData.usuariosPorMes.data,
									backgroundColor: 'rgba(54, 162, 235, 0.5)',
									borderColor: 'rgba(54, 162, 235, 1)',
									borderWidth: 2,
									tension: 0.3,
								},
							],
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
					/>
				</Card>
				<Card title="Inscripciones por Clase">
					<Bar
						data={{
							labels: dashboardData.inscripcionesPorClase.labels,
							datasets: [
								{
									label: 'Inscripciones',
									data: dashboardData.inscripcionesPorClase.data,
									backgroundColor: 'rgba(255, 99, 132, 0.5)',
									borderColor: 'rgba(255, 99, 132, 1)',
									borderWidth: 1,
								},
							],
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
					/>
				</Card>
				<Card title="Visitas Semanales">
					<Bar
						data={{
							labels: dashboardData.visitasSemanales.labels,
							datasets: [
								{
									label: 'Visitas Semanales',
									data: dashboardData.visitasSemanales.data,
									backgroundColor: 'rgba(255, 99, 132, 0.5)',
									borderColor: 'rgba(255, 99, 132, 1)',
									borderWidth: 1,
								},
							],
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
					></Bar>
				</Card>
				<Card title="Visitas Mensuales">
					<Bar
						data={{
							labels: dashboardData.visitasMensuales.labels,
							datasets: [
								{
									label: 'Visitas Mensuales',
									data: dashboardData.visitasMensuales.data,
									backgroundColor: 'rgba(255, 99, 132, 0.5)',
									borderColor: 'rgba(255, 99, 132, 1)',
									borderWidth: 1,
								},
							],
						}}
						options={{ responsive: true, maintainAspectRatio: false }}
					></Bar>
				</Card>
			</div>
		</div>
	);
}
