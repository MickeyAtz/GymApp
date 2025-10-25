import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
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

export default function VisitasChart() {
	const [modo, setModo] = useState('semana');
	const [labels, setLabels] = useState([]);
	const [dataValues, setDataValues] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const endpoint =
					modo === 'semana'
						? '/api/dashboard/visitas-semana'
						: '/api/dashboard/visitas-mes';

				const { data } = await axios.get(endpoint);

				setLabels(data.map((item) => item.dia));
				setDataValues(data.map((item) => item.total));
			} catch (error) {
				console.error('Error al obtener datos de visitas:', error);
			}
		};

		fetchData();
	}, [modo]);

	const chartData = {
		labels,
		datasets: [
			{
				label:
					modo === 'semana'
						? 'Visitas por día (semana actual)'
						: 'Visitas por día (mes actual)',
				data: dataValues,
				backgroundColor: 'rgba(255, 206, 86, 0.6)',
				borderColor: 'rgba(255, 206, 86, 1)',
				borderWidth: 1,
				borderRadius: 8,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: { display: true, position: 'top' },
			title: { display: true, text: 'Registro de Visitas' },
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { stepSize: 1 },
			},
		},
	};

	return (
		<div className="bg-black p-4 rounded-2xl shadow-lg text-white">
			<div className="flex justify-between items-center mb-3">
				<h2 className="text-xl font-bold">Visitas</h2>
				<select
					value={modo}
					onChange={(e) => setModo(e.target.value)}
					className="bg-gray-800 text-white rounded-md p-1"
				>
					<option value="semana">Semana</option>
					<option value="mes">Mes</option>
				</select>
			</div>

			<Bar data={chartData} options={options} />
		</div>
	);
}
