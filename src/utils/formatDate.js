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

  return date.toISOString().slice(0, 10)
}