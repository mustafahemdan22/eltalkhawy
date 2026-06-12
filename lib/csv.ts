export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string; format?: (v: T[keyof T], row: T) => string | number | null | undefined }[],
): string {
  if (rows.length === 0) {
    return columns.map((c) => escapeCsvCell(c.header)).join(',');
  }
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const v = row[col.key];
        const out = col.format ? col.format(v, row) : v;
        return escapeCsvCell(out);
      })
      .join(','),
  );
  return [header, ...body].join('\r\n');
}

function escapeCsvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCsv(filename: string, csv: string) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
