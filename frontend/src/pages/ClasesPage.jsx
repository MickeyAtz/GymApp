import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import { toast } from 'react-toastify';

import styles from './styles/CRUDPages.module.css';

import {
	getClases,
	getClase,
	createClase,
	updateClase,
	deleteClase,
} from '../api/clases';

import { getAllInstructores } from '../api/instructores';
import { Navigate } from 'react-router-dom';

export default function ClasesPage() {
	useEffect(() => {
		document.title = 'Gym App - Clases';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const [clases, setClases] = useState([]);
	const [instructores, setInstructores] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);

	const [usuario, setUsuario] = useState(null);

	const obtenerUsuario = () => {
		const localUsuario = localStorage.getItem('usuario');
		setUsuario(localUsuario);
	};

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'descripcion', label: 'Descripción' },
		{ field: 'instructor', label: 'Instructor' },
		{ field: 'dia', label: 'Día' },
		{ field: 'hora', label: 'Hora' },
		{ field: 'capacidad', label: 'Capacidad' },
	];

	const dias = [
		'Lunes',
		'Martes',
		'Miercoles',
		'Jueves',
		'Viernes',
		'Sabado',
		'Domingo',
	];

	const fields = [
		{
			name: 'nombre',
			label: 'Nombre',
			type: 'text',
			placeholder: 'Ej. Yoga',
		},
		{
			name: 'descripcion',
			label: 'Descripción',
			type: 'text',
			placeholder: 'Descripción',
		},
		{
			name: 'instructor',
			label: 'Instructor',
			type: 'select',
			placeholder: 'Selecciona un instructor',
		},
		{
			name: 'dia',
			label: 'Día',
			type: 'select',
			placeholder: 'Selecciona un día de la semana',
		},
		{
			name: 'capacidad',
			label: 'Capacidad',
			type: 'number',
			placeholder: 'Ingresa la capacidad de la clase',
		},
		{
			name: 'hora',
			label: 'Hora',
			type: 'time',
		},
	];

	useEffect(() => {
		fetchClases();
		fetchInstructores();
		obtenerUsuario();
	}, []);

	const fetchClases = async () => {
		const data = await getClases();
		setClases(data);
	};

	const fetchInstructores = async () => {
		const data = await getAllInstructores();
		setInstructores(data);
	};

	const handleSubmit = async (formData) => {
		const payload = { ...formData };

		try {
			if (editData) {
				await updateClase(editData.id, payload);
				toast.success('¡Clase actualizada con éxito!');
			} else {
				await createClase(payload);
				toast.success('¡Clase creada exitosamente!');
			}
			setIsModalOpen(false);
			setEditData(null);
			fetchClases();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo guardar la clase.');
		}
	};

	const handleEdit = (clase) => {
		setModalTitle('Editar Clase');
		setEditData({
			...clase,
			instructor: clase.instructor,
			dia: clase.dia,
			hora: clase.hora,
		});
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		setItemParaBorrar(id);
	};

	const handleConfirmDelete = async () => {
		if (!itemParaBorrar) return;

		try {
			await deleteClase(itemParaBorrar);
			toast.info('Clase eliminada correctamente.');
			fetchClases();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo eliminar la clase');
		} finally {
			setItemParaBorrar(null);
		}
	};

	const instructorOptions = instructores.map((i) => ({
		value: i.id,
		label: i.nombre,
	}));

	const diaOptions = dias.map((d) => ({
		value: d,
		label: d,
	}));

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de clases</h2>
				<Button
					onClick={() => {
						(setIsModalOpen(true),
							setModalTitle('Nueva Clase'),
							setEditData(null));
					}}
					className={styles.addBtn}
				>
					Agregar Clase
				</Button>
			</div>

			<Card title="Clases registradas">
				<Table
					columns={columns}
					data={clases}
					renderActions={(clase) => (
						<>
							<Button
								onClick={() => handleEdit(clase)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								onClick={() => handleDelete(clase.id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
						</>
					)}
				></Table>
			</Card>

			<Modal
				title={modalTitle}
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditData(null);
				}}
			>
				<FormAtom
					fields={[
						{ ...fields[0] },
						{ ...fields[1] },
						{ ...fields[2], options: instructorOptions },
						{ ...fields[3], options: diaOptions },
						{ ...fields[4] },
						{ ...fields[5] },
					]}
					initialData={editData || {}}
					onSubmit={handleSubmit}
					onCancel={() => {
						setIsModalOpen(false);
						setEditData(null);
					}}
				></FormAtom>
			</Modal>

			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null} // Se abre si 'itemParaBorrar' no es null
				onClose={() => setItemParaBorrar(null)} // Se cierra al cancelar
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
