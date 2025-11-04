import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

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
import MisClasesInstructorPage from '../pages/MisClasesInstructorPage';
import InscripcionClientePage from '../pages/InscripcionClientePage';
import CheckInPage from '../pages/CheckInPage';
import ReportesPage from '../pages/ReportesPage';

import { isAuthenticated } from '../utils/auth';
import HomeRedirect from '../components/HomeRedirect';
import DashboardPageInstructor from '../pages/DashboardPageInstructores';

export default function AppRoutes() {
	const ROLES = {
		ADMIN: 'empleado',
		INSTRUCTOR: 'instructor',
		CLIENTE: 'cliente',
	};

	return (
		<Routes>
			{/*RUTA PÚBLICA*/}
			<Route path="/login" element={<LoginPage />} />

			<Route
				path="/check-in"
				element={
					<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
						<CheckInPage></CheckInPage>
					</ProtectedRoute>
				}
			/>
			{/*RUTAS PRIVADAS*/}
			<Route
				path="/*"
				element={
					isAuthenticated() ? <DashboardLayout /> : <Navigate to="/login" />
				}
			>
				{/* REDIRECCIÓN DEL INDEX */}
				<Route index element={<HomeRedirect />} />

				{/* RUTAS DE ADMINISTRACIÓN */}
				<Route
					path="dashboard-admin"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<DashboardPageAdmin />
						</ProtectedRoute>
					}
				/>
				{/* PÁGINAS CRUD */}
				<Route
					path="vender-membresia"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<VenderMembresiaPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="clientes"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<ClientesPage></ClientesPage>
						</ProtectedRoute>
					}
				/>

				<Route
					path="clases"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<ClasesPage></ClasesPage>
						</ProtectedRoute>
					}
				/>

				<Route
					path="empleados"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<EmpleadosPage></EmpleadosPage>
						</ProtectedRoute>
					}
				/>

				<Route
					path="instructores"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<InstructoresPage></InstructoresPage>
						</ProtectedRoute>
					}
				/>

				<Route
					path="membresias"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<MembresiasPage></MembresiasPage>
						</ProtectedRoute>
					}
				/>

				<Route
					path="reportes"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
							<ReportesPage></ReportesPage>
						</ProtectedRoute>
					}
				/>

				{/* FIN PÁGINAS CRUD - ADMINISTRACIÓN */}

				{/* PÁGINAS DEL CLIENTE */}
				<Route
					path="dashboard-cliente"
					element={
						<ProtectedRoute allowedRoles={[ROLES.CLIENTE]}>
							<DashboardPageClientes></DashboardPageClientes>
						</ProtectedRoute>
					}
				/>

				<Route
					path="inscribir-clases"
					element={
						<ProtectedRoute allowedRoles={[ROLES.CLIENTE]}>
							<InscripcionClientePage />
						</ProtectedRoute>
					}
				/>

				{/* PÁGINAS DEL INSTRUCTOR */}
				<Route
					path="dashboard-instructor"
					element={
						<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
							<DashboardPageInstructor></DashboardPageInstructor>
						</ProtectedRoute>
					}
				/>

				<Route
					path="mis-clases"
					element={
						<ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
							<MisClasesInstructorPage></MisClasesInstructorPage>
						</ProtectedRoute>
					}
				/>
			</Route>
		</Routes>
	);
}
