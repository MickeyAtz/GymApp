import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loading from '../components/atoms/Loading';

export default function HomeRedirect() {
	const { user } = useUser();
	if (!user) return <Loading></Loading>;

	if (user.tipo === 'cliente')
		return <Navigate to="/dashboard-cliente" replace />;

	if (user.tipo === 'empleado')
		return <Navigate to="/dashboard-admin" replace />;

	if (user.tipo === 'instructor')
		return <Navigate to="/dashboard-instructor" replace />;

	return <Navigate to="/login" replace />;
}
