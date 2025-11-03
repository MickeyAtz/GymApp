import { useState, useEffect } from 'react';

import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';
import Button from '../components/atoms/Button';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';

import { toast } from 'react-toastify';

import styles from './styles/CRUDPages.module.css';

import {
	getMembresias,
	createMembresia,
	updateMembresia,
	deleteMembresia,
} from '../api/membresias';

export default function MembresiasPage() {
	const [membresias, setMembresias] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState(null);
	const [modalTitle, setModalTitle] = useState(null);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);

	useEffect(() => {
		document.title = 'Gym App - Membresías';
		return () => {
			document.title = 'Gym App';
		};
	}, []);

	const columns = [
		{ field: 'nombre', label: 'Nombre' },
		{ field: 'duracion_dias', label: 'Duración (días)' },
		{ field: 'precio', label: 'Precio' },
		{ field: 'activoLabel', label: 'Estado' },
	];

	// Campos del formulario
	const fields = [
		{ name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Mensual' },
		{
			name: 'duracion_dias',
			label: 'Duración (días)',
			type: 'number',
			placeholder: '30',
		},
		{ name: 'precio', label: 'Precio', type: 'number', placeholder: '500' },
		{
			name: 'activo',
			label: 'Estado',
			type: 'select',
			options: [
				{ value: true, label: 'Activo' },
				{ value: false, label: 'Inactivo' },
			],
		},
	];

	// Cargar membresías al inicio
	useEffect(() => {
		fetchMembresias();
	}, []);

	const fetchMembresias = async () => {
		const data = await getMembresias();

		// Aseguramos que cada registro tenga activo y activoLabel
		const dataForTable = data.map((m) => ({
			...m,
			activo: Boolean(m.activo),
			activoLabel: m.activo ? 'Activo' : 'Inactivo',
		}));

		setMembresias(dataForTable);
	};

	// Crear o actualizar membresía
	const handleSubmit = async (formData) => {
		const payload = {
			...formData,
			activo: formData.activo === 'true' || formData.activo === true,
		};

		try {
			if (editData) {
				await updateMembresia(editData.id, payload);
				toast.success('¡Membresía actualizada con éxito!');
			} else {
				await createMembresia(payload);
				toast.success('¡Membresía creada con éxito!');
			}
			setIsModalOpen(false);
			setEditData(null);
			fetchMembresias();
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo guardar la membresía.'
			);
		}
	};

	// Editar membresía
	const handleEdit = (membresia) => {
		setModalTitle('Editar Membresía');
		setEditData({
			...membresia,
			activo: Boolean(membresia.activo),
		});
		setIsModalOpen(true);
	};

	// Eliminar membresía
	const handleDelete = async (id) => {
		setItemParaBorrar(id);
	};

	const handleConfirmDelete = async () => {
		if (!itemParaBorrar) return;
		try {
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo eliminar la membresía.'
			);
		} finally {
			setItemParaBorrar(null);
		}
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Gestión de membresías</h2>
				<Button
					onClick={() => {
						setIsModalOpen(true);
						setModalTitle('Nueva Membresía');
						setEditData(null);
					}}
					className={styles.addBtn}
				>
					Agregar Membresía
				</Button>
			</div>

			<Card title="Membresías registradas">
				<Table
					columns={columns}
					data={membresias}
					renderActions={(membresia) => (
						<>
							<Button
								onClick={() => handleEdit(membresia)}
								variant="primary"
								size="small"
							>
								Editar
							</Button>
							<Button
								onClick={() => handleDelete(membresia.id)}
								variant="secondary"
								size="small"
							>
								Eliminar
							</Button>
						</>
					)}
				/>
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
					fields={fields}
					initialData={editData || {}}
					onSubmit={handleSubmit}
					onCancel={() => {
						setIsModalOpen(false);
						setEditData(null);
					}}
				/>
			</Modal>

			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null} // Se abre si 'itemParaBorrar' no es null
				onClose={() => setItemParaBorrar(null)} // Se cierra al cancelar
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar a esta membresía? Esta acción
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
