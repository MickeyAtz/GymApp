export const allItems = [
	{ id: 1, label: 'Dashboard', icon: 'dashboard', path: '/' },
	{
		id: 2,
		label: 'Vender Membresías',
		icon: 'dashboard',
		path: '/vender-membresia',
	},
	{ id: 3, label: 'Clientes', icon: 'user', path: '/clientes' },
	{ id: 4, label: 'Empleados', icon: 'corbata', path: '/empleados' },
	{ id: 5, label: 'Clases', icon: 'teacher', path: '/clases' },
	{ id: 6, label: 'Membresías', icon: 'id', path: '/membresias' },
	{ id: 7, label: 'Instructores', icon: 'empleado', path: '/instructores' },
];

export const itemsByRole = {
	admin: allItems,
	empleado: allItems,
	instructor: allItems.filter((i) => ['Dashboard', 'Clases'].includes(i.label)),
	cliente: allItems.filter((i) => ['Dashboard'].includes(i.label)),
};
