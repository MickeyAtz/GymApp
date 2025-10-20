import React from 'react';
import ChartPie from '../atoms/ChartPie';
import ChartBar from '../atoms/ChartBar';
import styles from './styles/ChartsGrid.module.css';

export default function ChartsGrid({ charts = [] }) {
	return (
		<div className={styles.grid}>
			{charts.map((chart) => (
				<div key={chart.id} className={styles.chartItem}>
					{chart.type == 'bar' && (
						<ChartBar
							title={chart.title}
							labels={chart.labels}
							data={chart.data}
						/>
					)}
					{chart.type == 'pie' && (
						<ChartPie
							title={chart.title}
							labels={chart.labels}
							data={chart.data}
						/>
					)}
				</div>
			))}
		</div>
	);
}
