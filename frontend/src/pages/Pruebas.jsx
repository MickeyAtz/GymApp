import { useState } from 'react';
import Modal from '../components/molecules/Modal';
import FormAtom from '../components/atoms/FormAtom';

export default function PruebaUsuariosPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fields = [
		{
			name: 'nombre',
			label: 'Nombre completo',
			type: 'text',
			placeholder: 'Juan Pérez',
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
		{ name: 'fecha_registro', label: 'Fecha de registro', type: 'date' },
		{
			name: 'password',
			label: 'Contraseña',
			type: 'password',
			placeholder: '********',
		},
	];

	const handleSubmit = (data) => {
		console.log('Datos enviados:', data);
		setIsModalOpen(false);
	};

	return (
		<div style={{ padding: '20px' }}>
			<h2>Prueba de FormAtom en Modal</h2>
			<button onClick={() => setIsModalOpen(true)}>Abrir Formulario</button>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Registro de cliente"
			>
				<FormAtom
					fields={fields}
					initialData={{}}
					onSubmit={handleSubmit}
					onCancel={() => setIsModalOpen(false)}
				/>
			</Modal>
		</div>
	);
}
