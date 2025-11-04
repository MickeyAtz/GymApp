import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iconMap } from '../../icons/iconMap';
import styles from './style/Sidebar.module.css';
import logo from '../../img/logo.png';
import { itemsByRole } from './sidebarItems';
import { FaSignOutAlt } from 'react-icons/fa';
import Badge from '../atoms/Badge';
import { useUser } from '../../context/UserContext';
import { useEffect } from 'react';

import { toast } from 'react-toastify';

export default function Sidebar({ isOpen, toggleSidebar }) {
	const { user, setUser } = useUser();

	const [activeItem, setActiveItem] = useState(() => {
		return parseInt(localStorage.getItem('activeSidebarItem') || '1');
	});

	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('usuario');
		setUser(null);
		navigate('/login');
		toast.info('Cierre de sesión exitoso.');
	};

	if (!user) return null;

	const items = itemsByRole[user.perfil.toLowerCase()];

	const handleItemClick = (id) => {
		setActiveItem(id);
		localStorage.setItem('activeSidebarItem', id.toString());
	};

	return (
		<div
			className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
		>
			<div className={styles.topSection}>
				<div className={styles.logoContainer}>
					<img src={logo} alt="Gym Logo" className={styles.logo} />
					{isOpen && <span className={styles.logoText}>Mi Gym</span>}
				</div>
				<div className={styles.userInfo}>
					<Badge>{user.perfil.toUpperCase()}</Badge>
					{isOpen && <p className={styles.username}>¡Hola, {user.nombre}!</p>}
				</div>
			</div>

			<button className={styles.toggleBtn} onClick={toggleSidebar}>
				{isOpen ? '«' : '»'}
			</button>

			<div className={styles.items}>
				{items.map((item) => {
					const Icon = iconMap[item.icon];
					const ExternalIcon = item.isExternal ? iconMap['external'] : null;
					const isActive = item.id === activeItem;

					const linkContent = (
						<>
							{Icon && <Icon className={styles.icon} />}
							{isOpen && <span className={styles.label}>{item.label}</span>}
							{isOpen && ExternalIcon && (
								<ExternalIcon className={styles.externalIcon} />
							)}
						</>
					);

					if (item.isExternal) {
						return (
							<a
								href={item.path}
								target="_blank"
								rel="noopener noreferrer"
								key={item.id}
								className={`${styles.item} ${isActive ? styles.active : ''}`}
								onClick={() => handleItemClick(item.id)}
								title={!isOpen ? item.label : ''}
							>
								{linkContent}
							</a>
						);
					}

					return (
						<Link
							to={item.path}
							key={item.id}
							className={`${styles.item} ${isActive ? styles.active : ''}`}
							onClick={() => handleItemClick(item.id)}
							title={!isOpen ? item.label : ''}
						>
							{linkContent}
						</Link>
					);
				})}

				<div className={styles.logoutContainer}>
					<button className={styles.logoutBtn} onClick={handleLogout}>
						<FaSignOutAlt className={styles.icon} />
						{isOpen && <span className={styles.label}>Logout</span>}
					</button>
				</div>
			</div>
		</div>
	);
}
