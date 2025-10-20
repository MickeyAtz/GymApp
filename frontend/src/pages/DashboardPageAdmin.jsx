import { useEffect, useState } from 'react';
import styles from './styles/DashboardPageAdmin.module.css';
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
	});

	const fetchDashboardData = async () => {
		try {
			const [
				totalUsuariosRes,
				nuevosUsuariosRes,
				usuariosPorMesRes,
				totalMembresiasMesRes,
				totalMembresiasActivasRes,
				totalClasesRes,
				inscripcionesPorClaseRes,
			] = await Promise.all([
				getTotalUsuarios(),
				getNuevosUsuarios(),
				getUsuariosPorMes(),
				getTotalMembresiasMes(),
				getTotalMembresiasActivas(),
				getTotalClases(),
				getInscripcionesPorClase(),
			]);

			setDashboardData({
				totalUsuarios: totalUsuariosRes.totalUsuarios ?? 0,
				nuevosUsuarios: {
					count: nuevosUsuariosRes.count ?? 0,
					mes: nuevosUsuariosRes.mes ?? '',
					anio: nuevosUsuariosRes.anio ?? '',
				},
				usuariosPorMes: {
					labels: usuariosPorMesRes.labels ?? [],
					data: usuariosPorMesRes.data ?? [],
				},
				totalMembresiasMes: {
					total: totalMembresiasMesRes.total ?? 0,
					mes: totalMembresiasMesRes.mes ?? '',
					anio: totalMembresiasMesRes.anio ?? '',
				},
				totalMembresiasActivas: totalMembresiasActivasRes.total ?? 0,
				totalClases: totalClasesRes.total ?? 0,
				inscripcionesPorClase: {
					labels: inscripcionesPorClaseRes.labels ?? [],
					data: inscripcionesPorClaseRes.data ?? [],
				},
			});
		} catch (error) {
			console.error('Error al cargar datos del dashboard', error);
		}
	};

	useEffect(() => {
		fetchDashboardData();
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
			</div>
		</div>
	);
}
