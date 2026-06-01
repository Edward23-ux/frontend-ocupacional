export default function Alert({ type = 'success', title, children }) {
  return (
    <div className={`alert alert--${type}`}>
      {title ? <strong>{title}</strong> : null}
      {children ? <p>{children}</p> : null}
    </div>
  )
}