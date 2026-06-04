import Spinner from './Spinner.jsx'

export default function Button({
  children,
  variant = 'primary',
  icon = null,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button--${variant} ${fullWidth ? 'button--full' : ''} ${className}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && iconPosition === 'left' ? <Spinner size="small" /> : null}
      {!loading && icon && iconPosition === 'left' ? <span className="button__icon">{icon}</span> : null}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' ? <span className="button__icon">{icon}</span> : null}
      {loading && iconPosition === 'right' ? <Spinner size="small" /> : null}
    </button>
  )
}