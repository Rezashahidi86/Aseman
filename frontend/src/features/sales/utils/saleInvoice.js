function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const moneyFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 0,
});

const quantityFormatter = new Intl.NumberFormat('fa-IR');

function formatMoney(value) {
  return `${moneyFormatter.format(Number(value) || 0)} تومان`;
}

export function printSaleInvoice(targetWindow, {
  receipt,
  branchName,
  sellerName,
  formattedDate,
}) {
  if (!targetWindow || targetWindow.closed) {
    throw new Error('پنجره فاکتور در دسترس نیست.');
  }

  const items = Array.isArray(receipt?.items) ? receipt.items : [];
  const rows = items.map((item, index) => `
    <tr>
      <td>${quantityFormatter.format(index + 1)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.barcode || '—')}</td>
      <td>${quantityFormatter.format(Number(item.quantity) || 0)}</td>
      <td>${formatMoney(item.unitPrice)}</td>
      <td>${formatMoney(item.lineTotal)}</td>
    </tr>
  `).join('');

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
  <title>فاکتور فروش ${escapeHtml(receipt?.receiptNumber || '')}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    .invoice { width: 100%; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 18px; border-bottom: 2px solid #111827; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    .muted { color: #6b7280; font-size: 11px; line-height: 1.9; }
    .receipt-number { text-align: left; font-size: 12px; font-weight: 700; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 18px 0; padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
    .meta p { margin: 0; font-size: 11px; line-height: 2; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 9px 7px; text-align: right; font-size: 10px; line-height: 1.8; }
    th { background: #f3f4f6; font-weight: 700; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    .summary { width:  min(100%, 280px); margin: 18px 0 0 auto; }
    .summary div { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    .summary .total { font-size: 15px; font-weight: 700; border-bottom: 2px solid #111827; }
    footer { margin-top: 34px; padding-top: 12px; border-top: 1px dashed #d1d5db; text-align: center; color: #6b7280; font-size: 10px; }
    @media screen { body { padding: 24px; } }
  </style>
</head>
<body>
  <main class="invoice">
    <header>
      <div>
        <h1>فاکتور فروش</h1>
        <p class="muted">رسید ثبت‌شده در سامانه آسمان</p>
      </div>
      <div class="receipt-number">شماره فاکتور: ${escapeHtml(receipt?.receiptNumber || '—')}</div>
    </header>
    <section class="meta">
      <p><strong>شعبه:</strong> ${escapeHtml(branchName || '—')}</p>
      <p><strong>تاریخ:</strong> ${escapeHtml(formattedDate || '—')}</p>
      <p><strong>فروشنده:</strong> ${escapeHtml(sellerName || '—')}</p>
      <p><strong>تعداد اقلام:</strong> ${quantityFormatter.format(items.length)}</p>
    </section>
    <table>
      <thead>
        <tr>
          <th>ردیف</th>
          <th>نام کالا</th>
          <th>بارکد</th>
          <th>تعداد</th>
          <th>قیمت واحد</th>
          <th>جمع</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="6" style="text-align:center">اطلاعات اقلام در دسترس نیست.</td></tr>`}
      </tbody>
    </table>
    <section class="summary">
      <div><span>تعداد کل کالاها</span><strong>${quantityFormatter.format(receipt?.totalItemsSold || 0)} عدد</strong></div>
      <div class="total"><span>مبلغ قابل پرداخت</span><strong>${formatMoney(receipt?.totalSales)}</strong></div>
    </section>
    <footer>از خرید شما سپاسگزاریم</footer>
  </main>
</body>
</html>`);
  targetWindow.document.close();
}
