import pool from '../db.js';
import bcrypt from 'bcrypt';
import { generarCodigoBarras } from '../utils/generarCodigoBarras.js';
import { generarTarjetaPDF } from '../services/generarTarjetaPDF.js';

// =================================================================
//  Funciones de ADMIN (Gestión de Clientes/Usuarios)
// =================================================================

// POST /api/usuarios/register
// Necesita: req.body (datos del usuario), req.user.perfil_id (empleado_id)
// Descripción: Registra un nuevo cliente (usuario) y su cuenta de acceso usando un SP.
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

// GET /api/usuarios
// Necesita: -
// Descripción: Obtiene todos los usuarios (clientes) activos desde la vista v_usuarios.
export const getAllUsuarios = async (req, res) => {
	try {
		const usuarios = await pool.query('SELECT * FROM v_usuarios');
		res.json(usuarios.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los usuarios' });
	}
};

// GET /api/usuarios/:id
// Necesita: req.params.id
// Descripción: Obtiene un usuario (cliente) específico por su ID.
export const getUsuarioById = async (req, res) => {
	const { id } = req.params;
	try {
		// CORRECCIÓN: Tu tabla usuarios usa 'fecha_baja' (con guion bajo)
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

// PUT /api/usuarios/:id
// Necesita: req.params.id, req.body (datos a actualizar)
// Descripción: Actualiza los datos de un usuario (cliente) usando un SP.
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

// PUT /api/usuarios/:id/baja
// Necesita: req.params.id
// Descripción: Realiza la baja lógica de un usuario (cliente) usando una función.
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

// PUT /api/usuarios/:id/passwordChange
// Necesita: req.params.id, req.body.password
// Descripción: Cambia la contraseña de la cuenta de un usuario (cliente).
export const passwordChange = async (req, res) => {
	const { id } = req.params;
	const { password } = req.body;
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const updateUsuario = await pool.query(
			`SELECT cambio_password_usuario($1, $2) AS usuario_actualizado_id`,
			[id, hashedPassword]
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

// GET /api/usuarios/search
// Necesita: req.query.search
// Descripción: Busca usuarios (clientes) por nombre, email o código de barras.
export const searchUsuarios = async (req, res) => {
	const { search } = req.query;

	if (!search || search.trim().length < 2) {
		return res.json([]);
	}

	const searchTerm = `%${search.trim()}%`;

	try {
		const usuarios = await pool.query(
			`
            SELECT usuario_id AS id, nombre, apellidos, codigo_barras
            FROM v_usuarios
            WHERE
                (
                    nombre ILIKE $1
                    OR apellidos ILIKE $1
                    OR (nombre || ' ' || apellidos) ILIKE $1
                    OR codigo_barras ILIKE $1 
                    OR email ILIKE $1
                )
            ORDER BY nombre ASC, apellidos ASC
            LIMIT 10
            `,
			[searchTerm]
		);

		console.log('Usuarios encontrados: ', usuarios.rows);

		res.json(usuarios.rows);
	} catch (error) {
		console.error('Error al buscar usuarios: ', error);
		res.status(500).json({ error: 'Error al buscar los usuarios.' });
	}
};

// =================================================================
//  Funciones de CLIENTE (Gestión de "Mis Inscripciones")
// =================================================================

// GET /api/usuarios/mis-inscripciones
// Necesita: req.user.perfil_id (del token del cliente)
// Descripción: Obtiene las clases en las que el cliente ya está inscrito.
export const getMisInscripciones = async (req, res) => {
	const usuario_id = req.user.perfil_id;

	try {
		const { rows } = await pool.query(
			`
                SELECT 
                    c.nombre AS clase_nombre,
                    c.dia,
                    c.hora,
                    i.nombre AS instructor_nombre,
                    ins.id AS inscripcion_id
                FROM inscripciones ins
                JOIN clases c ON c.id = ins.clase_id
                JOIN instructores i ON c.id_instructor = i.id
                WHERE ins.usuario_id = $1
                    AND ins.fechabaja IS NULL
                    AND c.fechabaja IS NULL
            `,
			[usuario_id]
		);

		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: 'Error al obtener inscripciones del usuario.' });
	}
};

// GET /api/usuarios/clases-disponibles
// Necesita: req.user.perfil_id (del token del cliente)
// Descripción: Muestra TODAS las clases activas, con cupo,
// EXCEPTO aquellas en las que el cliente ya está inscrito.
export const getClasesDisponibles = async (req, res) => {
	const usuario_id = req.user.perfil_id;
	try {
		const { rows } = await pool.query(
			`
                SELECT 
                    c.*,
                    i.nombre AS instructor_nombre,
                    (SELECT COUNT(*) FROM inscripciones i_count
                    WHERE i_count.clase_id = c.id AND i_count.fechabaja IS NULL) AS inscritos
                FROM clases c
                LEFT JOIN instructores i ON c.id_instructor = i.id
                WHERE c.fechabaja IS NULL -- <-- CORREGIDO (antes 'IS NULLS')
                    AND c.id NOT IN(
                        SELECT clase_id FROM inscripciones
                        WHERE usuario_id = $1 AND fechabaja IS NULL
                    )
                ORDER BY c.dia, c.hora
            `,
			[usuario_id]
		);

		return res.json(rows);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: 'Error al obtener las clases dispoinbles.' });
	}
};

// POST /api/usuarios/inscribir/:clase_id
// Necesita: req.params.clase_id, req.user.perfil_id (del token)
// Descripción: Inscribe al cliente en una clase, verificando cupo y concurrencia.
// POST /api/cliente/inscribir/:clase_id
// Necesita: req.params.clase_id, req.user.perfil_id (del token)
// Descripción: Inscribe al cliente en una clase (con lógica UPSERT).
export const inscribirEnClase = async (req, res) => {
	const usuario_id = req.user.perfil_id;
	const { clase_id } = req.params;

	const cliente = await pool.connect();
	try {
		await cliente.query('BEGIN');

		// 1. Verificar capacidad (con bloqueo)
		const claseResult = await cliente.query(
			`
            SELECT
                c.capacidad,
                (SELECT COUNT(*) FROM inscripciones i
                WHERE i.clase_id = c.id AND i.fechabaja IS NULL) AS inscritos
            FROM clases c
            WHERE c.id = $1 AND c.fechabaja IS NULL
            FOR UPDATE;
            `,
			[clase_id]
		);

		if (claseResult.rows.length === 0) {
			throw new Error('La clase no existe o no está disponible.');
		}

		const { capacidad, inscritos } = claseResult.rows[0];

		if (inscritos >= capacidad) {
			throw new Error('Esta clase ya está llena.');
		}

		// --- ¡LÓGICA UPSERT INICIA AQUÍ! ---

		// 2. Buscar CUALQUIER inscripción (activa o inactiva)
		const inscripcionExistente = await cliente.query(
			'SELECT * FROM inscripciones WHERE usuario_id = $1 AND clase_id = $2',
			[usuario_id, clase_id]
		);

		// 3. Tomar decisión
		if (inscripcionExistente.rows.length > 0) {
			// CASO B: El registro YA EXISTE
			const inscripcion = inscripcionExistente.rows[0];

			if (inscripcion.fechabaja === null) {
				// Sub-caso B1: Ya está inscrito y activo
				throw new Error('Ya estás inscrito en esta clase.');
			} else {
				// Sub-caso B2: Está re-inscribiéndose. Reactivamos el registro.
				await cliente.query(
					'UPDATE inscripciones SET fechabaja = NULL WHERE id = $1',
					[inscripcion.id]
				);
			}
		} else {
			// CASO A: El registro NO EXISTE. Creamos uno nuevo.
			await cliente.query(
				// Aseguramos que fechabaja inicie como NULL
				'INSERT INTO inscripciones (usuario_id, clase_id, fechabaja) VALUES ($1, $2, NULL)',
				[usuario_id, clase_id]
			);
		}
		// --- FIN DE LÓGICA UPSERT ---

		await cliente.query('COMMIT');
		return res
			.status(201)
			.json({ message: 'Inscripción realizada exitosamente.' });
	} catch (error) {
		await cliente.query('ROLLBACK');
		console.error(error);
		// Usamos 400 (Bad Request) para errores de lógica de negocio (ej. "Clase llena")
		return res
			.status(400)
			.json({ error: error.message || 'Error al inscribir al usuario' });
	} finally {
		cliente.release();
	}
};

// PUT /api/usuarios/baja/:id_inscripcion
// Necesita: req.params.id_inscripcion, req.user.perfil_id (del token)
// Descripción: Da de baja al cliente de una clase (baja lógica).
export const darseDeBaja = async (req, res) => {
	const usuario_id = req.user.perfil_id;
	const { id_inscripcion } = req.params;

	try {
		const { rowCount } = await pool.query(
			`UPDATE inscripciones
            SET fechabaja = NOW()
            WHERE id = $1
                AND usuario_id = $2
                AND fechabaja IS NULL
            `,
			[id_inscripcion, usuario_id]
		);

		if (rowCount === 0) {
			return res
				.status(404)
				.json({ error: 'Inscripción no encontrada o no autorizada' });
		}

		return res
			.status(200)
			.json({ message: 'Te has dado de baja de la clase exitosamente.' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Error al dar de baja' });
	}
};
