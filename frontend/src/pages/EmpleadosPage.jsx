import { useEffect, useState } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';

import { toast } from 'react-toastify';

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
	const [itemParaBorrar, setItemParaBorrar] = useState(null);
	const [isSaving, setIsSaving] = useState(false); // <-- MEJORA 1

	useEffect(() => {
		document.title = 'Gym App - Empleados';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

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
		setIsSaving(true); // <-- MEJORA 1
		try {
			if (modalTitle === 'Cambiar contraseña') {
				if (formData.password !== formData.confirmPassword) {
					toast.error('Las contraseñas no coinciden');
					return;
				}
				await updatePassword(editData.empleado_id, {
					password: formData.password,
				});
				toast.success('¡Contraseña actualizada con éxito!');
			} else if (editData) {
				await updateEmpleado(editData.empleado_id, formData);
				toast.succes('¡Empleado actualizado con éxito!');
			} else {
				await createEmpleado(formData);
				toast.succes('¡Empleado creado con éxito!');
			}
			setIsModalOpen(false);
			setEditData(null);
			fetchEmpleados();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo guardar el empleado.'
			);
		} finally {
			setIsSaving(false); // <-- MEJORA 1
		}
	};

	const handleEdit = (empleado) => {
		setModalTitle('Editar Empleado');
		setEditData({
			...empleado,
			rol: empleado.rol,
		});
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		setItemParaBorrar(id);
	};

	const handleConfirmDelete = async () => {
		if (!itemParaBorrar) return;
		try {
			await deleteEmpleado(itemParaBorrar); // Corregido: usaba 'id' en lugar de 'itemParaBorrar'
			toast.info('Empleado eliminado correctamente.');
			fetchEmpleados();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo eliminar el empleado.'
			);
		} finally {
			setItemParaBorrar(null);
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
					icon="plus" // <-- MEJORA 2
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
							{/* --- MEJORA 2: Botones de Íconos --- */}
							<Button
								icon="edit"
								title="Editar"
								onClick={() => handleEdit(empleado)}
								variant="primary"
								size="small"
							/>
							<Button
								icon="trash"
								title="Eliminar"
								onClick={() => handleDelete(empleado.empleado_id)}
								variant="secondary"
								size="small"
							/>
							<Button
								onClick={() => handlePasswordChange(empleado)}
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
					isSaving={isSaving} // <-- MEJORA 1
				></FormAtom>
			</Modal>

			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null}
				onClose={() => setItemParaBorrar(null)}
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar a este empleado? Esta acción no
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
		</div>
	);
}
