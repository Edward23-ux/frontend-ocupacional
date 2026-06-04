import { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiChevronUp, FiEdit2, FiPlus } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import { useProtocolos } from '../../hooks/useProtocolos.js'
import { getSectoresActivos } from '../../api/endpoints/sectoresApi.js'
import { ROUTES } from '../../utils/constants.js'

const formatSpecialties = (relations = []) => relations.map((item) => item?.especialidad?.nombre ?? '-').filter(Boolean)

export default function ProtocolosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { protocolos, loading, fetchProtocolos, fetchProtocolosEspecialidades } = useProtocolos({ autoFetch: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState('TODOS')
  const [sectores, setSectores] = useState([])
  const [expandedProtocolId, setExpandedProtocolId] = useState(null)
  const [relationsByProtocol, setRelationsByProtocol] = useState({})

  useEffect(() => {
    fetchProtocolos()
    getSectoresActivos()
      .then((response) => setSectores(Array.isArray(response?.data) ? response.data : []))
      .catch(() => setSectores([]))
  }, [fetchProtocolos])

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const sectorId = query.get('sector')
    if (sectorId) {
      setSectorFilter(sectorId)
    }
  }, [location.search])

  const filteredProtocolos = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    return protocolos.filter((protocolo) => {
      const matchesSearch = (protocolo?.nombre ?? '').toLowerCase().includes(normalizedSearch)
      const matchesSector = sectorFilter === 'TODOS' || String(protocolo?.sector?.id) === String(sectorFilter)
      return matchesSearch && matchesSector
    })
  }, [protocolos, searchTerm, sectorFilter])

  const toggleExpanded = async (protocoloId) => {
    if (expandedProtocolId === protocoloId) {
      setExpandedProtocolId(null)
      return
    }

    setExpandedProtocolId(protocoloId)
    if (!relationsByProtocol[protocoloId]) {
      const relations = await fetchProtocolosEspecialidades(protocoloId)
      setRelationsByProtocol((current) => ({ ...current, [protocoloId]: relations }))
    }
  }

  const columns = [
    {
      header: 'Protocolo',
      accessor: (row) => row?.nombre,
      render: (value, row) => (
        <div className="person-cell">
          <Avatar name={value} />
            <strong>{value}</strong>
        </div>
      ),
    },
    { header: 'Sector', accessor: (row) => row?.sector?.nombre ?? '-', render: (value) => <Badge status="warning">{value}</Badge> },
    { header: 'Especialidades', accessor: (row) => (relationsByProtocol[row.id] ?? row?.protocoloEspecialidades ?? []).length },
    { header: 'Fecha creación', accessor: (row) => row?.fechaCreacion ?? '-' },
    { header: 'Estado', accessor: (row) => (row?.vigente ? 'Activo' : 'Inactivo'), render: (value) => <Badge status={value}>{value}</Badge> },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
        <div className="row-actions">
          <button type="button" className="icon-action" onClick={() => navigate(ROUTES.protocoloEditar(row.id))} aria-label="Editar"><FiEdit2 /></button>
        </div>
      ),
    },
  ]

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Protocolos</h1>
          <p className="page-description">Gestión de protocolos clínicos y sus especialidades asociadas.</p>
        </div>
        <Button icon={<FiPlus />} onClick={() => navigate(ROUTES.protocoloNuevo)}>Nuevo Protocolo</Button>
      </header>

      <section className="filters-bar">
        <label className="field field--inline field--search"><span>Búsqueda</span><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre" /></label>
        <label className="field field--inline field--select"><span>Sector</span><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}><option value="TODOS">Todos</option>{sectores.map((sector) => <option key={sector.id} value={sector.id}>{sector.nombre}</option>)}</select></label>
      </section>

      <div className="table-shell">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr>{columns.map((column) => <th key={column.header}>{column.header}</th>)}</tr></thead>
            <tbody>
              {filteredProtocolos.map((row) => {
                const expanded = expandedProtocolId === row.id
                const relations = relationsByProtocol[row.id] ?? row?.protocoloEspecialidades ?? []
                return (
                  <>
                    <tr key={row.id} onClick={() => toggleExpanded(row.id)} className="clickable-row">
                      {columns.map((column) => {
                        const rawValue = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.accessor]
                        return <td key={column.header}>{column.render ? column.render(rawValue, row) : rawValue}</td>
                      })}
                    </tr>
                    {expanded ? (
                      <tr key={`${row.id}-expanded`} className="expanded-row"><td colSpan={columns.length}><div className="history-list"><strong>Especialidades incluidas</strong>{relations.length ? formatSpecialties(relations).map((specialty) => <div className="history-list__item" key={specialty}><span>{specialty}</span></div>) : <p>No hay especialidades asociadas.</p>}</div></td></tr>
                    ) : null}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
        {loading ? <p>Cargando protocolos...</p> : null}
      </div>
    </main>
  )
}