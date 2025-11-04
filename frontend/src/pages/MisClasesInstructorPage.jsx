import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import styles from './styles/CRUDPages.module.css';

import { toast } from 'react-toastify';

import {
	getMisClases,
	getAlumnosDeMiClase,
	eliminarAlumnoDeClase,
	createClase,
	updateClase,
	deleteClase,
} from '../api/instructores.js';

export default function MisClasesInstructorPage() {
	const [misClases, setMisClases] = useState([]);
	const [alumnos, setAlumnos] = useState([]);

	const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);
	const [deleteCliente, setDeleteCliente] = useState(null);
	const [isSaving, setIsSaving] = useState(false); // <-- MEJORA 1

	const [isAlumnosModalOpen, setIsAlumnosModalOpen] = useState(false);
	const [selectedClase, setSelectedClase] = useState(null);

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'dia', label: 'Día' },
		{ field: 'hora', label: 'Hora' },
		{
			field: 'cupos',
			label: 'Cupos',
			render: (clase) => (
				<strong>{`${clase.inscritos} / ${clase.capacidad}`}</strong>
			),
		},
	];

	const diasOptions = [
		'Lunes',
		'Martes',
		'Miercoles',
		'Jueves',
		'Viernes',
		'Sabado',
		'Domingo',
	].map((d) => ({ value: d, label: d }));

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

	const columnsAlumnos = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'email', label: 'Email' },
	];

	useEffect(() => {
		document.title = 'Gym App - Mis Clases';
		fetchMisClases();
	}, []);

	const fetchMisClases = async () => {
		try {
			const data = await getMisClases();
			setMisClases(data);
		} catch (error) {
			console.error(error.message);
			toast.error('Error al cargar clases.');
		}
	};

	const handleSubmitClase = async (formData) => {
		setIsSaving(true); // <-- MEJORA 1
		try {
			if (editData) {
				await updateClase(editData.id, formData);
				toast.success('¡Clase editada correctamente!');
			} else {
				await createClase(formData);
				toast.success('¡Clase creada con éxito!');
			}
			setIsCrudModalOpen(false);
			setEditData(null);
			fetchMisClases();
		} catch (error) {
			console.error(error.message);
			toast.error('No se pudo guardar la información.');
		} finally {
			setIsSaving(false); // <-- MEJORA 1
		}
	};

	const handleEditClase = (clase) => {
		setModalTitle('Editar Clase');
		const horaFormateada = clase.hora ? clase.hora.substring(0, 5) : '';
		setEditData({ ...clase, hora: horaFormateada });
		setIsCrudModalOpen(true);
	};

	const handleDeleteClase = async (claseId) => {
		setItemParaBorrar(claseId);
	};

	const handleConfirmDelete = async () => {
		try {
			await deleteClase(itemParaBorrar);
			toast.success('¡Clase eliminada con éxito!');
		} catch (err) {
			console.error(err);
			toast.error('Error al eliminar clase.');
		} finally {
			setItemParaBorrar(null);
			fetchMisClases();
		}
	};

	const handleOpenAlumnosModal = async (clase) => {
		try {
			setSelectedClase(clase);
			const data = await getAlumnosDeMiClase(clase.id);
			setAlumnos(data);
			console.log(data);
			setIsAlumnosModalOpen(true);
		} catch (error) {
			console.error(error.message);
		}
	};

	const handleCloseAlumnosModal = () => {
		setIsAlumnosModalOpen(false);
		setSelectedClase(null);
		setAlumnos([]);
		fetchMisClases();
	};

	const handleEliminarAlumno = async (inscripcionId) => {
		setDeleteCliente(inscripcionId);
	};

	const handleConfirmDeleteUsuario = async () => {
		try {
			await eliminarAlumnoDeClase(deleteCliente);
			toast.success('¡Cliente eliminado de la clase!');
			const data = await getAlumnosDeMiClase(selectedClase.id);
			setAlumnos(data);
		} catch (err) {
			console.error(err);
			toast.error('Error al eliminar cliente de la clase.');
		} finally {
			setDeleteCliente(null);
		}
	};

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
					icon="plus" // <-- MEJORA 2
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
								title="Gestionar Cupos"
							>
								Gestionar Cupos ({clase.inscritos})
							</Button>

							{/* --- MEJORA 2: Botones de Íconos --- */}
							<Button
								icon="edit"
								title="Editar"
								onClick={() => handleEditClase(clase)}
								variant="primary"
								size="small"
							/>
							<Button
								icon="trash"
								title="Eliminar"
								onClick={() => handleDeleteClase(clase.id)}
								variant="secondary"
								size="small"
							/>
						</>
					)}
				></Table>
			</Card>

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
					isSaving={isSaving} // <-- MEJORA 1
				></FormAtom>
			</Modal>

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
							icon="trash" // <-- MEJORA 2
							title="Eliminar Alumno"
							onClick={() => handleEliminarAlumno(alumno.inscripcion_id)}
							variant="secondary"
							size="small"
						>
							Eliminar
						</Button>
					)}
				></Table>
			</Modal>
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
							variant="secondary"
							onClick={handleConfirmDelete}
							icon="trash" // <-- MEJORA 2
						>
							Sí, Eliminar
						</Button>
						<Button variant="primary" onClick={() => setItemParaBorrar(null)}>
							Cancelar
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				title="Confirmar Eliminación"
				isOpen={deleteCliente !== null}
				onClose={() => setDeleteCliente(null)}
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar al usuario de esta clase? Esta
						acción no se puede deshacer.
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
							variant="secondary"
							onClick={handleConfirmDeleteUsuario}
							icon="trash" // <-- MEJORA 2
						>
							Sí, Eliminar
						</Button>
						<Button variant="primary" onClick={() => setDeleteCliente(null)}>
							Cancelar
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
