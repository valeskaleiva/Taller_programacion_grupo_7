import React, { useState } from 'react';

interface TableProps<T> {
    data: T[];
    columns: { header: string; accessor: keyof T }[];
    itemsPerPage?: number;
}

const Table = <T,>({ data, columns, itemsPerPage = 10 }: TableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sortBy, setSortBy] = useState<keyof T | null>(null);

    const handleSort = (accessor: keyof T) => {
        const direction = sortBy === accessor && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(direction);
        setSortBy(accessor);
    };

    const sortedData = React.useMemo(() => {
        if (!sortBy) return data;
        return [...data].sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortBy, sortDirection]);

    const paginatedData = React.useMemo(() => {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedData.slice(start, end);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.accessor.toString()} onClick={() => handleSort(column.accessor)}>
                                {column.header} {sortBy === column.accessor ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column.accessor.toString()}>{item[column.accessor]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>Previous</button>
                <span>{currentPage + 1} of {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>Next</button>
            </div>
        </div>
    );
};

export default Table;