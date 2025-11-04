import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loading from '../components/atoms/Loading';

export default function ProtectedRoute({ children, allowedRoles }) {
	const { user } = useUser();

	if (!user) return <Loading />;

	if (!allowedRoles.includes(user.perfil)) {
		let homeDashboard = '/login';

		if (user.perfil === 'empleado') homeDashboard = '/dashboard-admin';
		if (user.perfil === 'instructor') homeDashboard = '/dashboard-instructor';
		if (user.perfil === 'cliente') homeDashboard = '/dashboard-cliente';

		return <Navigate to={homeDashboard} replace />;
	}

	return children;
}
