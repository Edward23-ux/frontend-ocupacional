import { useEffect, useMemo, useState } from 'react'
import { FiClock, FiGrid, FiList, FiPlus, FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import HorarioModal from '../../components/personal/HorarioModal.jsx'
import { usePersonal } from '../../hooks/usePersonal.js'
import { getEspecialidadesActivas } from '../../api/endpoints/especialidadesApi.js'
import { ROUTES } from '../../utils/constants.js'

const getFullName = (personal) =>
  `${personal?.usuario?.nombres ?? ''} ${personal?.usuario?.apellidoPaterno ?? ''} ${personal?.usuario?.apellidoMaterno ?? ''}`.trim()

export default function PersonalPage() {
  const navigate = useNavigate()
  const { personales, loading, fetchPersonal } = usePersonal({ autoFetch: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [especialidadFilter, setEspecialidadFilter] = useState('TODAS')
  const [viewMode, setViewMode] = useState('table')
  const [especialidades, setEspecialidades] = useState([])
  const [selectedPersonal, setSelectedPersonal] = useState(null)
  const [openHorarioModal, setOpenHorarioModal] = useState(false)

  useEffect(() => {
    fetchPersonal()
    getEspecialidadesActivas()
      .then((response) => setEspecialidades(Array.isArray(response?.data) ? response.data : []))
      .catch(() => setEspecialidades([]))
  }, [fetchPersonal])

  const filteredPersonal = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()

    return personales.filter((item) => {
      const name = getFullName(item).toLowerCase()
      const colegiatura = (item?.numeroColegiatura ?? '').toLowerCase()
      const especialidadName = (item?.especialidad?.nombre ?? '').toUpperCase()
      const matchesSearch = name.includes(normalizedSearch) || colegiatura.includes(normalizedSearch)
      const matchesEspecialidad = especialidadFilter === 'TODAS' || especialidadName === especialidadFilter
      return matchesSearch && matchesEspecialidad
    })
  }, [personales, searchTerm, especialidadFilter])

  const specialtyOptions = useMemo(() => ['TODAS', ...new Set(especialidades.map((item) => item?.nombre?.toUpperCase()).filter(Boolean))], [especialidades])

  const handleOpenSchedule = (personal) => {
    setSelectedPersonal(personal)
    setOpenHorarioModal(true)
  }

  const columns = [
    {
      header: 'Nombre',
      accessor: (row) => getFullName(row),
      render: (value, row) => (
        <div className="person-cell">
          <Avatar name={value} />
          <strong>{value || 'Sin nombre'}</strong>
        </div>
      ),
    },
    {
      header: 'Correo',
      accessor: (row) => row?.usuario?.correoCoorporativo ?? '-',
      render: (value) => value,
    },
    {
      header: 'Especialidad',
      accessor: (row) => row?.especialidad?.nombre ?? '-',
      render: (value) => <Badge status="teal">{value}</Badge>,
    },
    { header: 'Colegiatura', accessor: 'numeroColegiatura' },
    {
      header: 'Contrato',
      accessor: (row) => row?.contrato?.nombre ?? '-',
      render: (value) => <Badge status="indigo">{value}</Badge>,
    },
    {
      header: 'Estado',
      accessor: (row) => (row?.vigente ? 'Activo' : 'Inactivo'),
      render: (value) => <Badge status={value}>{value}</Badge>,
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
        <div className="row-actions">
          <button type="button" className="icon-action" onClick={() => handleOpenSchedule(row)} aria-label="Ver horarios">
            <FiClock />
          </button>
          <button type="button" className="icon-action" onClick={() => navigate(ROUTES.personalEditar(row.id))} aria-label="Editar">
            <FiEdit2 />
          </button>
        </div>
      ),
    },
  ]

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Personal médico</h1>
        </div>
        <div className="page-toolbar__actions">
          <div className="view-toggle">
            <button type="button" className={viewMode === 'table' ? 'view-toggle__item view-toggle__item--active' : 'view-toggle__item'} onClick={() => setViewMode('table')}>
              <FiList /> Tabla
            </button>
            <button type="button" className={viewMode === 'cards' ? 'view-toggle__item view-toggle__item--active' : 'view-toggle__item'} onClick={() => setViewMode('cards')}>
              <FiGrid /> Cards
            </button>
          </div>
          <Button icon={<FiPlus />} onClick={() => navigate(ROUTES.personalNuevo)}>Nuevo Personal</Button>
        </div>
      </header>

      <section className="filters-bar">
        <label className="field field--inline field--search">
          <span>Búsqueda</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre o número de colegiatura"
          />
        </label>

        <label className="field field--inline field--select">
          <span>Especialidad</span>
          <select value={especialidadFilter} onChange={(event) => setEspecialidadFilter(event.target.value)}>
            {specialtyOptions.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty === 'TODAS' ? 'Todas' : specialty}</option>
            ))}
          </select>
        </label>
      </section>

      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={filteredPersonal}
          showSearch={false}
          pageSize={10}
          emptyMessage="No hay personal registrado."
        />
      ) : (
        <section className="cards-grid">
          {filteredPersonal.map((personal) => (
            <article className="person-card" key={personal.id}>
              <div className="person-card__header">
                <Avatar name={getFullName(personal)} size={60} />
                <div>
                  <h3>{getFullName(personal)}</h3>
                  <p>{personal?.usuario?.correoCoorporativo ?? '-'}</p>
                </div>
              </div>

              <div className="person-card__chips">
                <Badge status="teal">{personal?.especialidad?.nombre ?? '-'}</Badge>
                <Badge status="indigo">{personal?.contrato?.nombre ?? '-'}</Badge>
              </div>

              <div className="person-card__meta">
                <span>Colegiatura: {personal?.numeroColegiatura ?? '-'}</span>
                <span>Contrato: {personal?.inicioContrato ?? '-'} → {personal?.finContrato ?? '-'}</span>
              </div>

              <div className="person-card__actions">
                <Button variant="outline" icon={<FiClock />} onClick={() => handleOpenSchedule(personal)}>Ver horarios</Button>
                <Button variant="outline" icon={<FiEdit2 />} onClick={() => navigate(ROUTES.personalEditar(personal.id))}>Editar</Button>
              </div>
            </article>
          ))}
        </section>
      )}

      <HorarioModal open={openHorarioModal} personal={selectedPersonal} onClose={() => setOpenHorarioModal(false)} />
    </main>
  )
}