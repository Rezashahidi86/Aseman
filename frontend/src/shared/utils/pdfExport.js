function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function openPdfWindow() {
  const targetWindow = window.open('', '_blank');

  if (targetWindow) {
    targetWindow.document.write('<!doctype html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>آماده‌سازی خروجی PDF</title></head><body style="font-family:Arial,sans-serif;padding:24px">در حال آماده‌سازی فایل PDF...</body></html>');
    targetWindow.document.close();
  }

  return targetWindow;
}

export async function fetchAllPages(fetchPage, getItems) {
  const pageSize = 100;
  const firstResponse = await fetchPage(1, pageSize);
  const items = [...(getItems(firstResponse) || [])];
  const totalPages = Math.max(
    1,
    Number(firstResponse?.pagination?.totalPages) ||
      Math.ceil((Number(firstResponse?.pagination?.total) || items.length) / pageSize),
  );

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await fetchPage(page, pageSize);
    items.push(...(getItems(response) || []));
  }

  return items;
}

export function printPdfTable(targetWindow, { title, headers, rows }) {
  if (!targetWindow || targetWindow.closed) {
    throw new Error('پنجره خروجی PDF در دسترس نیست.');
  }

  const tableHeaders = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const tableRows = rows.length
    ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
    : `<tr><td class="empty" colspan="${headers.length}">موردی برای نمایش وجود ندارد.</td></tr>`;

  targetWindow.onload = () => {
    targetWindow.focus();
    targetWindow.print();
  };

  targetWindow.document.open();
  targetWindow.document.write(`<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    h1 { margin: 0 0 18px; font-size: 18px; text-align: center; }
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
    th { background: #f3f4f6; font-weight: 700; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .empty { text-align: center; color: #6b7280; padding: 20px; }
    @media screen { body { padding: 24px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`);
  targetWindow.document.close();
}
