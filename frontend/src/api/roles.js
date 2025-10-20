import axios from 'axios';

export const getRoles = async () => {
	const response = await axios.get('http://localhost:3000/api/roles');
	return response.data;
};
