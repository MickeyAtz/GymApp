import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Tus componentes
import Card from '../components/molecules/Card';
import Table from '../components/organism/Table';
import Button from '../components/atoms/Button';
import FormAtom from '../components/atoms/FormAtom';
import Loading from '../components/atoms/Loading';

// Tus funciones de API
import {
	getMiPerfil,
	updateMiPerfil,
	changeMiPassword,
} from '../api/usuarios.js';
import { getMiHistorialPagos } from '../api/reportes.js';
import { getMiHistorialVisitas } from '../api/visitas.js';

// --- ¡NUEVA IMPORTACIÓN! ---
import { formatDateTime } from '../utils/formatDate.js';

// Estilos
import styles from './styles/CRUDPages.module.css';
import stylesPerfil from './styles/MiPerfilPage.module.css';

export default function MiPerfilPage() {
	const [perfilData, setPerfilData] = useState(null);
	const [historialPagos, setHistorialPagos] = useState([]);
	const [historialVisitas, setHistorialVisitas] = useState([]);

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
				fecha_pago: formatDateTime(pago.fecha_pago), // Sobreescribimos la fecha
				monto: `$${parseFloat(pago.monto).toFixed(2)}`, // Formateamos el monto
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

	// --- Formularios ---
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
			label: 'Confirmar Contraseña Nueva',
			type: 'password',
			placeholder: '********',
		},
	];

	// --- Tabla de Pagos (Simple, sin 'render') ---
	const columnsPagos = [
		{ field: 'fecha_pago', label: 'Fecha' },
		{ field: 'membresia_nombre', label: 'Membresía' },
		{ field: 'monto', label: 'Monto' },
		{ field: 'tipo_pago', label: 'Método' },
	];

	// --- Tabla de Visitas (Simple, sin 'render') ---
	const columnsVisitas = [
		{ field: 'fecha_entrada', label: 'Entrada' },
		{ field: 'fecha_salida', label: 'Salida' },
		{ field: 'duracion_minutos', label: 'Duración (min)' },
	];

	// --- Manejadores de Submit ---
	const handleSubmitPerfil = async (formData) => {
		setIsSavingPerfil(true);
		try {
			await updateMiPerfil(formData);
			toast.success('¡Perfil actualizado con éxito!');
			// Refrescamos solo el perfil, no las tablas
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
			</div>

			<div className={stylesPerfil.gridContainer}>
				<div className={stylesPerfil.formsColumn}>
					<Card title="Mis Datos">
						{perfilData && (
							<FormAtom
								fields={fieldsPerfil}
								initialData={perfilData}
								onSubmit={handleSubmitPerfil}
								onCancel={null}
								actionsClassName={stylesPerfil.formActions}
							>
								<Button
									type="submit"
									variant="primary"
									disabled={isSavingPerfil}
								>
									{isSavingPerfil ? 'Guardando...' : 'Guardar Datos'}
								</Button>
							</FormAtom>
						)}
					</Card>
					<Card title="Cambiar Contraseña">
						<FormAtom
							fields={fieldsPassword}
							initialData={{}}
							onSubmit={handleSubmitPassword}
							onCancel={null}
							actionsClassName={stylesPerfil.formActions}
						>
							<Button
								type="submit"
								variant="primary"
								disabled={isSavingPassword}
							>
								{isSavingPassword ? 'Guardando...' : 'Actualizar Contraseña'}
							</Button>
						</FormAtom>
					</Card>
				</div>

				<div className={stylesPerfil.historyColumn}>
					<Card title="Mi Historial de Pagos">
						<Table
							columns={columnsPagos}
							data={historialPagos}
							rowsPerPage={5}
						/>
					</Card>

					<Card title="Mi Historial de Visitas">
						<Table
							columns={columnsVisitas}
							data={historialVisitas}
							rowsPerPage={5}
						/>
					</Card>
				</div>
			</div>
		</div>
	);
}
