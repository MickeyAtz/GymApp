import React, { useState, useMemo } from 'react';
import styles from './style/Table.module.css';

export default function Table({
	columns = [],
	data = [],
	renderCell,
	renderActions,
	rowsPerPage = 10,
}) {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
	const [searchTerm, setSearchTerm] = useState('');

	// Filtrar datos según searchTerm
	const filteredData = useMemo(() => {
		if (!searchTerm) return data;
		return data.filter((row) =>
			Object.values(row).some((value) =>
				String(value).toLowerCase().includes(searchTerm.toLowerCase())
			)
		);
	}, [data, searchTerm]);

	// Ordenar datos según sortConfig
	const sortedData = useMemo(() => {
		if (!sortConfig.key) return filteredData;
		return [...filteredData].sort((a, b) => {
			const aValue = a[sortConfig.key];
			const bValue = b[sortConfig.key];
			if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
			return 0;
		});
	}, [filteredData, sortConfig]);

	// Datos visibles por página
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * rowsPerPage;
		return sortedData.slice(startIndex, startIndex + rowsPerPage);
	}, [currentPage, sortedData, rowsPerPage]);

	const handleSort = (field) => {
		let direction = 'asc';
		if (sortConfig.key === field && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key: field, direction });
		setCurrentPage(1);
	};

	const totalPages = Math.ceil(sortedData.length / rowsPerPage);

	return (
		<div className={styles.tableWrapper}>
			{/* Buscador */}
			<input
				type="text"
				placeholder="Buscar..."
				value={searchTerm}
				onChange={(e) => {
					setSearchTerm(e.target.value);
					setCurrentPage(1);
				}}
				className={styles.searchInput}
			/>

			<table className={styles.table}>
				<thead>
					<tr>
						{columns.map((col) => (
							<th key={col.field} onClick={() => handleSort(col.field)}>
								{col.label}
								{sortConfig.key === col.field
									? sortConfig.direction === 'asc'
										? ' ▲'
										: ' ▼'
									: null}
							</th>
						))}
						{renderActions && <th>Acciones</th>}
					</tr>
				</thead>

				<tbody>
					{paginatedData.map((row, index) => (
						<tr key={row.id}>
							{columns.map((col) => (
								<td key={col.field}>
									{renderCell ? renderCell(row, col.field) : row[col.field]}
								</td>
							))}
							{renderActions && (
								<td className={styles.actiosnCell}>
									<div
										style={{
											display: 'flex',
											gap: '5px',
											justifyContent: 'center',
										}}
									>
										{renderActions(row)}
									</div>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>

			{/* Paginación */}
			<div className={styles.pagination}>
				<button
					disabled={currentPage === 1}
					onClick={() => setCurrentPage((prev) => prev - 1)}
				>
					Anterior
				</button>
				<span>
					Página {currentPage} de {totalPages}
				</span>
				<button
					disabled={currentPage === totalPages}
					onClick={() => setCurrentPage((prev) => prev + 1)}
				>
					Siguiente
				</button>
			</div>
		</div>
	);
}
