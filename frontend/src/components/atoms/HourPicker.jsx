
import React from 'react';
import Select from './Select';
import styles from './style/HourPicker.module.css';

export default function HourPicker({ value, onChange }) {
	const hour = [];
	const minutes = ['00', '30'];

	hour.push('09:00 AM');
	hour.push('09:30 AM');
	hour.push('10:00 AM');
	hour.push('10:30 AM');
	hour.push('11:00 AM');
	hour.push('11:30 AM');
	hour.push('12:00 PM');

	for (let h = 1; h <= 8; h++) {
		for (let m of minutes) {
			hour.push(`${h}:${m} PM`);
		}
	}

	const options = hour.map((h) => ({ label: h, value: h }));

	return (
		<div className={styles.wraper}>
			<Select
				options={options}
				value={value}
				onChange={(v) => onChange(v)}
				placeholder="Selecciona una hora"
			></Select>
		</div>
	);
}
