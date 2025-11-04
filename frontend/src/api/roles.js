import axiosInstance from './axiosInstance';

export const getRoles = async () => {
	const response = await axiosInstance.get('/roles');
	return response.data;
};
