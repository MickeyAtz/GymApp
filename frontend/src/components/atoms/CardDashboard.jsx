import React from 'react';
import styles from './style/CardDashboard.module.css';
import { iconMap } from '../../icons/iconMap';

export default function CardDashboard({ title, value, icon }) {
	const IconComponent = iconMap[icon];

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.value}>{value}</p>
				<div className={styles.backgroundIcon}>
					{IconComponent && <IconComponent />}
				</div>
			</div>
		</div>
	);
}
