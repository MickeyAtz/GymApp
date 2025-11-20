import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';
import Button from '../components/atoms/Button';
import CardDashboard from '../components/atoms/CardDashboard';
import ChartsGrid from '../components/organism/ChartsGrid';

import { getReportePagosJSON, getReportePagosPDF } from '../api/reportes.js';
import { getResumenPagosTiempo } from '../api/dashboard';

import { formatDateTime, capitalizeFirstLetter } from '../utils/formatDate.js';

import styles from './styles/CRUDPages.module.css';
import stylesReporte from './styles/ReportesPage.module.css';

export default function ReportesPage() {
	const [dateRange, setDateRange] = useState([new Date(), new Date()]);

	const [reportSummary, setReportSummary] = useState(null);
	const [chartData, setChartData] = useState([]);
	const [tableData, setTableData] = useState(null);

	// Inicializamos con valores seguros (ceros) en lugar de null para evitar crashes
	const [globalKpis, setGlobalKpis] = useState({
		monto_hoy: 0,
		pagos_hoy: 0,
		monto_semana: 0,
		monto_mes: 0,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isGlobalKpisLoading, setIsGlobalKpisLoading] = useState(true);

	useEffect(() => {
		document.title = 'Gym App - Reportes';
		fetchGlobalKpis();
	}, []);

	// 🛡️ FUNCIÓN BLINDADA CONTRA ERRORES
	const fetchGlobalKpis = async () => {
		try {
			const data = await getResumenPagosTiempo();

			// Verificamos si data existe antes de usarlo
			if (data) {
				setGlobalKpis({
					monto_hoy: parseFloat(data.monto_hoy || 0),
					pagos_hoy: parseInt(data.pagos_hoy || 0),
					monto_semana: parseFloat(data.monto_semana || 0),
					monto_mes: parseFloat(data.monto_mes || 0),
				});
			} else {
				// Si no hay data, no hacemos nada (se quedan los ceros iniciales)
				console.warn('La API de KPIs globales no devolvió datos.');
			}
		} catch (err) {
			console.error('Error fetching global KPIs:', err);
			// No mostramos toast de error para no saturar, ya tenemos valores por defecto (0)
		} finally {
			setIsGlobalKpisLoading(false);
		}
	};

	const processReportData = (data) => {
		// Protección extra por si data viene vacía
		if (!data || !data.pagos) return;

		const { pagos, total_ingresos } = data;
		const totalTransacciones = pagos.length;
		const montoPromedio =
			totalTransacciones > 0 ? total_ingresos / totalTransacciones : 0;

		const formattedPagos = pagos.map((pago) => ({
			...pago,
			cliente_completo:
				`${pago.cliente_nombre || ''} ${pago.cliente_apellidos || ''}`.trim(),
			fecha_pago: formatDateTime(pago.fecha_pago),
			monto: `$${parseFloat(pago.monto).toFixed(2)}`,
			tipo_pago: capitalizeFirstLetter(pago.tipo_pago),
		}));

		const paymentDistribution = pagos.reduce((acc, pago) => {
			const type = capitalizeFirstLetter(pago.tipo_pago);
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {});

		const membershipCounts = pagos.reduce((acc, pago) => {
			const name = pago.membresia_nombre || 'Desconocida';
			acc[name] = (acc[name] || 0) + 1;
			return acc;
		}, {});

		const sortedMemberships = Object.entries(membershipCounts).sort(
			(a, b) => b[1] - a[1]
		);
		const topMembership =
			sortedMemberships.length > 0 ? sortedMemberships[0][0] : 'N/A';

		const charts = [
			{
				id: 1,
				type: 'pie',
				title: 'Distribución de Métodos de Pago',
				labels: Object.keys(paymentDistribution),
				data: Object.values(paymentDistribution),
			},
			{
				id: 2,
				type: 'bar',
				title: 'Ventas por Tipo de Membresía',
				labels: sortedMemberships.map(([name]) => name),
				data: sortedMemberships.map(([name, count]) => count),
			},
		];

		setReportSummary({
			total_ingresos: total_ingresos || 0,
			totalTransacciones,
			montoPromedio,
			topMembership,
			fecha_inicio: data.fecha_inicio,
			fecha_fin: data.fecha_fin,
		});

		setChartData(charts);
		setTableData(formattedPagos);
	};

	const formatDateForAPI = (date) => {
		return date.toISOString().split('T')[0];
	};

	const handleBuscar = async () => {
		if (dateRange.length < 2) {
			toast.error('Por favor selecciona un rango de fechas.');
			return;
		}
		setIsLoading(true);
		// Limpiamos estados previos
		setReportSummary(null);
		setTableData(null);
		setChartData([]);

		try {
			const [inicio, fin] = dateRange.map(formatDateForAPI);
			const data = await getReportePagosJSON(inicio, fin);
			processReportData(data);
		} catch (err) {
			console.error(err);
			toast.error('Error al generar el reporte.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleExportar = async () => {
		if (!reportSummary) return;
		const [inicio, fin] = dateRange.map(formatDateForAPI);
		toast.info('Generando PDF...');
		try {
			const blob = await getReportePagosPDF(inicio, fin);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `reporte_${inicio}_${fin}.pdf`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			console.error(err);
			toast.error('Error al descargar PDF.');
		}
	};

	const columns = [
		{ field: 'fecha_pago', label: 'FECHA Y HORA' },
		{ field: 'cliente_completo', label: 'CLIENTE' },
		{ field: 'membresia_nombre', label: 'MEMBRESÍA' },
		{ field: 'tipo_pago', label: 'MÉTODO' },
		{ field: 'monto', label: 'MONTO' },
	];

	return (
		<div>
			<div className={styles.header}>
				<h2>Reporte de Ingresos</h2>
			</div>

			<Card
				title="Resumen Global de Ingresos"
				subtitle="Métricas en tiempo real"
			>
				{isGlobalKpisLoading ? (
					<p>Cargando métricas...</p>
				) : (
					<div className={stylesReporte.resumenGrid}>
						<CardDashboard
							title="Ingreso de Hoy"
							// 🛡️ Uso de Optional Chaining (?.) y fallback (|| 0)
							value={`$${(globalKpis?.monto_hoy || 0).toFixed(2)}`}
							icon="money"
						/>
						<CardDashboard
							title="Transacciones Hoy"
							value={globalKpis?.pagos_hoy || 0}
							icon="bag"
						/>
						<CardDashboard
							title="Ingreso Semanal"
							value={`$${(globalKpis?.monto_semana || 0).toFixed(2)}`}
							icon="money"
						/>
						<CardDashboard
							title="Ingreso Mensual"
							value={`$${(globalKpis?.monto_mes || 0).toFixed(2)}`}
							icon="money"
						/>
					</div>
				)}
			</Card>

			<Card title="Análisis por Rango de Fechas" style={{ marginTop: '2rem' }}>
				<div className={stylesReporte.filtrosContainer}>
					<div className={stylesReporte.datePickerWrapper}>
						<label>Selecciona rango:</label>
						<Flatpickr
							options={{
								mode: 'range',
								dateFormat: 'Y-m-d',
								defaultDate: [new Date(), new Date()],
							}}
							value={dateRange}
							onChange={(dates) => setDateRange(dates)}
							className={stylesReporte.datePicker}
						/>
					</div>
					<div className={stylesReporte.botones}>
						<Button
							onClick={handleBuscar}
							disabled={isLoading}
							variant="primary"
						>
							{isLoading ? 'Buscando...' : 'Buscar'}
						</Button>
						<Button
							onClick={handleExportar}
							disabled={!reportSummary}
							variant="tertiary"
						>
							PDF
						</Button>
					</div>
				</div>

				{reportSummary && (
					<div className={stylesReporte.resultados}>
						<h3 className={stylesReporte.sectionTitle}>Resumen del Periodo</h3>
						<div className={stylesReporte.resumenGrid}>
							<CardDashboard
								title="Total Ingresos"
								value={`$${reportSummary.total_ingresos.toFixed(2)}`}
								icon="money"
							/>
							<CardDashboard
								title="Transacciones"
								value={reportSummary.totalTransacciones}
								icon="bag"
							/>
							<CardDashboard
								title="Venta Promedio"
								value={`$${reportSummary.montoPromedio.toFixed(2)}`}
								icon="money"
							/>
							<CardDashboard
								title="Top Membresía"
								value={reportSummary.topMembership}
								icon="id"
							/>
						</div>

						<h3 className={stylesReporte.sectionTitle}>Gráficos</h3>
						<ChartsGrid charts={chartData} />

						<h3 className={stylesReporte.sectionTitle}>Detalle</h3>
						<Card>
							<Table columns={columns} data={tableData} rowsPerPage={10} />
						</Card>
					</div>
				)}
			</Card>
		</div>
	);
}
