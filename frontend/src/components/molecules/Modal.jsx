// Modal.jsx
import React, { useEffect, useState } from 'react';
import styles from './style/Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShow(true); // Abrir modal
		} else {
			// Esperar la animación antes de ocultar
			const timeout = setTimeout(() => setShow(false), 300); // 300ms = duración CSS
			return () => clearTimeout(timeout);
		}
	}, [isOpen]);

	if (!show) return null;

	return (
		<div
			className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
			onClick={onClose}
		>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				{title && <h2>{title}</h2>}
				{children}
				<button className={styles.closeBtn} onClick={onClose}>
					X
				</button>
			</div>
		</div>
	);
}
