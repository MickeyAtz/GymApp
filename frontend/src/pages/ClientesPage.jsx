import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import styles from './styles/CRUDPages.module.css';
import { Navigate } from 'react-router-dom';

import {
	getUsuarios,
	createUsuario,
	updateUsuario,
	deleteUsuario,
	updatePassword,
} from '../api/usuarios';

export default function ClientesPage() {
	useEffect(() => {
		document.title = 'Gym App - Clientes';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const [clientes, setClientes] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);
	const [usuario, setUsuario] = useState(null);

	const obtenerUsuario = () => {
		const localUsuario = localStorage.getItem('usuario');
		setUsuario(localUsuario);
	};

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'apellidos', label: 'Apellidos' },
		{ field: 'email', label: 'Email' },
		{ field: 'telefono', label: 'Teléfono' },
		{ field: 'codigo_barras', label: 'Código' },
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
		{ name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Juan' },
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
	];

	useEffect(() => {
		fetchClientes();
		obtenerUsuario();
	}, []);

	const fetchClientes = async () => {
		const data = await getUsuarios();
		setClientes(data);
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
			await updateUsuario(editData.id, formData);
		} else {
			await createUsuario(formData);
		}
		setIsModalOpen(false);
		setEditData(null);
		fetchClientes();
	};

	const handleEdit = (cliente) => {
		setModalTitle('Editar Cliente');
		setEditData(cliente);
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
			await deleteUsuario(id);
			fetchClientes();
		}
	};

	const handlePasswordChange = async (cliente) => {
		setModalTitle('Cambiar contraseña');
		setEditData({
			...cliente,
			password: '',
		});
		setIsModalOpen(true);
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de clientes</h2>
				<Button
					onClick={() => (setIsModalOpen(true), setModalTitle('Nuevo Cliente'))}
					clasName={styles.addBtn}
				>
					Agregar Cliente
				</Button>
			</div>

			<Card title="Clientes registrados">
				<Table
					columns={columns}
					data={clientes}
					renderActions={(cliente) => (
						<>
							<Button
								onClick={() => handleEdit(cliente)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								onClick={() => handleDelete(cliente.id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
							<Button
								onClick={() => handlePasswordChange(cliente)}
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
