import React from 'react';
import styles from './style/ListItem.module.css';

import Button from './Button';
import Badge from './Badge';

export default function ListItem({ item, renderContent, actions = [], badge }) {
	return (
		<li className={styles.item}>
			<div className={styles.content}>{renderContent(item)}</div>
			{badge && (
				<div className={styles.badge}>
					<Badge variant={badge.variant || 'primary'}>{badge.lavel}</Badge>
				</div>
			)}
			{actions.length > 0 && (
				<div className={styles.actions}>
					{actions.map((action, i) => (
						<Button
							key={i}
							variant={action.variant || 'primary'}
							onClick={() => action.onClick(item)}
						>
							{action.label}
						</Button>
					))}
					;
				</div>
			)}
		</li>
	);
}
