import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPageAdmin from '../pages/DashboardPageAdmin';
import ClientesPage from '../pages/ClientesPage';
import EmpleadosPage from '../pages/EmpleadosPage';
import ClasesPage from '../pages/ClasesPage';
import MembresiasPage from '../pages/MembresiasPage';
import InstructoresPage from '../pages/InstructoresPage';
import Loading from '../components/atoms/Loading';

import { isAuthenticated } from '../utils/auth';

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
				<Route index element={<DashboardPageAdmin />} />
				<Route path="clientes" element={<ClientesPage />} />
				<Route path="clases" element={<ClasesPage />} />
				<Route path="empleados" element={<EmpleadosPage />} />
				<Route path="instructores" element={<InstructoresPage />} />
				<Route path="membresias" element={<MembresiasPage />} />
			</Route>
		</Routes>
	);
}
