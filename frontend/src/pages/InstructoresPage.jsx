import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

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

	useEffect(() => {
		document.title = 'Gym App - Instructores';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'especialidad', label: 'Especialidad' },
		{ field: 'email', label: 'Email' },
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
		if (modalTitle === 'Cambiar contraseña') {
			if (formData.password !== formData.confirmPassword) {
				alert('Las contraseñas no coinciden');
				return;
			}
			await updatePassword(editData.id, { password: formData.password });
		}
		if (editData) {
			await updateInstructor(editData.id, formData);
		} else {
			await createInstructor(formData);
		}
		setIsModalOpen(false);
		setEditData(null);
		fetchInstructores();
	};

	const handleEdit = (instructor) => {
		setModalTitle('Editar Cliente');
		setEditData(instructor);
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm('¿Seguro que deseas eliminar este instructor?')) {
			await deleteInstructor(id);
			fetchInstructores();
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
								onClick={() => handleDelete(instructor.id)}
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
		</div>
	);
}
