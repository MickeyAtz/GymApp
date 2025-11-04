import React from 'react';
import styles from './style/Button.module.css';
import { iconMap } from '../../icons/iconMap'; // <-- Importamos los íconos

const Button = ({
	children,
	icon,
	variant = 'primary',
	size = 'medium',
	onClick,
	disabled = false,
	title = '',
}) => {
	const IconComponent = icon ? iconMap[icon] : null;
	const hasOnlyIcon = icon && !children;

	return (
		<button
			className={`${styles.button} ${styles[variant]} ${styles[size]} ${
				hasOnlyIcon ? styles.iconOnly : ''
			}`}
			onClick={onClick}
			disabled={disabled}
			title={title || (hasOnlyIcon ? children : '')}
		>
			{IconComponent && <IconComponent />}
			{children}
		</button>
	);
};

export default Button;
