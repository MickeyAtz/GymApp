import { ClipLoader } from 'react';

import styles from './style/Loading.module.css';

export default function Loading() {
	return (
		<div className={styles.overlay}>
			<div className={styles.loader}></div>
			<p className={styles.text}>Cargando...</p>
		</div>
	);
}
