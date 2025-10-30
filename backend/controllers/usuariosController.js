import pool from '../db.js';
import bcrypt from 'bcrypt';
import { generarCodigoBarras } from '../utils/generarCodigoBarras.js';
import { generarTarjetaPDF } from '../services/generarTarjetaPDF.js';

//Creación de usuario
export const createUsuario = async (req, res) => {
	const { nombre, apellidos, email, telefono, password } = req.body;
	const { perfil_id: empleado_id } = req.user;

	try {
		const userExist = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1 and activo = true',
			[email]
		);

		if (userExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El correo ya está registrado.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const nuevo = await pool.query(
			'SELECT registrar_usuario($1, $2, $3, $4, $5, $6) AS nuevo_id',
			[nombre, apellidos, telefono, empleado_id, email, hashedPassword]
		);

		const id = nuevo.rows[0].nuevo_id;
		const codigo = generarCodigoBarras(nombre, apellidos, 'cliente', id);

		const newUser = await pool.query(
			'UPDATE usuarios SET codigo_barras = $1 WHERE id = $2 RETURNING *',
			[codigo, id]
		);

		const cliente = {
			...newUser.rows[0],
			tipo_usuario: 'cliente',
		};

		await generarTarjetaPDF(cliente);

		console.log(cliente);

		return res.json({
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
		const usuarios = await pool.query('SELECT * FROM v_usuarios');
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
	const { nombre, apellidos, email, telefono } = req.body;

	try {
		const usuario = await pool.query(
			'SELECT modificar_usuario($1, $2, $3, $4, $5) AS usuario_modificado_id',
			[id, nombre, apellidos, telefono, email]
		);

		return res.status(200).json({ message: usuario.rows[0] });
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
			'SELECT baja_usuario($1) AS usuario_eliminado_id',
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
	const { usuario_id } = req.params;
	const { password } = req.body;
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updateUsuario = await pool.query(
			`SELECT cambio_password_usuario($1, $2) AS usuario_actualizado_id`,
			[usuario_id, hashedPassword]
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
			SELECT id, nombre, apellidos
			FROM usuarios
			WHERE fecha_baja IS NULL
				AND (
					nombre ILIKE $1
					OR apellidos ILIKE $1
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
