
import React from 'react';
import styles from './style/Button.module.css';
import { iconMap } from '../../icons/iconMap';

const IconButton = ({
	icon,
	variant = 'primary',
	size = 'medium',
	onClick,
}) => {
	const IconComponent = iconMap[icon];

	return (
		<button
			className={`${styles.button} ${styles[variant]} ${styles[size]}`}
			onClick={onClick}
		>
			{IconComponent && (
				<IconComponent style={{ marginRigth: '8px' }}></IconComponent>
			)}
		</button>
	);
};

export default IconButton;
