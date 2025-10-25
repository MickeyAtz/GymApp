
export function generarCodigoBarras(nombre, apellidos, tipoUsuario, id) {
	const partesNombre = nombre?.trim().split(/\s+/) || [];
	const inicialesNombre = partesNombre
		.map((n) => n[0]?.toUpperCase())
		.join('')
		.slice(0, 2);

	const partesApellidos = apellidos?.trim().split(/\s+/) || [];
	const inicialesApellidos = partesApellidos
		.map((p) => p[0]?.toUpperCase())
		.join('')
		.slice(0, 2);

	const tipoLetra =
		tipoUsuario === 'cliente'
			? 'C'
			: tipoUsuario === 'empleado'
				? 'E'
				: tipoUsuario === 'admin'
					? 'A'
					: tipoUsuario === 'instructor'
						? 'I'
						: 'X';

	const idFormateado = String(id).padStart(4, 0);

	return `${inicialesNombre}${inicialesApellidos}${tipoLetra}${idFormateado}`;
}

