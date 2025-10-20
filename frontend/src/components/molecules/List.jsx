import React from 'react';

import ListItem from '../atoms/ListItem';
import styles from './style/List.module.css';

export default function List({ items = [] }) {
	return (
		<ul className={styles.list}>
			{items.map((item, index) => (
				<ListItem
					key={item.id || index}
					renderContent={() => (
						<>
							<strong>{item.name}</strong>
							<p>{item.email}</p>
							{item.status && (
								<span className={styles.badge}>{item.status}</span>
							)}
						</>
					)}
					actions={item.actions}
				></ListItem>
			))}
		</ul>
	);
}
