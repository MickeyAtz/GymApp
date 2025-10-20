
export const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'No autenticado' });

		if (req.user.role_id && !allowedRoles.includes(req.user.role_id)) {
			return res
				.status(403)
				.json({ error: 'No tienes permiso para esta acción' });
		}

		if (req.user.tipo == 'cliente' && !allowedRoles.includes('cliente')) {
			return res
				.status(403)
				.json({ error: 'No tienes permisos para esta acción' });
		}
		next();
	};
};
