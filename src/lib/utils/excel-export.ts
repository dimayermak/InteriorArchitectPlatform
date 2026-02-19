/**
 * Lightweight CSV/Excel export utility — no external dependencies.
 * Creates a UTF-8 BOM csv file that Excel opens natively with Hebrew support.
 */

export interface ExcelColumn<T extends object> {
    header: string;
    key: keyof T | ((row: T) => string | number | null | undefined);
}

export function exportToExcel<T extends object>(
    rows: T[],
    columns: ExcelColumn<T>[],
    filename: string
): void {
    const BOM = '\uFEFF'; // UTF-8 BOM for Hebrew support in Excel
    const headers = columns.map(c => `"${c.header}"`).join(',');

    const dataRows = rows.map(row => {
        return columns
            .map(col => {
                let val: unknown;
                if (typeof col.key === 'function') {
                    val = col.key(row);
                } else {
                    val = (row as Record<string, unknown>)[col.key as string];
                }
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            })
            .join(',');
    });

    const csv = BOM + [headers, ...dataRows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
