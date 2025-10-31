import React, { useState, useEffect } from 'react';

import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import Select from '../components/atoms/Select';
import Card from '../components/molecules/Card';

import {
	searchUsuarios,
	getActiveMemberships,
	createMembershipPayment,
} from '../api/venderMembresias';

import styles from './styles/VenderMembresiaPage.module.css';

export default function VenderMembresiaPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResult, setSearchResults] = useState([]);
	const [selectedClient, setSelectedClient] = useState(null);
	const [memberships, setMemberships] = useState([]);
	const [selectedMembershipId, setSelectedMembershipId] = useState('');
	const [payAmount, setPayAmount] = useState('');
	const [paymentType, setPaymentType] = useState('efectivo');
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const fetchMembresias = async () => {
		setError('');
		try {
			const data = await getActiveMemberships();
			setMemberships(data || []);
		} catch (err) {
			console.error('Error al cargar membresias: ', err);
			setError('No se pudieron cargar las membresías.');
			setMemberships([]);
		}
	};

	useEffect(() => {
		const handler = setTimeout(() => {
			if (searchTerm && searchTerm.trim().length > 1) {
				setError('');
				searchUsuarios(searchTerm)
					.then((data) => setSearchResults(data || []))
					.catch((err) => {
						console.error('Error al buscar usuarios: ', err);
						setError('Error al buscar clientes.');
						setSearchResults([]);
					});
			} else {
				setSearchResults([]);
			}
		}, 500);
		return () => clearTimeout(handler);
	}, [searchTerm]);

	useEffect(() => {
		fetchMembresias();
	}, []);

	const handleSelectClient = (client) => {
		setSelectedClient(client);
		setSearchTerm('');
		setSearchResults([]);
	};

	const handleMembershipChange = (membershipId) => {
		setSelectedMembershipId(membershipId);
		const selectedMem = memberships.find(
			(m) => m.id.toString() === membershipId
		);
		setPayAmount(selectedMem?.precio || '');
	};

	const membershipOptions = memberships.map((mem) => ({
		value: mem.id.toString(),
		label: `${mem.nombre} ($${mem.precio} / ${mem.duracion_dias} días)`,
	}));

	const selectedMem = memberships.find(
		(m) => m.id.toString() === selectedMembershipId
	);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (
			!selectedClient ||
			!selectedMembershipId ||
			!payAmount ||
			!paymentType
		) {
			setError('Por favor completa todos los campos.');
			return;
		}

		setError('');
		setSuccessMessage('');

		const paymentData = {
			usuario_id: selectedClient.id,
			membresia_id: parseInt(selectedMembershipId, 10),
			monto: parseFloat(payAmount),
			tipo_pago: paymentType,
		};

		try {
			const result = await createMembershipPayment(paymentData);
			setSuccessMessage(result.message || '¡Venta registrada con éxito!');

			setSelectedClient(null);
			setSelectedMembershipId('');
			setPayAmount('');
			setPaymentType('efectivo');
		} catch (err) {
			console.error('Error al registrar pago: ', err);
			setError(err.response?.data?.error || 'Error al registrar la venta.');
		}
	};

	return (
		<div className={styles.ventaContainer}>
			<h1>Registrar Venta de Membresía</h1>
			{error && <p className={styles.errorMessage}>{error}</p>}
			{successMessage && (
				<p className={styles.successMessage}>{successMessage}</p>
			)}

			<Card title="Detalles de la venta">
				<form onSubmit={handleSubmit}>
					<section className={styles.formSection}>
						<h3>1. Buscar Cliente</h3>
						{!selectedClient ? (
							<>
								<Input
									type="text"
									placeholder="Buscar por nombre, email o código..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									aria-label="Buscar cliente"
								/>
								{searchResult.length > 0 && (
									<ul className={styles.searchResults}>
										{searchResult.map((client) => (
											<li
												key={client.id}
												onClick={() => handleSelectClient(client)}
												role="button"
												tabIndex={0}
												onKeyDown={(e) =>
													e.key === 'Enter' && handleSelectClient(client)
												}
											>
												{client.nombre} {client.apellidos || ''}(
												{client.codigo_barras})
											</li>
										))}
									</ul>
								)}
							</>
						) : (
							<div className={styles.selectedClient}>
								<span>
									Cliente:{' '}
									<strong>
										{selectedClient.nombre} {selectedClient.apellidos || ''}
									</strong>
									({selectedClient.codigo_barras})
								</span>
								<Button
									onClick={() => setSelectedClient(null)}
									type="button"
									variant="seondary"
									size="small"
								>
									Cambiar
								</Button>
							</div>
						)}
					</section>
					{selectedClient && (
						<section className={styles.formSection}>
							<h3>2. Seleccionar Membresía</h3>
							{memberships.length > 0 ? (
								<Select
									options={membershipOptions}
									value={selectedMembershipId}
									onChange={handleMembershipChange}
									placeholder=" -- Elige una membresía -- "
								/>
							) : (
								<p>No hay membresías activas disponibles o cargando...</p>
							)}
						</section>
					)}
					{selectedClient && selectedMembershipId && (
						<>
							<section className={styles.formSection}>
								<h3>3. Resumen y Pago</h3>
								<div className={styles.resumenVenta}>
									<div className={styles.resumenItem}>
										<span>Cliente:</span>
										<strong>
											{selectedClient.nombre} {selectedClient.apellidos || ''}
										</strong>
									</div>
									<div className={styles.resumenItem}>
										<span>Membresia:</span>
										<strong>
											{selectedMem.nombre} ({selectedMem.duracion_dias} días)
										</strong>
									</div>
									<div className={styles.resumenItemTotal}>
										<span>Monto a Pagar: </span>
										<strong>{payAmount}</strong>
									</div>
								</div>
								<Select
									label="Método de Pago"
									options={[
										{ value: 'efectivo', label: 'Efectivo' },
										{ value: 'tarjeta', label: 'Tarjeta' },
										{ value: 'transferencia', label: 'Transferencia' },
									]}
									value={paymentType}
									onChange={setPaymentType}
									placeholder="-- Método de pago -- "
								/>
							</section>
							<div className={styles.submitButtonContainer}>
								<Button type="submit" variant="primary" size="large">
									Registrar Venta
								</Button>
							</div>
						</>
					)}
				</form>
			</Card>
		</div>
	);
}
