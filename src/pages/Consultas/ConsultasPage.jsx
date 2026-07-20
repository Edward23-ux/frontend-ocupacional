import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiFilter, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import ConfirmModal from '../../components/common/ConfirmModal.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Table from '../../components/common/Table.jsx'
import { useConsultas } from '../../hooks/useConsultas.js'
import { formatDate } from '../../utils/formatDate.js'
import { ROUTES } from '../../utils/constants.js'
import Avatar from '../../components/common/Avatar.jsx'

const normalizeText = (value) => (value ?? '').toString().toLowerCase()

const getPacienteName = (consulta) =>
  `${consulta?.paciente?.nombres ?? ''} ${consulta?.paciente?.apellidoPaterno ?? ''} ${consulta?.paciente?.apellidoMaterno ?? ''}`.trim() ||
  consulta?.paciente?.correoCoorporativo ||
  'Sin paciente'

const getEstadoNombre = (consulta) => consulta?.estado?.nombre ?? 'Sin estado'

export default function ConsultasPage() {
  const navigate = useNavigate()
  const { consultas, loading, error, deleteConsulta, fetchConsultas } = useConsultas()
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS')
  const [selectedId, setSelectedId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchConsultas()
  }, [fetchConsultas])

  const estadosDisponibles = useMemo(() => {
    const items = consultas
      .map((consulta) => getEstadoNombre(consulta))
      .filter(Boolean)

    return ['TODOS', ...new Set(items.map((item) => item.toUpperCase()))]
  }, [consultas])

  const filteredConsultas = useMemo(() => {
    return consultas.filter((consulta) => {
      const matchesSearch = normalizeText(getPacienteName(consulta)).includes(normalizeText(searchTerm))
      const estadoNombre = getEstadoNombre(consulta).toUpperCase()
      const matchesEstado = estadoFiltro === 'TODOS' || estadoNombre === estadoFiltro
      return matchesSearch && matchesEstado
    })
  }, [consultas, searchTerm, estadoFiltro])

  const handleDelete = async () => {
    if (!selectedId) {
      return
    }

    setDeleting(true)

    try {
      await deleteConsulta(selectedId)
      setSelectedId(null)
    } catch {
      toast.error('No fue posible eliminar la consulta')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Paciente',
      accessor: (row) => getPacienteName(row),
      render: (value, row) => (
        <div className="person-cell">
          <Avatar name={value} />
          <strong>{value || 'Sin nombre'}</strong>
        </div>
      ),
    },
    {
      header: 'Fecha',
      accessor: (row) => row?.fechaConsulta,
      render: (value) => formatDate(value),
    },
    {
      header: 'Estado',
      accessor: (row) => getEstadoNombre(row),
      render: (value) => (
        <Badge status={(value ?? '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '')}>{value}</Badge>
      ),
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
        <div className="row-actions">
          <button type="button" className="icon-action" onClick={() => navigate(ROUTES.consultaDetalle(row.id))} aria-label="Ver detalle">
            <FiEye />
          </button>
          <button type="button" className="icon-action" onClick={() => navigate(ROUTES.consultaEditar(row.id))} aria-label="Editar">
            <FiEdit2 />
          </button>
          <button type="button" className="icon-action icon-action--danger" onClick={() => setSelectedId(row.id)} aria-label="Eliminar">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ]

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Consultas</h1>
        </div>
        <Button icon={<FiPlus />} onClick={() => navigate(ROUTES.consultaNueva)}>
          Nueva consulta
        </Button>
      </header>

      <section className="filters-bar">
        <label className="field field--inline field--search"><span>Búsqueda</span><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre" /></label>
        <label className="field field--inline field--select">
          <span>Filtrar estado</span>
          <div className="select-wrapper">
            <select value={estadoFiltro} onChange={(event) => setEstadoFiltro(event.target.value)}>
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>{estado === 'TODOS' ? 'Todos' : estado}</option>
              ))}
            </select>
          </div>
        </label>
      </section>

      {loading ? (
        <div className="section-loader">
          <Spinner />
        </div>
      ) : error ? (
        <div className="section-empty">{error}</div>
      ) : filteredConsultas.length ? (
        <Table
          columns={columns}
          data={filteredConsultas}
          pageSize={10}
          showSearch={false}
          emptyMessage="No hay consultas registradas"
        />
      ) : (
        <div className="section-empty">No hay consultas registradas</div>
      )}

      <ConfirmModal
        open={Boolean(selectedId)}
        title="¿Eliminar consulta?"
        message="Esta acción no se puede deshacer fácilmente."
        confirmLabel="Sí, eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelectedId(null)}
      />
    </main>
  )
}