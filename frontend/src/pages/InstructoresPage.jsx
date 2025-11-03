import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import { toast } from 'react-toastify';

import styles from './styles/CRUDPages.module.css';

import {
	getAllInstructores,
	createInstructor,
	updateInstructor,
	deleteInstructor,
	updatePassword,
} from '../api/instructores';

export default function InstructoresPage() {
	const [instructores, setInstructores] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);

	useEffect(() => {
		document.title = 'Gym App - Instructores';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'email', label: 'Email' },
		{ field: 'especialidad', label: 'Especialidad' },
		{ field: 'telefono', label: 'Teléfono' },
	];

	const passwordChangeFields = [
		{
			name: 'password',
			label: 'Contraseña',
			type: 'password',
			placeholder: '**********',
		},
		{
			name: 'confirmPassword',
			label: 'Confirmar contraseña',
			type: 'password',
			placeholder: '***********',
		},
	];

	const fields = [
		{
			name: 'nombre',
			label: 'Nombre',
			type: 'text',
			placeholder: 'Juan',
		},
		{
			name: 'apellidos',
			label: 'Apellidos',
			type: 'text',
			placeholder: 'Pérez',
		},
		{
			name: 'especialidad',
			label: 'Especialidad',
			type: 'text',
			placeholder: 'Yoga',
		},
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'correo@ejemplo.com',
		},
		{
			name: 'telefono',
			label: 'Teléfono',
			type: 'text',
			placeholder: '5551234567',
		},
		{
			name: 'password',
			label: 'Contraseña',
			type: 'password',
			placeholder: '********',
		},
	];

	useEffect(() => {
		fetchInstructores();
	}, []);

	const fetchInstructores = async () => {
		const data = await getAllInstructores();
		setInstructores(data);
	};

	const handleSubmit = async (formData) => {
		try {
			if (modalTitle === 'Cambiar contraseña') {
				if (formData.password !== formData.confirmPassword) {
					alert('Las contraseñas no coinciden');
					return;
				}
				await updatePassword(editData.instructor_id, {
					password: formData.password,
				});
				toast.success('¡Contraseña actualizada con éxito!');
			}
			if (editData) {
				await updateInstructor(editData.instructor_id, formData);
				toast.success('¡Instructor actualizado con éxito!');
			} else {
				await createInstructor(formData);
				toast.success('¡Instructor creado con éxito!');
			}
			setIsModalOpen(false);
			setEditData(null);
			fetchInstructores();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo guardar el instructor.'
			);
		}
	};

	const handleEdit = (instructor) => {
		setModalTitle('Editar Cliente');
		setEditData(instructor);
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		setItemParaBorrar(id);
	};

	const handleConfirmDelete = async () => {
		if (!itemParaBorrar) return;

		try {
			await deleteInstructor(itemParaBorrar);
			toast.info('¡Instructor eliminado correctamente!');
			fetchInstructores();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo eliminar el instructor.'
			);
		} finally {
			setItemParaBorrar(null);
		}
	};

	const handlePasswordChange = async (instructor) => {
		setModalTitle('Cambiar contraseña');
		setEditData({
			...instructor,
			password: '',
		});
		setIsModalOpen(true);
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de instructores</h2>
				<Button
					onClick={() => (
						setModalTitle('Nuevo Instructor'),
						setIsModalOpen(true)
					)}
					clasName={styles.addBtn}
				>
					Agregar Instructor
				</Button>
			</div>

			<Card title="Instructores registrados">
				<Table
					columns={columns}
					data={instructores}
					renderActions={(instructor) => (
						<>
							<Button
								onClick={() => handleEdit(instructor)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								onClick={() => handleDelete(instructor.instructor_id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
							<Button
								onClick={() => handlePasswordChange(instructor)}
								variant="tertiary"
								size="small"
							>
								Cambiar contraseña
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
					fields={
						modalTitle === 'Cambiar contraseña'
							? passwordChangeFields
							: editData
								? fields.filter((field) => field.name !== 'password')
								: fields
					}
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
						¿Estás seguro de que deseas eliminar a este instructor? Esta acción
						no se puede deshacer.
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
