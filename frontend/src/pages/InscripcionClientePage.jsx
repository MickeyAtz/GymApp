import { useState, useEffect, useMemo } from 'react';
import Table from '../components/organism/Table';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
// import Select eliminada
import Input from '../components/atoms/Input';
import styles from './styles/CRUDPages.module.css';
import './styles/InscripcionCliente.css';

import Modal from '../components/molecules/Modal';

import { toast } from 'react-toastify';

// import getAllInstructores eliminada

import {
	getMisInscripciones,
	getClasesDisponibles,
	inscribirClase,
	darseDeBajaClase,
} from '../api/usuarios';

// CONSTANTES DE LÍMITE BASADAS EN EL ESTADO DE LA BARRA LATERAL
const LIMIT_OPEN = 6;
const LIMIT_CLOSED = 8;

// Función para obtener el estado de la barra lateral desde localStorage
const getSidebarState = () => {
	const saved = localStorage.getItem('sidebarOpen');
	return saved ? JSON.parse(saved) : true;
};

export default function InscripcionClientePage() {
	const [misInscripciones, setMisInscripciones] = useState([]);
	const [clasesDisponibles, setClasesDisponibles] = useState([]);
	const [itemParaBorrar, setItemParaBorrar] = useState(null);

	// Estado de búsqueda y paginación
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);

	// NUEVO ESTADO: Sincroniza con el estado de la barra lateral
	const [isSidebarOpen, setIsSidebarOpen] = useState(getSidebarState);

	// CÁLCULO DINÁMICO: 6 si abierta, 8 si cerrada
	const itemsPerPage = isSidebarOpen ? LIMIT_OPEN : LIMIT_CLOSED;

	const columnsMisClases = [
		{ field: 'clase_nombre', label: 'Clase' },
		{ field: 'instructor_nombre', label: 'Instructor' },
		{ field: 'dia', label: 'Día' },
		{
			field: 'hora',
			label: 'Hora',
			render: (insc) => (insc.hora ? insc.hora.substring(0, 5) : 'N/A'),
		},
	];

	useEffect(() => {
		document.title = 'Gym App - Inscribir Clases';
		fetchData();

		// EFECTO PARA ESCUCHAR CAMBIOS Y MANTENER itemsPerPage SINCRONIZADO
		const checkSidebarState = () => {
			setIsSidebarOpen(getSidebarState());
		};

		window.addEventListener('focus', checkSidebarState);

		return () => {
			window.removeEventListener('focus', checkSidebarState);
		};
	}, []); // Se ejecuta solo al montar

	const fetchData = async () => {
		try {
			const [inscripcionesData, disponiblesData] = await Promise.all([
				getMisInscripciones(),
				getClasesDisponibles(),
			]);
			setMisInscripciones(inscripcionesData);
			setClasesDisponibles(disponiblesData);
			setCurrentPage(1);
		} catch (err) {
			console.error(err);
			toast.error(err.message || 'Error al cargar los datos');
		}
	};

	// Lógica de Filtrado y Paginación
	const filteredAndSearchedClases = useMemo(() => {
		let result = clasesDisponibles.filter((clase) => {
			const matchesSearch = searchTerm
				? clase.nombre.toLowerCase().includes(searchTerm.toLowerCase())
				: true;
			return matchesSearch;
		});

		// Aseguramos que la página actual sea válida después del filtrado
		const maxPage = Math.ceil(result.length / itemsPerPage) || 1;
		if (currentPage > maxPage) setCurrentPage(maxPage);

		return result;
	}, [clasesDisponibles, searchTerm, currentPage, itemsPerPage]);

	const paginatedClases = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredAndSearchedClases.slice(
			startIndex,
			startIndex + itemsPerPage
		);
	}, [filteredAndSearchedClases, currentPage, itemsPerPage]);

	const totalPages = Math.ceil(filteredAndSearchedClases.length / itemsPerPage);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleClearFilters = () => {
		setSearchTerm('');
		setCurrentPage(1);
	};

	const handleInscribir = async (claseId) => {
		try {
			await inscribirClase(claseId);
			toast.success('¡Inscripción realizada con éxito!');
			fetchData();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo inscribir');
		}
	};

	const handleDarseDeBaja = async (idInscripcion) => {
		setItemParaBorrar(idInscripcion);
	};

	const handleConfirmDelete = async () => {
		try {
			await darseDeBajaClase(itemParaBorrar);
			toast.info('¡Te diste de baja exitosamente!');
			fetchData();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'No se pudo dar de baja');
		} finally {
			setItemParaBorrar(null);
		}
	};

	return (
		<div>
			<div className={styles.header}>
				<h2>Inscripción a Clases</h2>
			</div>

			<Card title="Mis Clases Inscritas">
				<Table
					columns={columnsMisClases}
					data={misInscripciones}
					renderActions={(inscripcion) => (
						<Button
							onClick={() => handleDarseDeBaja(inscripcion.inscripcion_id)}
							variant="secondary"
							size="small"
						>
							Darse de Baja
						</Button>
					)}
				/>
			</Card>

			<div className={styles.header} style={{ marginTop: '2rem' }}>
				<h2>Catálogo de Clases</h2>
			</div>

			{/* Buscador */}
			<Card style={{ marginBottom: '1.5rem' }}>
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<div style={{ flex: 1 }}>
						<Input
							type="text"
							placeholder="Buscar por nombre de clase..."
							value={searchTerm}
							onChange={handleSearchChange}
						/>
					</div>

					{/* Botón Limpiar */}
					{searchTerm && (
						<Button
							onClick={handleClearFilters}
							variant="tertiary"
							style={{ flexShrink: 0 }}
						>
							Limpiar
						</Button>
					)}
				</div>
			</Card>

			{/* Catálogo de Clases Paginado */}
			<div className="clase-grid-container">
				{paginatedClases.map((clase) => {
					const cupoLleno = clase.inscritos >= clase.capacidad;
					const horaFormateada = clase.hora
						? clase.hora.substring(0, 5)
						: 'N/A';

					return (
						<div key={clase.id} className="clase-card">
							<h3>{clase.nombre}</h3>
							<p>
								<strong>Instructor:</strong> {clase.instructor_nombre}
							</p>
							<p>
								<strong>Horario:</strong> {clase.dia} {horaFormateada}
							</p>
							<p>
								<strong>Cupos:</strong> {clase.inscritos} / {clase.capacidad}
							</p>
							<p>
								<strong>Descripción:</strong> {clase.descripcion}
							</p>

							<Button
								onClick={() => handleInscribir(clase.id)}
								disabled={cupoLleno}
								variant={cupoLleno ? 'secondary' : 'primary'}
							>
								{cupoLleno ? 'Clase Llena' : 'Inscribirme'}
							</Button>
						</div>
					);
				})}

				{paginatedClases.length === 0 && (
					<div className="clase-error-banner" style={{ gridColumn: '1 / -1' }}>
						No hay clases disponibles que coincidan con los criterios.
					</div>
				)}
			</div>

			{/* CONTROLES DE PAGINACIÓN */}
			{totalPages > 1 && (
				<div className="pagination-controls">
					<Button
						onClick={() => setCurrentPage((prev) => prev - 1)}
						disabled={currentPage === 1}
						variant="secondary"
					>
						Anterior
					</Button>
					<span>
						Página {currentPage} de {totalPages}
					</span>
					<Button
						onClick={() => setCurrentPage((prev) => prev + 1)}
						disabled={currentPage === totalPages}
						variant="secondary"
					>
						Siguiente
					</Button>
				</div>
			)}
			{/* ... (Modal) ... */}
			<Modal
				title="Confirmar Eliminación"
				isOpen={itemParaBorrar !== null}
				onClose={() => setItemParaBorrar(null)}
			>
				<div style={{ padding: '1rem' }}>
					<p>
						¿Estás seguro de que deseas eliminar a esta clase? Esta acción no se
						puede deshacer.
					</p>

					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '1rem',
							marginTop: '2rem',
						}}
					>
						<Button variant="secondary" onClick={handleConfirmDelete}>
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
