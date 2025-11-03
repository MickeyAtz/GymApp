import { useState, useEffect } from 'react';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import styles from './styles/CRUDPages.module.css';
import './styles/InscripcionCliente.css'; // (Este archivo CSS ya no sería tan necesario)

import Modal from '../components/molecules/Modal';

import { toast } from 'react-toastify';

import {
	getMisInscripciones,
	getClasesDisponibles,
	inscribirClase,
	darseDeBajaClase,
} from '../api/usuarios';

export default function InscripcionClientePage() {
	const [misInscripciones, setMisInscripciones] = useState([]);
	const [clasesDisponibles, setClasesDisponibles] = useState([]);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);

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
		try {
			const [inscripcionesData, disponiblesData] = await Promise.all([
				getMisInscripciones(),
				getClasesDisponibles(),
			]);
			setMisInscripciones(inscripcionesData);
			setClasesDisponibles(disponiblesData);
		} catch (err) {
			console.error(err);
			toast.error(err.message || 'Error al cargar los datos');
		}
	};

	const handleInscribir = async (claseId) => {
		try {
			await inscribirClase(claseId);
			toast.success('¡Inscripción realizada con éxito!');
			fetchData();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo inscribir');
		}
	};

	const handleDarseDeBaja = async (idInscripcion) => {
		setItemParaBorrar(idInscripcion);
	};

	const handleConfirmDelete = async () => {
		try {
			await darseDeBajaClase(itemParaBorrar);
			toast.info('¡Te diste de baja exitosamente!');
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo inscribir');
		} finally {
			setItemParaBorrar(null);
		}
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Inscripción a Clases</h2>
			</div>

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

			<div className={styles.header} style={{ marginTop: '2rem' }}>
				<h2>Clases Disponibles</h2>
			</div>

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
			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null}
				onClose={() => setItemParaBorrar(null)}
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar a esta clase? Esta acción no se
						puede deshacer.
					</p>

					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '1rem',
							marginTop: '2rem',
						}}
					>
						<Button
							variant="secondary" // (Asumiendo que 'secondary' es tu botón rojo)
							onClick={handleConfirmDelete}
						>
							Sí, Eliminar
						</Button>
						<Button
							variant="primary" // (O un botón neutral/dorado)
							onClick={() => setItemParaBorrar(null)}
						>
							Cancelar
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
