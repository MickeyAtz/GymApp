import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/dark.css';

// Tus componentes
import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';
import Button from '../components/atoms/Button';
import CardDashboard from '../components/atoms/CardDashboard'; // Para el total

// Tus funciones de API
import { getReportePagosJSON, getReportePagosPDF } from '../api/reportes.js';

// Estilos
import styles from './styles/CRUDPages.module.css'; // Estilo de header
import stylesReporte from './styles/ReportesPage.module.css'; // Estilos específicos

export default function ReportesPage() {
	const [dateRange, setDateRange] = useState([new Date(), new Date()]);
	const [reportData, setReportData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		document.title = 'Gym App - Reportes';
	}, []);

	const columns = [
		{
			field: 'fecha_pago',
			label: 'Fecha y Hora',
			render: (pago) =>
				new Date(pago.fecha_pago).toLocaleString('es-ES', {
					dateStyle: 'short',
					timeStyle: 'short',
				}),
		},
		{
			field: 'cliente',
			label: 'Cliente',
			render: (pago) => `${pago.cliente_nombre} ${pago.cliente_apellidos}`,
		},
		{ field: 'membresia_nombre', label: 'Membresía' },
		{ field: 'tipo_pago', label: 'Método' },
		{
			field: 'monto',
			label: 'Monto',
			render: (pago) => `$${parseFloat(pago.monto).toFixed(2)}`,
		},
	];

	const formatDateForAPI = (date) => {
		return date.toISOString().split('T')[0];
	};

	const handleBuscar = async () => {
		if (dateRange.length < 2) {
			toast.error('Por favor selecciona un rango de fechas.');
			return;
		}
		setIsLoading(true);
		setReportData(null);
		try {
			const [inicio, fin] = dateRange.map(formatDateForAPI);
			const data = await getReportePagosJSON(inicio, fin);
			setReportData(data);
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'Error al generar el reporte.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleExportar = async () => {
		if (dateRange.length < 2) {
			toast.error('Por favor selecciona un rango de fechas primero.');
			return;
		}

		const [inicio, fin] = dateRange.map(formatDateForAPI);
		toast.info('Generando PDF... por favor espera.');

		try {
			const blob = await getReportePagosPDF(inicio, fin);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `reporte_pagos_${inicio}_al_${fin}.pdf`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			toast.error('Error al descargar el PDF.');
		}
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Reporte de Ingresos</h2>
			</div>

			<Card title="Reporte de Ingresos">
				<div className={stylesReporte.filtrosContainer}>
					<div className={stylesReporte.datePickerWrapper}>
						<label>Selecciona un rango de fechas:</label>
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
							disabled={!reportData}
							variant="tertiary"
						>
							Exportar a PDF
						</Button>
					</div>
				</div>

				{reportData && (
					<div className={stylesReporte.resultados}>
						<div className={stylesReporte.totalCard}>
							<CardDashboard
								title={`Total de Ingresos (${reportData.fecha_inicio} al ${reportData.fecha_fin})`}
								value={`$${reportData.total_ingresos.toFixed(2)}`}
								icon="money"
							/>
						</div>
						<Table columns={columns} data={reportData.pagos} rowsPerPage={10} />
					</div>
				)}
			</Card>
		</div>
	);
}
