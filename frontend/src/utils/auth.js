
export function isAuthenticated() {
	const token = localStorage.getItem('token');
	return !!token;
}

export function getUser() {
	const user = localStorage.getItem('usuario');
	return user ? JSON.parse(user) : null;
}

