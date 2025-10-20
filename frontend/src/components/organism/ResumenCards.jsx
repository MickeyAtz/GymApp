import React from 'react';
import Card from '../molecules/Card';
import styles from './style/ResumenCards.module.css';

export default function ResumenCards({ metrics = [] }) {
	return (
		<div className={styles.grid}>
			{metrics.map((metric) => (
				<Card key={metric.id} title={metric.title} subtitle={metric.subtitle}>
					<h2>{metric.value}</h2>
				</Card>
			))}
		</div>
	);
}
