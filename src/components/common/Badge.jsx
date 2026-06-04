export default function Badge({ children, status = 'default', className = '', style, ...props }) {
  const normalized = (status ?? '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

  return (
    <span className={`badge badge--${normalized} ${className}`.trim()} style={style} {...props}>
      {children}
    </span>
  )
}