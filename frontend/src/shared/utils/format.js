const moneyFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat('fa-IR');

export function formatMoney(value, currency = 'تومان') {
  return `${moneyFormatter.format(Number(value) || 0)} ${currency}`;
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}
