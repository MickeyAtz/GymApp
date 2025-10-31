import { useState, useEffect } from 'react';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import styles from './styles/CRUDPages.module.css';
import './styles/InscripcionCliente.css'; // (Este archivo CSS ya no sería tan necesario)

import {
	getMisInscripciones,
	getClasesDisponibles,
	inscribirClase,
	darseDeBajaClase,
} from '../api/usuarios';

export default function InscripcionClientePage() {
	const [misInscripciones, setMisInscripciones] = useState([]);
	const [clasesDisponibles, setClasesDisponibles] = useState([]);
	const [error, setError] = useState(null);

	const columnsMisClases = [
		{ field: 'clase_nombre', label: 'Clase' },
		{ field: 'instructor_nombre', label: 'Instructor' },
		{ field: 'dia', label: 'Día' },
		{
			field: 'hora',
			label: 'Hora',
			render: (insc) => (insc.hora ? insc.hora.substring(0, 5) : 'N/A'),
		},
	];

	// --- ¡NUEVO! Columnas para la Tabla 2 (Clases Disponibles) ---
	const columnsDisponibles = [
		{ field: 'nombre', label: 'Clase' },
		{ field: 'instructor_nombre', label: 'Instructor' },
		{ field: 'dia', label: 'Día' },
		{
			field: 'hora',
			label: 'Hora',
			render: (clase) => (clase.hora ? clase.hora.substring(0, 5) : 'N/A'),
		},
		{
			field: 'cupos',
			label: 'Cupos',
			render: (clase) => (
				<strong>{`${clase.inscritos} / ${clase.capacidad}`}</strong>
			),
		},
	];

	useEffect(() => {
		document.title = 'Gym App - Inscribir Clases';
		fetchData();
	}, []);

	const fetchData = async () => {
		setError(null);
		try {
			const [inscripcionesData, disponiblesData] = await Promise.all([
				getMisInscripciones(),
				getClasesDisponibles(),
			]);
			setMisInscripciones(inscripcionesData);
			setClasesDisponibles(disponiblesData);
		} catch (err) {
			console.error(err);
			setError(err.message || 'Error al cargar los datos');
		}
	};

	// --- Manejadores (siguen igual) ---
	const handleInscribir = async (claseId) => {
		// ... (sin cambios)
		setError(null);
		try {
			await inscribirClase(claseId);
			fetchData();
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.error || 'No se pudo inscribir');
		}
	};

	const handleDarseDeBaja = async (idInscripcion) => {
		// ... (sin cambios)
		setError(null);
		if (window.confirm('¿Seguro que deseas darte de baja de esta clase?')) {
			try {
				await darseDeBajaClase(idInscripcion);
				fetchData();
			} catch (err) {
				console.error(err);
				setError(err.response?.data?.error || 'No se pudo dar de baja');
			}
		}
	};


	return (
		<div>
			<div className={styles.header}>
				<h2>Inscripción a Clases</h2>
			</div>

			{error && <div className="clase-error-banner">{error}</div>}

			{/* --- Sección 1: Mis Clases (Sin cambios) --- */}
			<Card title="Mis Clases Inscritas">
				<Table
					columns={columnsMisClases}
					data={misInscripciones}
					renderActions={(inscripcion) => (
						<Button
							onClick={() => handleDarseDeBaja(inscripcion.inscripcion_id)}
							variant="secondary"
							size="small"
						>
							Darse de Baja
						</Button>
					)}
				/>
			</Card>

			{/* --- ¡CAMBIO! Sección 2: Clases Disponibles (Ahora es una Tabla) --- */}
			<div className={styles.header} style={{ marginTop: '2rem' }}>
				<h2>Clases Disponibles</h2>
			</div>

			{/* Reemplazamos el 'clase-grid-container' por este Card + Table */}
			<Card>
				<Table
					columns={columnsDisponibles}
					data={clasesDisponibles}
					renderActions={(clase) => {
						const cupoLleno = clase.inscritos >= clase.capacidad;
						return (
							<Button
								onClick={() => handleInscribir(clase.id)}
								disabled={cupoLleno}
								variant={cupoLleno ? 'secondary' : 'primary'}
								size="small"
							>
								{cupoLleno ? 'Clase Llena' : 'Inscribirme'}
							</Button>
						);
					}}
				/>
			</Card>
		</div>
	);
}
