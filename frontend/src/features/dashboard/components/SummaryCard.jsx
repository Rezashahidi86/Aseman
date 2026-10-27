export function SummaryCard({ icon, label, value, hint }) {
  return (
    <article className="summary-card">
      <div className="summary-card__top">
        <span className="summary-card__label">{label}</span>
        <span className="summary-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
      <span className="summary-card__hint">{hint}</span>
    </article>
  );
}
