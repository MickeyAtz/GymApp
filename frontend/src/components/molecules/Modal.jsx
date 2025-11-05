import React, { useEffect, useState } from 'react';
import styles from './style/Modal.module.css';

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'medium', 
}) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShow(true);
		} else {
			const timeout = setTimeout(() => setShow(false), 300);
			return () => clearTimeout(timeout);
		}
	}, [isOpen]);

	if (!show) return null;

	return (
		<div
			className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
			onClick={onClose}
		>
			<div
				className={`${styles.modal} ${styles[size]}`}
				onClick={(e) => e.stopPropagation()}
			>
				{title && <h2>{title}</h2>}
				{children}
				<button className={styles.closeBtn} onClick={onClose}>
					X
				</button>
			</div>
		</div>
	);
}
