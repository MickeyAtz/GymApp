import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import { toast } from 'react-toastify';

import styles from './styles/CRUDPages.module.css';
import { Navigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';

import {
	getAllUsuarios,
	createUsuario,
	updateUsuario,
	deleteUsuario,
	updatePasswordUsuario,
} from '../api/usuarios';

import { getMembresiaActivaUsuario } from '../api/membresias';
import { formatDateTime } from '../utils/formatDate';

export default function ClientesPage() {
	const { user, setUser } = useUser();

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
	const [itemParaBorrar, setItemParaBorrar] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
	const [selectedMembership, setSelectedMembership] = useState(null);
	const [loadingMembership, setLoadingMembership] = useState(false);

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
		{ field: 'status', label: 'Membresía' }, // <-- Columna Status
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
		const data = await getAllUsuarios();
		setClientes(data);
	};

	const handleSubmit = async (formData) => {
		setIsSaving(true);
		try {
			if (modalTitle === 'Cambiar contraseña') {
				if (formData.password !== formData.confirmPassword) {
					toast.error('Las contraseñas no coinciden');
					return;
				}
				await updatePasswordUsuario(editData.usuario_id, {
					password: formData.password,
				});
				toast.success('Contraseña actualizada con éxito.');
			}
			if (editData) {
				await updateUsuario(editData.usuario_id, formData);
				toast.success('¡Cliente actualizado con éxito!');
			} else {
				await createUsuario(formData);
				toast.success('¡Cliente creado con éxito!');
			}
			setIsModalOpen(false);
			setEditData(null);
			fetchClientes();
		} catch (err) {
			console.error('Error en el handleSubmit:', err);
			toast.error(
				err.response?.data?.error ||
					'Ocurrió un error. Por favor, intenta de nuevo.'
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleEdit = (cliente) => {
		setModalTitle('Editar Cliente');
		setEditData(cliente);
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		setItemParaBorrar(id);
	};

	const handleConfirmDelete = async () => {
		if (!itemParaBorrar) return;
		try {
			await deleteUsuario(itemParaBorrar);
			toast.info('Cliente eliminado correctamente.');
			fetchClientes();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo eliminar el cliente.'
			);
		} finally {
			setItemParaBorrar(null);
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

	const handleViewMembership = async (cliente) => {
		if (!cliente.membresia_activa) return;

		setLoadingMembership(true);
		try {
			const data = await getMembresiaActivaUsuario(cliente.usuario_id);

			if (data && data.activa) {
				setSelectedMembership(data);
				setIsMembershipModalOpen(true);
			} else {
				toast.warn('No se encontraron detalles de la membresía activa.');
			}
		} catch (error) {
			console.error(error);
			toast.error('Error al cargar detalles de la membresía.');
		} finally {
			setLoadingMembership(false);
		}
	};

	const renderCell = (row, field) => {
		if (field === 'status') {
			const isActive = row.membresia_activa;
			return (
				<Button
					size="small"
					variant={isActive ? 'success' : 'secondary'}
					onClick={() => isActive && handleViewMembership(row)}
					title={
						isActive ? 'Ver detalles de membresía' : 'Sin membresía activa'
					}
					disabled={loadingMembership && isActive}
				>
					{loadingMembership && isActive
						? 'Cargando...'
						: isActive
							? 'Activa'
							: 'Inactiva'}
				</Button>
			);
		}
		return row[field];
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de clientes</h2>
				<Button
					onClick={() => (setIsModalOpen(true), setModalTitle('Nuevo Cliente'))}
					icon="plus"
				>
					Agregar Cliente
				</Button>
			</div>

			<Card title="Clientes registrados">
				<Table
					columns={columns}
					data={clientes}
					renderCell={renderCell}
					renderActions={(cliente) => (
						<>
							<Button
								icon="edit"
								title="Editar"
								onClick={() => handleEdit(cliente)}
								variant="primary"
								size="small"
							/>
							<Button
								icon="trash"
								title="Eliminar"
								onClick={() => handleDelete(cliente.usuario_id)}
								variant="secondary"
								size="small"
							/>
							<Button
								onClick={() => handlePasswordChange(cliente)}
								variant="tertiary"
								size="small"
								title="Cambiar contraseña"
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
					isSaving={isSaving}
				></FormAtom>
			</Modal>

			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null}
				onClose={() => setItemParaBorrar(null)}
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar a este cliente? Esta acción no
						se puede deshacer.
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
							icon="trash"
						>
							Sí, Eliminar
						</Button>
						<Button variant="primary" onClick={() => setItemParaBorrar(null)}>
							Cancelar
						</Button>
					</div>
				</div>
			</Modal>

			{/* --- NUEVO MODAL: DETALLES DE MEMBRESÍA --- */}
			<Modal
				title="Detalles de Membresía Activa"
				isOpen={isMembershipModalOpen}
				size="medium"
				onClose={() => {
					setIsMembershipModalOpen(false);
					setSelectedMembership(null);
				}}
			>
				{selectedMembership ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '1rem',
							color: 'var(--color-text)',
						}}
					>
						<div
							style={{
								backgroundColor: 'var(--color-input-bg)',
								padding: '1.5rem',
								borderRadius: '8px',
								border: '1px solid var(--color-primary)',
							}}
						>
							<h3 style={{ color: 'var(--color-primary)', marginTop: 0 }}>
								{selectedMembership.membresia_nombre}
							</h3>

							<p>
								<strong>Estado:</strong>{' '}
								<span
									style={{ color: 'var(--color-success)', fontWeight: 'bold' }}
								>
									ACTIVA
								</span>
							</p>
							<p>
								<strong>Inició:</strong>{' '}
								{formatDateTime(selectedMembership.fecha_inicio)}
							</p>
							<p>
								<strong>Vence:</strong>{' '}
								{formatDateTime(selectedMembership.fecha_fin)}
							</p>
							<p>
								<strong>Días Restantes:</strong>{' '}
								{selectedMembership.dias_restantes}
							</p>
							<p>
								<strong>Precio:</strong> $
								{parseFloat(selectedMembership.precio).toFixed(2)}
							</p>
						</div>

						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								onClick={() => setIsMembershipModalOpen(false)}
								variant="primary"
							>
								Cerrar
							</Button>
						</div>
					</div>
				) : (
					<p>Cargando información...</p>
				)}
			</Modal>
		</div>
	);
}
