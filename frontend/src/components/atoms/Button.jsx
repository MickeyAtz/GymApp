
import React from 'react';
import styles from './style/Button.module.css';

const Button = ({
	children,
	variant = 'primary',
	size = 'medium',
	onClick,
	disabled = false,
}) => {
	return (
		<button
			className={`${styles.button} ${styles[variant]} ${styles[size]}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default Button;
