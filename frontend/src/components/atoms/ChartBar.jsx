import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

export default function ({ title, labels = [], data = [] }) {
	const chartData = {
		labels,
		datasets: [
			{
				label: title,
				data,
				backgroundColor: 'rgba(75, 192,192, 0.5)',
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: { display: false },
			title: { display: true, text: title },
		},
	};
	return <Bar data={chartData} options={options} />;
}
