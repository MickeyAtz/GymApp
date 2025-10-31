import pool from '../db.js';
import bcrypt from 'bcrypt';

//Creación de empeleado
export const createEmpleado = async (req, res) => {
	const { nombre, apellidos, email, telefono, rol, password } = req.body;

	try {
		const empleadoExist = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1 and activo = true',
			[email]
		);

		if (empleadoExist.rows.length > 0) {
			return res.status(400).json({
				error: 'El empleado ya está registrado.',
			});
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		await pool.query('CALL registrar_empleado($1, $2, $3, $4, $5, $6)', [
			nombre,
			apellidos,
			telefono,
			rol,
			email,
			hashedPassword,
		]);

		res.json({
			message: 'Empleado registrado exitosamente',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error en el servidor' });
	}
};

//Obtener todos los empleados
export const getAllEmpleados = async (req, res) => {
	try {
		const empleados = await pool.query(`SELECT * FROM v_empleados`);
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
	const { nombre, apellidos, email, telefono, rol } = req.body;

	console.log(
		'información del empleado:',
		id,
		nombre,
		apellidos,
		email,
		telefono,
		rol,

		req.params
	);
	try {
		const checkEmail = await pool.query(
			'SELECT * FROM cuentas_acceso WHERE email = $1 AND empleado_id != $2',
			[email, id]
		);

		if (checkEmail.rows.length > 0) {
			return res
				.status(400)
				.json({ error: 'El email ya está en uso por otro empleado' });
		}

		await pool.query('CALL modificar_empleado($1, $2, $3, $4, $5, $6)', [
			id,
			nombre,
			apellidos,
			telefono,
			rol,
			email,
		]);

		return res.json({ message: 'Empleado actualizado correctamente.' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Error al actualizar el empleado' });
	}
};

//Eliminar empleado
export const deleteEmpleado = async (req, res) => {
	const { id } = req.params;
	try {
		const { rows } = await pool.query(
			'SELECT baja_empleado($1) AS empleado_eliminado_id',
			[id]
		);
		res.json({
			message: 'Empleado eliminado',
			empleado: rows[0].empleado_eliminado_id,
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
			'SELECT cambio_password_empleado($1, $2) AS empleado_actualizado_id',
			[id, hashedPassword]
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
