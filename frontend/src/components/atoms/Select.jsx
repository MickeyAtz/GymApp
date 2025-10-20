import React from 'react';
import styles from './style/Select.module.css';

export default function Select({ options = [], value, onChange, placeholder }) {
	return (
		<select
			className={styles.select}
			value={value || ''} // aseguramos que sea controlado
			onChange={(e) => onChange(e.target.value)} // enviamos solo el valor
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}

			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}
