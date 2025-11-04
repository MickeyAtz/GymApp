export const allItems = [
	{ id: 1, label: 'Dashboard', icon: 'dashboard', path: '/' },
	{
		id: 2,
		label: 'Vender Membresías',
		icon: 'bag',
		path: '/vender-membresia',
	},
	{ id: 10, label: 'Registro de Visita', icon: 'barcode', path: '/check-in' },
	{ id: 3, label: 'Clientes', icon: 'user', path: '/clientes' },
	{ id: 4, label: 'Empleados', icon: 'corbata', path: '/empleados' },
	{ id: 5, label: 'Clases', icon: 'teacher', path: '/clases' },
	{ id: 6, label: 'Membresías', icon: 'id', path: '/membresias' },
	{ id: 7, label: 'Instructores', icon: 'empleado', path: '/instructores' },
	{ id: 8, label: 'Mis Clases', icon: 'teacher', path: '/mis-clases' },
	{
		id: 9,
		label: 'Inscribir Clases',
		icon: 'addClass',
		path: '/inscribir-clases',
	},
];

export const itemsByRole = {
	empleado: allItems.filter((i) =>
		[
			'Dashboard',
			'Registro de Visita',
			'Vender Membresías',
			'Clientes',
			'Empleados',
			'Clases',
			'Membresías',
			'Instructores',
		].includes(i.label)
	),
	instructor: allItems.filter((i) =>
		['Dashboard', 'Mis Clases'].includes(i.label)
	),
	cliente: allItems.filter((i) =>
		['Dashboard', 'Inscribir Clases'].includes(i.label)
	),
};
