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

	// --- MEJORA 1: Estado de carga ---
	const [isSaving, setIsSaving] = useState(false);

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
		const data = await getAllUsuarios();
		setClientes(data);
	};

	const handleSubmit = async (formData) => {
		setIsSaving(true); // <-- MEJORA 1: Activar estado de carga
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
			setIsSaving(false); // <-- MEJORA 1: Desactivar estado de carga
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

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de clientes</h2>
				<Button
					onClick={() => (setIsModalOpen(true), setModalTitle('Nuevo Cliente'))}
					icon="plus" // <-- MEJORA 2: Ícono en el botón
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
							{/* --- MEJORA 2: Botones de Íconos --- */}
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
								{/* No tenemos un ícono de 'llave' en el iconMap, 
                  así que dejamos el texto. O podrías añadir 'FaKey' al iconMap 
                  y usar 'icon="key"'. Por ahora, con texto está bien.
                */}
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
					isSaving={isSaving} // <-- MEJORA 1: Pasar el estado de carga
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
		</div>
	);
}
