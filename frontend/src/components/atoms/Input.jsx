import React from 'react';

import styles from './style/Input.module.css';

export default function Input({
	label,
	type = 'text',
	placeholder = '',
	value,
	onChange,
	name,
	variant = 'primary',
}) {
	return (
		<div className={styles.inputContainer}>
			{label && (
				<label htmlFor={name} className={styles.label}>
					{label}
				</label>
			)}
			<input
				type={type}
				name={name}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className={`${styles.customInput} ${styles[variant]}`}
			/>
		</div>
	);
}
