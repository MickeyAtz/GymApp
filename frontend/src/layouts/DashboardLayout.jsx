import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/molecules/Sidebar';
import { useUser } from '../context/UserContext';
import Loading from '../components/atoms/Loading';

import '../styles/App.css';

export default function DashboardLayout() {
	const { user } = useUser();

	const [isOpen, setIsOpen] = useState(() => {
		const saved = localStorage.getItem('sidebarOpen');
		return saved ? JSON.parse(saved) : true;
	});

	useEffect(() => {
		localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
	}, [isOpen]);

	return (
		<div className="appWrapper">
			<Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
			<main className="mainContent">
				<Outlet />
			</main>
		</div>
	);
}
