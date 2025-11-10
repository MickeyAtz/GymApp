import React from 'react';
import styles from './style/Badge.module.css';

const Badge = ({ children, variant = 'primary' }) => {
	return (
		<span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
	);
};

export default Badge;
	