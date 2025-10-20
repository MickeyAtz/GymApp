export const allItems = [
	{ id: 1, label: 'Dashboard', icon: 'dashboard', path: '/' },
	{ id: 2, label: 'Clientes', icon: 'user', path: '/clientes' },
	{ id: 3, label: 'Empleados', icon: 'corbata', path: '/empleados' },
	{ id: 4, label: 'Clases', icon: 'teacher', path: '/clases' },
	{ id: 5, label: 'Membresías', icon: 'id', path: '/membresias' },
	{ id: 6, label: 'Instructores', icon: 'empleado', path: '/instructores' },
];

export const itemsByRole = {
	admin: allItems,
	empleado: allItems,
	instructor: allItems.filter((i) => ['Dashboard', 'Clases'].includes(i.label)),
	cliente: allItems.filter((i) => ['Dashboard'].includes(i.label)),
};
