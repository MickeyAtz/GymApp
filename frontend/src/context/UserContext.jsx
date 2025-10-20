import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem('usuario');
		if (storedUser) setUser(JSON.parse(storedUser));
	}, []);

	useEffect(() => {
		if (user) {
			localStorage.setItem('usuario', JSON.stringify(user));
		} else {
			localStorage.removeItem('usuario');
		}
	}, [user]);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => useContext(UserContext);
