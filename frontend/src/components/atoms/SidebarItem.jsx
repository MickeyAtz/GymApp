import React from 'react';
import styles from './style/SidebarItem.module.css';
import { iconMap } from '../../icons/iconMap'; // nuestro map de íconos

export default function SidebarItem({ label, icon, onClick, collapsed }) {
	const Icon = iconMap[icon];

	return (
		<div className={styles.item} onClick={onClick}>
			{Icon && <Icon className={styles.icon} />}
			{!collapsed && <span className={styles.label}>{label}</span>}
		</div>
	);
}
