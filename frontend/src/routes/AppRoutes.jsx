import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

import LoginPage from '../pages/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPageAdmin from '../pages/DashboardPageAdmin';
import ClientesPage from '../pages/ClientesPage';
import EmpleadosPage from '../pages/EmpleadosPage';
import ClasesPage from '../pages/ClasesPage';
import MembresiasPage from '../pages/MembresiasPage';
import InstructoresPage from '../pages/InstructoresPage';
import DashboardPageClientes from '../pages/DashboardPageClientes';
import VenderMembresiaPage from '../pages/VenderMembresiaPage';

import { isAuthenticated } from '../utils/auth';
import HomeRedirect from '../components/HomeRedirect';
import DashboardPageInstructor from '../pages/DashboardPageInstructores';

export default function AppRoutes() {
	return (
		<Routes>
			{/*RUTA PÚBLICA*/}
			<Route path="/login" element={<LoginPage />} />

			{/*RUTAS PRIVADAS*/}
			<Route
				path="/*"
				element={
					isAuthenticated() ? <DashboardLayout /> : <Navigate to="/login" />
				}
			>
				<Route index element={<HomeRedirect />} />

				<Route path="dashboard-admin" element={<DashboardPageAdmin />} />
				<Route path="dashboard-cliente" element={<DashboardPageClientes />} />
				<Route
					path="dashboard-instructor"
					element={<DashboardPageInstructor />}
				/>

				<Route path="vender-membresia" element={<VenderMembresiaPage />} />
				<Route path="clientes" element={<ClientesPage />} />
				<Route path="clases" element={<ClasesPage />} />
				<Route path="empleados" element={<EmpleadosPage />} />
				<Route path="instructores" element={<InstructoresPage />} />
				<Route path="membresias" element={<MembresiasPage />} />
			</Route>
		</Routes>
	);
}
