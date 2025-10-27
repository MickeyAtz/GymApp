import pool from '../db.js';
import bcrypt from 'bcrypt';
import { generarCodigoBarras } from '../utils/generarCodigoBarras.js';
import { generarTarjetaPDF } from '../services/generarTarjetaPDF.js';

//Creación de usuario
export const createUsuario = async (req, res) => {
	const { nombre, apellidos, email, telefono, password } = req.body;

	try {
		const userExist = await pool.query(
			'SELECT * FROM usuarios WHERE email = $1',
			[email]
		);

		if (userExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El usuario ya está registrado.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const nuevo = await pool.query(
			'INSERT INTO usuarios (nombre, apellidos, email, telefono, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
			[nombre, apellidos, email, telefono, hashedPassword]
		);

		const id = nuevo.rows[0].id;
		const codigo = generarCodigoBarras(nombre, apellidos, 'cliente', id);

		const newUser = await pool.query(
			'UPDATE usuarios SET codigo_barras = $1 WHERE id = $2 RETURNING *',
			[codigo, id]
		);

		const cliente = {
			...newUser.rows[0],
			tipo_usuario: 'cliente',
		};

		generarTarjetaPDF(cliente);

		res.json({
			message: 'Usuario registrado exitosamente',
			user: newUser.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	}
};

//Obtener todos los usuarios
export const getAllUsuarios = async (req, res) => {
	try {
		const usuarios = await pool.query(
			'SELECT * FROM usuarios WHERE fecha_baja IS NULL'
		);
		res.json(usuarios.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los usuarios' });
	}
};

//Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
	const { id } = req.params;
	try {
		const usuario = await pool.query(
			'SELECT * FROM usuarios WHERE id = $1 AND fecha_baja IS NULL',
			[id]
		);
		res.json(usuario.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener el usuario' });
	}
};

//Actualizar usuario
export const updateUsuario = async (req, res) => {
	const { id } = req.params;
	const { nombre, apellidos, email, telefono, password } = req.body;

	try {
		const checkEmail = await pool.query(
			'SELECT * FROM usuarios WHERE email = $1 AND id != $2',
			[email, id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otro usuario' });
		}

		const newCode = generarCodigoBarras(nombre, apellidos, 'cliente', id);

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updatedUsuario = await pool.query(
			'UPDATE usuarios SET nombre = $1, apellidos = $6, email = $2, telefono = $3, password = $4, codigo_barras = $7 WHERE id = $5 RETURNING *',
			[nombre, email, telefono, hashedPassword, id, apellidos, newCode]
		);

		generarTarjetaPDF(updateUsuario);

		res.json({ usuario: updatedUsuario.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar el usuario' });
	}
};

//Eliminar usuario
export const deleteUsuario = async (req, res) => {
	const { id } = req.params;
	try {
		const deleteUsuario = await pool.query(
			'UPDATE usuarios SET fecha_baja = NOW() WHERE id = $1 RETURNING * ',
			[id]
		);
		res.json({ message: 'Usuario eliminado', usuario: deleteUsuario.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar el usuario' });
	}
};

//CAMBIAR SOLO CONTRASEÑA
export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updateUsuario = await pool.query(
			`UPDATE usuarios SET password = $1 WHERE id = $2`,
			[hashedPassword, id]
		);
		res.json({
			message: 'Contraseña actualizada',
			usuario: updateUsuario.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar contraseña' });
	}
};

//Busqueda de usuarios
export const searchUsuarios = async (req, res) => {
	const { search } = req.query;

	if (!search || search.trim().length < 2) {
		return res.json([]);
	}

	const searchTerm = `%${search.trim()}%`;

	try {
		const usuarios = await pool.query(
			`
			SELECT id, nombre, apellidos, email
			FROM usuarios
			WHERE fecha_baja IS NULL
				AND (
					nombre ILIKE $1
					OR apellidos ILIKE $1
					OR email ILIKE $1
					OR (nombre || ' ' || apellidos) ILIKE $1
					OR codigo_barras ILIKE $1		
				)
			ORDER BY nombre ASC, apellidos ASC
			LIMIT 10
		`,
			[searchTerm]
		);
		res.json(usuarios.rows);
	} catch (error) {
		console.error('Error al buscar usuarios: ', error);
		res.status(500).json({ error: 'Error al buscar los usuarios.' });
	}
};
