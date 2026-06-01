import { useMemo, useState } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Table({
  columns = [],
  data = [],
  searchPlaceholder = 'Buscar',
  pageSize = 10,
  emptyMessage = 'No hay registros para mostrar.',
  showSearch = true,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()

    return data.filter((row) =>
      columns.some((column) => {
        const rawValue = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.accessor]
        return String(rawValue ?? '').toLowerCase().includes(normalizedSearch)
      }),
    )
  }, [columns, data, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize)

  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages))

  return (
    <div className="table-shell">
      {showSearch ? (
        <div className="table-shell__toolbar">
          <label className="table-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
            />
          </label>
        </div>
      ) : null}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length ? (
              pageData.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((column) => {
                    const rawValue = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.accessor]

                    return (
                      <td key={column.header}>
                        {column.render ? column.render(rawValue, row) : rawValue}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="table__empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-shell__pagination">
        <span>
          Mostrando {pageData.length} de {filteredData.length} registros
        </span>
        <div className="table-shell__pagination-controls">
          <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1}>
            <FiChevronLeft />
          </button>
          <strong>
            {safePage} / {totalPages}
          </strong>
          <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}>
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}