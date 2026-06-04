export default function Spinner({ size = 'medium', visible = true }) {
  if (!visible) {
    return null
  }

  return <span className={`spinner spinner--${size}`} aria-hidden="true" />
}