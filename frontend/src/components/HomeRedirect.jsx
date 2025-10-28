import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loading from '../components/atoms/Loading';

export default function HomeRedirect() {
	const { user } = useUser();
	if (!user) return <Loading></Loading>;

	if (user.perfil === 'cliente')
		return <Navigate to="/dashboard-cliente" replace />;

	if (user.perfil === 'empleado')
		return <Navigate to="/dashboard-admin" replace />;

	if (user.perfil === 'instructor')
		return <Navigate to="/dashboard-instructor" replace />;

	return <Navigate to="/login" replace />;
}
