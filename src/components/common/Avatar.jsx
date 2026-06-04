const COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#c2410c', '#be185d', '#475569', '#0891b2']

const getInitials = (name) => {
  const parts = (name ?? '')
    .toString()
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return '?'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const hashText = (text) => {
  const value = (text ?? '').toString()
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000
  }

  return Math.abs(hash)
}

export default function Avatar({ name, size = 44, className = '' }) {
  const backgroundColor = COLORS[hashText(name) % COLORS.length]

  return (
    <span
      className={`avatar ${className}`.trim()}
      title={name}
      style={{ width: size, height: size, backgroundColor }}
    >
      {getInitials(name)}
    </span>
  )
}