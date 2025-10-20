import React from 'react';
import styles from './style/Card.module.css';

const Card = ({ title, subtitle, children, footer }) => {
	return (
		<div className={styles.card}>
			{title && <h3 className={styles.title}>{title}</h3>}
			{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
			<div className={styles.content}>{children}</div>
			{footer && <div className={styles.footer}>{footer}</div>}
		</div>
	);
};

export default Card;
