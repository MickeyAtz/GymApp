import { useState, useEffect } from 'react';

// Importa tus componentes de UI
import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

// Importa los estilos
import styles from './styles/CRUDPages.module.css';

// Importa TODAS las funciones de API para el INSTRUCTOR
import {
	getMisClases,
	getAlumnosDeMiClase,
	eliminarAlumnoDeClase,
	createClase,
	updateClase,
	deleteClase,
} from '../api/instructores.js'; // (Tu archivo API que ya creamos)

export default function MisClasesInstructorPage() {
	// --- Estados ---
	const [misClases, setMisClases] = useState([]);
	const [alumnos, setAlumnos] = useState([]); // Estado para los alumnos del modal

	// Estados para el Modal 1 (CRUD Clases)
	const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);

	// Estados para el Modal 2 (Gestionar Alumnos)
	const [isAlumnosModalOpen, setIsAlumnosModalOpen] = useState(false);
	const [selectedClase, setSelectedClase] = useState(null);

	// --- Definiciones de Columnas y Campos ---

	// Columnas para la tabla principal
	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'dia', label: 'Día' },
		{ field: 'hora', label: 'Hora' },
		{
			field: 'cupos',
			label: 'Cupos',
			// Render personalizado para mostrar "inscritos / capacidad"
			render: (clase) => (
				<strong>{`${clase.inscritos} / ${clase.capacidad}`}</strong>
			),
		},
	];

	// Opciones para el select de días
	const diasOptions = [
		'Lunes',
		'Martes',
		'Miercoles',
		'Jueves',
		'Viernes',
		'Sabado',
		'Domingo',
	].map((d) => ({ value: d, label: d }));

	// Campos para el formulario de Crear/Editar Clase (Modal 1)
	const fieldsClase = [
		{ name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ej. Yoga' },
		{
			name: 'descripcion',
			label: 'Descripción',
			type: 'text',
			placeholder: 'Descripción de la clase',
		},
		{ name: 'dia', label: 'Día', type: 'select', options: diasOptions },
		{ name: 'hora', label: 'Hora', type: 'time' },
		{
			name: 'capacidad',
			label: 'Capacidad',
			type: 'number',
			placeholder: 'Ej. 20',
		},
	];

	// Columnas para la tabla de alumnos (Modal 2)
	const columnsAlumnos = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'email', label: 'Email' },
	];

	// --- Carga de Datos Inicial ---

	useEffect(() => {
		document.title = 'Gym App - Mis Clases';
		fetchMisClases();
	}, []);

	const fetchMisClases = async () => {
		try {
			const data = await getMisClases(); // Llama a la API
			setMisClases(data);
		} catch (error) {
			console.error(error.message);
			// Aquí deberías mostrar un error al usuario (ej. con un Toast)
		}
	};

	// --- MANEJO MODAL 1: CRUD Clases ---

	const handleSubmitClase = async (formData) => {
		try {
			if (editData) {
				// El 'id' de la clase viene de 'editData'
				await updateClase(editData.id, formData);
			} else {
				await createClase(formData);
			}
			setIsCrudModalOpen(false);
			setEditData(null);
			fetchMisClases(); // Recarga la tabla principal
		} catch (error) {
			console.error(error.message);
			// Mostrar error en el modal
		}
	};

	const handleEditClase = (clase) => {
		setModalTitle('Editar Clase');
		// El input 'time' necesita el formato HH:mm
		const horaFormateada = clase.hora ? clase.hora.substring(0, 5) : '';
		setEditData({ ...clase, hora: horaFormateada });
		setIsCrudModalOpen(true);
	};

	const handleDeleteClase = async (claseId) => {
		if (window.confirm('¿Seguro que deseas eliminar esta clase?')) {
			try {
				await deleteClase(claseId);
				fetchMisClases();
			} catch (error) {
				console.error(error.message);
			}
		}
	};

	// --- MANEJO MODAL 2: Gestionar Alumnos ---

	const handleOpenAlumnosModal = async (clase) => {
		try {
			setSelectedClase(clase); // Guarda la clase seleccionada
			const data = await getAlumnosDeMiClase(clase.id); // Llama a la API
			setAlumnos(data);
			setIsAlumnosModalOpen(true);
		} catch (error) {
			console.error(error.message);
		}
	};

	const handleCloseAlumnosModal = () => {
		setIsAlumnosModalOpen(false);
		setSelectedClase(null);
		setAlumnos([]);
		// Recargamos las clases por si el conteo de inscritos cambió
		fetchMisClases();
	};

	const handleEliminarAlumno = async (inscripcionId) => {
		if (
			window.confirm(
				'¿Seguro que deseas dar de baja a este alumno de la clase?'
			)
		) {
			try {
				await eliminarAlumnoDeClase(inscripcionId);
				// Recargamos la lista de alumnos en el modal
				const data = await getAlumnosDeMiClase(selectedClase.id);
				setAlumnos(data);
			} catch (error) {
				console.error(error.message);
			}
		}
	};

	// --- RENDERIZADO ---

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de Mis Clases</h2>
				<Button
					onClick={() => {
						setIsCrudModalOpen(true);
						setModalTitle('Nueva Clase');
						setEditData(null);
					}}
					className={styles.addBtn}
				>
					Agregar Clase
				</Button>
			</div>

			<Card title="Mis Clases Registradas">
				<Table
					columns={columns}
					data={misClases}
					renderActions={(clase) => (
						<>
							<Button
								onClick={() => handleOpenAlumnosModal(clase)}
								variant="tertiary"
								size="small"
							>
								Gestionar Cupos ({clase.inscritos})
							</Button>

							<Button
								onClick={() => handleEditClase(clase)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								// Pasamos el 'clase.id' que es la PK
								onClick={() => handleDeleteClase(clase.id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
						</>
					)}
				></Table>
			</Card>

			{/* Modal 1: Crear/Editar Clase */}
			<Modal
				title={modalTitle}
				isOpen={isCrudModalOpen}
				onClose={() => {
					setIsCrudModalOpen(false);
					setEditData(null);
				}}
			>
				<FormAtom
					fields={fieldsClase}
					initialData={editData || {}}
					onSubmit={handleSubmitClase}
					onCancel={() => setIsCrudModalOpen(false)}
				></FormAtom>
			</Modal>

			{/* Modal 2: Ver/Eliminar Alumnos */}
			<Modal
				title={`Alumnos en: ${selectedClase?.nombre || ''}`}
				isOpen={isAlumnosModalOpen}
				onClose={handleCloseAlumnosModal}
			>
				<Table
					columns={columnsAlumnos}
					data={alumnos}
					renderActions={(alumno) => (
						<Button
							// Pasamos el 'alumno.inscripcion_id'
							onClick={() => handleEliminarAlumno(alumno.inscripcion_id)}
							variant="secondary"
							size="small"
						>
							Eliminar
						</Button>
					)}
				></Table>
			</Modal>
		</div>
	);
}
