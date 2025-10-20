import React from 'react';
import { iconMap } from '../../icons/iconMap';

export default function Icon({ name, size = 20, color = 'currentColor' }) {
	const IconComponent = iconMap[name];

	if (!IconComponent) return null;

	return <IconComponent size={size} color={color} />;
}
