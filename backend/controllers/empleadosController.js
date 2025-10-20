
import pool from '../db.js';
import bcrypt from 'bcrypt';

//Creación de empeleado
export const createEmpleado = async (req, res) => {
	const { nombre, apellidos, email, telefono, rol, password } = req.body;

	try {
		const empleadoExist = await pool.query(
			'SELECT * FROM empleados WHERE email = $1 and fecha_baja IS NULL',
			[email]
		);

		if (empleadoExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El empleado ya está registrado.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newEmpleado = await pool.query(
			'INSERT INTO empleados (nombre, apellidos, email, telefono, role_id, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[nombre, apellidos, email, telefono, rol, hashedPassword]
		);

		res.json({
			message: 'Empleado registrado exitosamente',
			empleado: newEmpleado.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	}
};

//Obtener todos los empleados
export const getAllEmpleados = async (req, res) => {
	try {
		const empleados = await pool.query(
			`SELECT e.*, r.nombre AS rol
			FROM empleados e 
			LEFT JOIN roles r ON e.role_id = r.id
			WHERE e.fecha_baja IS NULL`
		);
		res.json(empleados.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los empleados' });
	}
};

//Obtener empleado por ID
export const getEmpleadoById = async (req, res) => {
	const { id } = req.params;
	try {
		const empleado = await pool.query(
			'SELECT * FROM empleados WHERE id = $1 AND fecha_baja IS NULL',
			[id]
		);
		res.json(empleado.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener el empleado' });
	}
};

//Actualizar usuario
export const updateEmpleado = async (req, res) => {
	const { id } = req.params;
	const { nombre, apellidos, email, telefono, rol, password } = req.body;

	try {
		const checkEmail = await pool.query(
			'SELECT * FROM empleados WHERE email = $1 AND id != $2 AND fecha_baja IS NULL',
			[email, id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otro empleado' });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updatedEmpleado = await pool.query(
			'UPDATE empleados SET nombre = $1, apellidos = $2, email = $3, telefono = $4, role_id = $5, password = $6 WHERE id = $7 RETURNING *',
			[nombre, apellidos, email, telefono, rol, hashedPassword, id]
		);
		res.json({ empleado: updatedEmpleado.rows[0] });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar el empleado' });
	}
};

//Eliminar empleado
export const deleteEmpleado = async (req, res) => {
	const { id } = req.params;
	try {
		const deleteEmpleado = await pool.query(
			'UPDATE Empleados SET fecha_baja = NOW() WHERE id = $1 RETURNING * ',
			[id]
		);
		res.json({
			message: 'Empleado eliminado',
			empleado: deleteEmpleado.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar el empleado' });
	}
};

export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updatedEmpleado = await pool.query(
			'UPDATE empleados SET password = $1 WHERE id = $2',
			[hashedPassword, id]
		);
		res.json({
			message: 'Contraseña actualizada',
			empleado: updatedEmpleado.rows[0],
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al actualizar contraseña' });
	}
};
