export const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'No autenticado' });

		const userRole = req.user.perfil;

		if (!userRole) {
			return res
				.status(403)
				.json({ error: 'Token inválido (no contiene rol)' });
		}

		if (!allowedRoles.includes(userRole)) {
			return res
				.status(403)
				.json({ error: 'No tienes permiso para esta acción' });
		}

		next();
	};
};
