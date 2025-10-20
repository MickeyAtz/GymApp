import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartPie({ title, labels = [], data = [] }) {
	const chartData = {
		labels,
		datasets: [
			{
				label: title,
				data,
				backgroundColor: [
					'#36A2EB',
					'#FF6384',
					'#FFCE56',
					'#4BC0C0',
					'#9966FF',
					'#FF9F40',
				],
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: { position: 'bottom' },
			title: { display: true, text: title },
		},
	};

	return <Pie data={chartData} option={options} />;
}
