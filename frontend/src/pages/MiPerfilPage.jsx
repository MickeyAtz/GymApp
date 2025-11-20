import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';

import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';
import Button from '../components/atoms/Button';
import FormAtom from '../components/atoms/FormAtom';
import Badge from '../components/atoms/Badge';

import {
	getMiPerfil,
	updateMiPerfil,
	changeMiPassword,
} from '../api/usuarios.js';
import { getMiHistorialPagos } from '../api/reportes.js';
import { getMiHistorialVisitas } from '../api/visitas.js';

import { formatDateTime } from '../utils/formatDate.js';

import styles from './styles/CRUDPages.module.css';
import pageStyles from './styles/MiPerfilPage.module.css';

export default function MiPerfilPage() {
	const { user } = useUser();
	const [perfilData, setPerfilData] = useState(null);
	const [historialPagos, setHistorialPagos] = useState([]);
	const [historialVisitas, setHistorialVisitas] = useState([]);

	const [activeTab, setActiveTab] = useState('visitas');

	const [isSavingPerfil, setIsSavingPerfil] = useState(false);
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	useEffect(() => {
		document.title = 'Gym App - Mi Perfil';
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [perfil, pagos, visitas] = await Promise.all([
				getMiPerfil(),
				getMiHistorialPagos(),
				getMiHistorialVisitas(),
			]);

			setPerfilData(perfil);

			const formattedPagos = pagos.map((pago) => ({
				...pago,
				fecha_pago: formatDateTime(pago.fecha_pago),
				monto: `$${parseFloat(pago.monto).toFixed(2)}`,
			}));

			const formattedVisitas = visitas.map((visita) => ({
				...visita,
				fecha_entrada: formatDateTime(visita.fecha_entrada),
				fecha_salida: formatDateTime(visita.fecha_salida),
				duracion_minutos: visita.duracion_minutos
					? `${visita.duracion_minutos} min`
					: '--',
			}));

			setHistorialPagos(formattedPagos);
			setHistorialVisitas(formattedVisitas);
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'Error al cargar los datos.');
		}
	};

	const fieldsPerfil = [
		{ name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
		{
			name: 'apellidos',
			label: 'Apellidos',
			type: 'text',
			placeholder: 'Tus apellidos',
		},
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'tu@correo.com',
		},
		{
			name: 'telefono',
			label: 'Teléfono',
			type: 'text',
			placeholder: 'Tu teléfono',
		},
	];

	const fieldsPassword = [
		{
			name: 'password_actual',
			label: 'Contraseña Actual',
			type: 'password',
			placeholder: '********',
		},
		{
			name: 'password_nueva',
			label: 'Contraseña Nueva',
			type: 'password',
			placeholder: '********',
		},
		{
			name: 'confirmar_password',
			label: 'Confirmar Nueva',
			type: 'password',
			placeholder: '********',
		},
	];

	const columnsPagos = [
		{ field: 'fecha_pago', label: 'Fecha' },
		{ field: 'membresia_nombre', label: 'Membresía' },
		{ field: 'monto', label: 'Monto' },
		{ field: 'tipo_pago', label: 'Método' },
	];

	const columnsVisitas = [
		{ field: 'fecha_entrada', label: 'Entrada' },
		{ field: 'fecha_salida', label: 'Salida' },
		{ field: 'duracion_minutos', label: 'Duración' },
	];

	const handleSubmitPerfil = async (formData) => {
		setIsSavingPerfil(true);
		try {
			await updateMiPerfil(formData);
			toast.success('¡Perfil actualizado con éxito!');
			const perfil = await getMiPerfil();
			setPerfilData(perfil);
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo actualizar el perfil.'
			);
		} finally {
			setIsSavingPerfil(false);
		}
	};

	const handleSubmitPassword = async (formData) => {
		if (formData.password_nueva !== formData.confirmar_password) {
			toast.error('Las contraseñas nuevas no coinciden.');
			return;
		}
		setIsSavingPassword(true);
		try {
			await changeMiPassword({
				password_actual: formData.password_actual,
				password_nueva: formData.password_nueva,
			});
			toast.success('¡Contraseña actualizada con éxito!');
		} catch (err) {
			console.error(err);
			toast.error(
				err.response?.data?.error || 'No se pudo cambiar la contraseña.'
			);
		} finally {
			setIsSavingPassword(false);
		}
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Mi Perfil</h2>
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<span style={{ fontSize: '1rem', color: 'var(--color-text)' }}>
						{user?.nombre} {user?.apellidos}
					</span>
					<Badge variant="success">{user?.perfil?.toUpperCase()}</Badge>
				</div>
			</div>

			{/* 🔑 CONTENEDOR DE UNA SOLA COLUMNA */}
			<div className={pageStyles.singleColumnContainer}>
				{/* SECCIÓN 1: DATOS PERSONALES */}
				<section>
					<Card
						title="Información Personal"
						subtitle="Actualiza tus datos de contacto"
					>
						{perfilData && (
							<FormAtom
								fields={fieldsPerfil}
								initialData={perfilData}
								onSubmit={handleSubmitPerfil}
								onCancel={null}
								actionsClassName={pageStyles.formActions}
							>
								<Button
									type="submit"
									variant="primary"
									disabled={isSavingPerfil}
									style={{ width: '100%' }}
								>
									{isSavingPerfil ? 'Guardando...' : 'Actualizar Datos'}
								</Button>
							</FormAtom>
						)}
					</Card>
				</section>

				{/* SECCIÓN 2: SEGURIDAD */}
				<section>
					<Card title="Seguridad" subtitle="Gestiona tu contraseña de acceso">
						<FormAtom
							fields={fieldsPassword}
							initialData={{}}
							onSubmit={handleSubmitPassword}
							onCancel={null}
							actionsClassName={pageStyles.formActions}
						>
							<Button
								type="submit"
								variant="secondary"
								disabled={isSavingPassword}
								style={{ width: '100%' }}
							>
								{isSavingPassword ? 'Guardando...' : 'Cambiar Contraseña'}
							</Button>
						</FormAtom>
					</Card>
				</section>

				{/* SECCIÓN 3: HISTORIAL */}
				<section>
					<Card>
						<div className={pageStyles.tabsHeader}>
							<button
								className={`${pageStyles.tabButton} ${activeTab === 'visitas' ? pageStyles.active : ''}`}
								onClick={() => setActiveTab('visitas')}
							>
								Historial de Visitas
							</button>
							<button
								className={`${pageStyles.tabButton} ${activeTab === 'pagos' ? pageStyles.active : ''}`}
								onClick={() => setActiveTab('pagos')}
							>
								Historial de Pagos
							</button>
						</div>

						<div className={pageStyles.tabContent}>
							{activeTab === 'visitas' ? (
								<Table
									columns={columnsVisitas}
									data={historialVisitas}
									rowsPerPage={10}
								/>
							) : (
								<Table
									columns={columnsPagos}
									data={historialPagos}
									rowsPerPage={10}
								/>
							)}
						</div>
					</Card>
				</section>
			</div>
		</div>
	);
}
