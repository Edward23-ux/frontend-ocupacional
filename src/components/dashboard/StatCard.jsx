export default function StatCard({ label, value, icon, helper, accent = 'primary' }) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {helper ? <p className="stat-card__helper">{helper}</p> : null}
      </div>
    </article>
  )
}