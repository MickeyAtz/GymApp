import { useEffect, useState } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';

import styles from './styles/CRUDPages.module.css';

import {
	getEmpleados,
	createEmpleado,
	updateEmpleado,
	deleteEmpleado,
	updatePassword,
} from '../api/empleados';

import { getRoles } from '../api/roles';

export default function EmpleadosPage() {
	const [empleados, setEmpleados] = useState([]);
	const [roles, setRoles] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState('');
	const [editData, setEditData] = useState(null);

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'email', label: 'Email' },
		{ field: 'telefono', label: 'Teléfono' },
		{ field: 'rol', label: 'Rol' },
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
			label: 'Nombre completo',
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
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'correo@ejemplo.com',
		},
		{
			name: 'telefono',
			label: 'Teléfono',
			type: 'text',
			placeholder: '555-123-4567',
		},
		{
			name: 'password',
			label: 'Contraseña',
			type: 'password',
			placeholder: '********',
		},
		{
			name: 'rol',
			label: 'Rol',
			type: 'select',
			placeholder: 'Seleccione un rol',
		},
	];

	useEffect(() => {
		fetchEmpleados();
		fetchRoles();
	}, []);

	const fetchEmpleados = async () => {
		const data = await getEmpleados();
		setEmpleados(data);
	};

	const fetchRoles = async () => {
		const data = await getRoles();
		setRoles(
			data.map((r) => ({
				value: r.id,
				label: r.nombre,
			}))
		);
	};

	const handleSubmit = async (formData) => {
		if (modalTitle === 'Cambiar contraseña') {
			if (formData.password !== formData.confirmPassword) {
				alert('Las contraseñas no coinciden');
				return;
			}
			await updatePassword(editData.id, { password: formData.password });
		} else if (editData) {
			await updateEmpleado(editData.id, formData);
		} else {
			await createEmpleado(formData);
		}
		setIsModalOpen(false);
		setEditData(null);
		fetchEmpleados();
	};

	const handleEdit = (empleado) => {
		setModalTitle('Editar Empleado');
		setEditData({
			...empleado,
			rol: empleado.role_id,
		});
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
			await deleteEmpleado(id);
			fetchEmpleados();
		}
	};

	const handlePasswordChange = async (empleado) => {
		setModalTitle('Cambiar contraseña');
		setEditData({
			...empleado,
			password: '',
		});
		setIsModalOpen(true);
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de empleados</h2>
				<Button
					onClick={() => {
						(setIsModalOpen(true), setModalTitle('Nuevo Empleado'));
					}}
					className={styles.addBtn}
				>
					Agregar Empleado
				</Button>
			</div>

			<Card title="Empleados registrados">
				<Table
					columns={columns}
					data={empleados}
					renderActions={(empleado) => (
						<>
							<Button
								onClick={() => handleEdit(empleado)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								onClick={() => handleDelete(empleado.id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
							<Button
								onClick={() => handlePasswordChange(empleado)}
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
								? fields
										.filter((f) => f.name !== 'password')
										.map((f) =>
											f.name === 'rol' ? { ...f, options: roles } : f
										)
								: fields.map((f) =>
										f.name === 'rol' ? { ...f, options: roles } : f
									)
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
