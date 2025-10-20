import { useState, useEffect } from 'react';
import {
	getUsuarios,
	createUsuario,
	updateUsuario,
	deleteUsuario,
} from '../api/usuarios';

export function useUsuarios() {
	const [usuarios, setUsuarios] = useState([]);

	const fetchUsuarios = async () => {
		const data = await getUsuarios();
		setUsuarios(data);
	};

	useEffect(() => {
		fetchUsuarios();
	}, []);

	const addUsuario = async (usuario) => {
		await createUsuario(usuario);
		fetchUsuarios();
	};

	const editUsuario = async (id, usuario) => {
		await updateUsuario(id, usuario);
		fetchUsuarios();
	};

	const removeUsuario = async (id) => {
		await deleteUsuario(id);
		fetchUsuarios();
	};

	return { usuarios, addUsuario, editUsuario, removeUsuario };
}
