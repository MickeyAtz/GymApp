import { useState, useEffect } from 'react';
import styles from './style/FormAtom.module.css';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Select from '../atoms/Select';
import HourPicker from './HourPicker';

export default function FormAtom({
	fields,
	initialData = {},
	onSubmit,
	onCancel,
	isSaving = false, 
	children,
}) {
	const [formData, setFormData] = useState({});

	useEffect(() => {
		setFormData(initialData);
	}, [initialData]);

	const handleChange = (name, value) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			{fields.map((field) => {
				const value = formData[field.name] || '';

				if (field.type === 'select') {
					return (
						<div className={styles.formGroup} key={field.name}>
							<label className={styles.label}>{field.label}</label>
							<Select
								options={field.options || []}
								value={value}
								onChange={(v) => handleChange(field.name, v)}
								placeholder={field.placeholder}
								required
							/>
						</div>
					);
				} else if (field.type === 'time') {
					return (
						<div className={styles.formGroup} key={field.name}>
							<label className={styles.label}>{field.label}</label>
							<HourPicker
								value={formData[field.name] || null}
								onChange={(v) => handleChange(field.name, v)}
								required
							/>
						</div>
					);
				}

				return (
					<div className={styles.formGroup} key={field.name}>
						<label className={styles.label}>{field.label}</label>
						<Input
							type={field.type}
							name={field.name}
							value={value}
							onChange={(e) => handleChange(field.name, e.target.value)}
							placeholder={field.placeholder}
							className={styles.input}
							required
						/>
					</div>
				);
			})}

			<div className={styles.actions}>
				{children ? (
					children
				) : (
					<>
						<Button type="submit" variant="primary" disabled={isSaving}>
							{isSaving ? 'Guardando...' : 'Guardar'}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={onCancel}
							disabled={isSaving}
						>
							Cancelar
						</Button>
					</>
				)}
			</div>
		</form>
	);
}
