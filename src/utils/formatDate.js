const ES_DATE_TIME = new Intl.DateTimeFormat('es-PE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const ES_DATE = new Intl.DateTimeFormat('es-PE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const parseDate = (value) => {
  if (!value) {
    return null
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value) => {
  const date = parseDate(value)

  return date ? ES_DATE.format(date) : '-'
}

export const formatDateTime = (value) => {
  const date = parseDate(value)

  return date ? ES_DATE_TIME.format(date) : '-'
}

export const formatDateTimeShort = (value) => {
  const date = parseDate(value)

  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatDateForInput = (value) => {
  const date = parseDate(value)

  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}