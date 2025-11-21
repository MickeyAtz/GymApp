import React, { useState, useEffect } from 'react';
import { useOutlet, useLocation } from 'react-router-dom'; // <-- 1. AGREGAR useLocation AQUÍ
import Sidebar from '../components/molecules/Sidebar';
import { useUser } from '../context/UserContext';
import { AnimatePresence, motion } from 'framer-motion';

import '../styles/App.css';

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	in: { opacity: 1, y: 0 },
	out: { opacity: 0, y: -20 },
};

const pageTransition = {
	type: 'tween',
	ease: 'anticipate',
	duration: 0.25,
};

export default function DashboardLayout() {
	const { user } = useUser();
	const location = useLocation();
	const currentOutlet = useOutlet();

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

			<main
				className="mainContent"
				style={{ position: 'relative', overflowX: 'hidden' }}
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						initial="initial"
						animate="in"
						exit="out"
						variants={pageVariants}
						transition={pageTransition}
						style={{ width: '100%', height: '100%' }}
					>
						{currentOutlet}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
}
