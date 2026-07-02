import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiEdit2, FiFileText, FiPlus, FiSave } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Modal from '../../components/common/Modal.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Alert from '../../components/common/Alert.jsx'
import Table from '../../components/common/Table.jsx'
import { useConsultas } from '../../hooks/useConsultas.js'
import { formatDate } from '../../utils/formatDate.js'
import { ROUTES } from '../../utils/constants.js'
import { getPersonal } from '../../api/endpoints/personalApi.js'
import { getEstados } from '../../api/endpoints/estadosApi.js'
import { getEspecialidadesActivas } from '../../api/endpoints/especialidadesApi.js'
import {
  createDetalleConsulta,
  getDetalleConsultasByConsulta,
} from '../../api/endpoints/detalleConsultasApi.js'

const emptyDetailForm = {
  medicoId: '',
  estadoId: '',
  especialidadId: '',
  resultados: '',
}

const getPacienteName = (consulta) =>
  `${consulta?.paciente?.nombres ?? ''} ${consulta?.paciente?.apellidoPaterno ?? ''} ${consulta?.paciente?.apellidoMaterno ?? ''}`.trim() ||
  'Sin paciente'

const getUsuarioFullName = (usuario) => {
  if (!usuario) return 'Sin dato'
  return `${usuario?.nombres ?? ''} ${usuario?.apellidoPaterno ?? ''} ${usuario?.apellidoMaterno ?? ''}`.trim() || 'Sin nombre'
}

const getEstadoName = (estado) => estado?.nombre ?? 'Sin estado'

const getNestedLabel = (value, fallback = 'Sin dato') => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value?.nombre ?? value?.especialidad?.nombre ?? fallback
}

export default function ConsultaDetallePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { fetchConsultaById } = useConsultas({ autoFetch: false })
  const [consulta, setConsulta] = useState(null)
  const [detalleConsultas, setDetalleConsultas] = useState([])
  const [loadingConsulta, setLoadingConsulta] = useState(true)
  const [loadingDetalles, setLoadingDetalles] = useState(true)
  const [error, setError] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [personal, setPersonal] = useState([])
  const [estados, setEstados] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [form, setForm] = useState(emptyDetailForm)

  const loadDetalle = async () => {
    setLoadingDetalles(true)

    try {
      const response = await getDetalleConsultasByConsulta(id)
      setDetalleConsultas(Array.isArray(response?.data) ? response.data : [])
    } catch (detalleError) {
      toast.error(detalleError?.message || 'No se pudieron cargar los detalles.')
    } finally {
      setLoadingDetalles(false)
    }
  }

  useEffect(() => {
    let active = true

    const loadConsulta = async () => {
      try {
        const consultaResponse = await fetchConsultaById(id)
        if (active) {
          setConsulta(consultaResponse)
        }
      } catch (consultaError) {
        setError(consultaError?.message || 'No se pudo cargar la consulta.')
      } finally {
        if (active) {
          setLoadingConsulta(false)
        }
      }
    }

    loadConsulta()
    loadDetalle()

    return () => {
      active = false
    }
  }, [fetchConsultaById, id])

  useEffect(() => {
    let active = true

    const loadDependencies = async () => {
      try {
        const [personalResponse, estadosResponse, especialidadesResponse] = await Promise.all([
          getPersonal(),
          getEstados(),
          getEspecialidadesActivas(),
        ])

        if (active) {
          setPersonal(Array.isArray(personalResponse?.data) ? personalResponse.data : [])
          setEstados(Array.isArray(estadosResponse?.data) ? estadosResponse.data : [])
          setEspecialidades(Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [])
        }
      } catch (dependencyError) {
        toast.error(dependencyError?.message || 'No se pudieron cargar catálogos.')
      }
    }

    loadDependencies()

    return () => {
      active = false
    }
  }, [])

  const detalleColumns = useMemo(
    () => [
      {
        header: 'Médico',
        accessor: (row) => getUsuarioFullName(row?.medico?.usuario),
      },
      {
        header: 'Especialidad',
        accessor: (row) => getNestedLabel(row?.especialidad),
      },
      {
        header: 'Estado',
        accessor: (row) => getEstadoName(row?.estado),
        render: (value) => <Badge status={value}>{value}</Badge>,
      },
      {
        header: 'Resultados',
        accessor: 'resultados',
        render: (value) => (
          value ? (
            <button type="button" className="text-link" onClick={() => window.open(value, '_blank', 'noopener,noreferrer')}>
              <FiFileText /> Ver resultado
            </button>
          ) : (
            'Sin resultado'
          )
        ),
      },
    ],
    [],
  )

  const handleAddDetalle = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await createDetalleConsulta({
        consultaId: Number(id),
        medicoId: form.medicoId ? Number(form.medicoId) : null,
        estadoId: Number(form.estadoId),
        especialidadId: Number(form.especialidadId),
        resultados: form.resultados,
      })
      toast.success('Detalle de consulta agregado correctamente')
      setOpenModal(false)
      setForm(emptyDetailForm)
      await loadDetalle()
    } catch (detalleError) {
      toast.error(detalleError?.message || 'No se pudo agregar el detalle.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingConsulta) {
    return (
      <div className="section-loader">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <Alert type="error" title="Error">{error}</Alert>
      </div>
    )
  }

  return (
    <main className="page-shell">
      <header className="detail-header">
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.consultas)}>
          Volver
        </Button>
        <h1 className="page-title">Consulta #{consulta?.id}</h1>
        <Button icon={<FiEdit2 />} onClick={() => navigate(ROUTES.consultaEditar(consulta?.id))}>
          Editar
        </Button>
      </header>

      <section className="detail-card detail-card--full" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <span className="page-eyebrow">Paciente</span>
          <h2 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>{getPacienteName(consulta)}</h2>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}><strong>DNI:</strong> {consulta?.paciente?.numeroDocumento ?? '-'}</p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}><strong>Tel:</strong> {consulta?.paciente?.telefono ?? '-'}</p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}><strong>Correo:</strong> {consulta?.paciente?.correoCoorporativo ?? '-'}</p>
        </div>

        <div style={{ flex: 1, minWidth: '250px', borderLeft: '1px solid var(--border-color, #e2e8f0)', paddingLeft: '2rem' }}>
          <span className="page-eyebrow">Datos de consulta</span>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}><strong>Fecha:</strong> {formatDate(consulta?.fechaConsulta)}</p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}><strong>Turno:</strong> {consulta?.turno?.nombre ?? '-'}</p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}><strong>Estado:</strong> <Badge status={getEstadoName(consulta?.estado)}>{getEstadoName(consulta?.estado)}</Badge></p>
        </div>
      </section>

      <section className="detail-card detail-card--full">
        <div className="section-heading">
          <div>
            <h2>🩺 Detalle de consulta</h2>
            <p>Detalle clínico asociado a esta consulta.</p>
          </div>
          <Button icon={<FiPlus />} onClick={() => setOpenModal(true)}>
            Agregar detalle de consulta
          </Button>
        </div>

        {loadingDetalles ? (
          <Spinner />
        ) : (
          <Table
            columns={detalleColumns}
            data={detalleConsultas}
            pageSize={5}
            searchPlaceholder="Buscar detalle..."
            emptyMessage="No hay detalles de consulta registrados"
          />
        )}
      </section>

      <Modal
        open={openModal}
        title="Agregar detalle de consulta"
        onClose={() => setOpenModal(false)}
        footer={null}
      >
        <form className="stack-form" onSubmit={handleAddDetalle}>
          <label className="field">
            <span>Médico (Opcional)</span>
            <select value={form.medicoId} onChange={(event) => setForm((current) => ({ ...current, medicoId: event.target.value }))}>
              <option value="">Seleccione un médico</option>
              {personal.map((item) => (
                <option key={item.id} value={item.id}>
                  {getUsuarioFullName(item?.usuario)} - {getNestedLabel(item?.especialidad)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Estado</span>
            <select value={form.estadoId} onChange={(event) => setForm((current) => ({ ...current, estadoId: event.target.value }))} required>
              <option value="">Seleccione un estado</option>
              {estados.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Especialidad</span>
            <select value={form.especialidadId} onChange={(event) => setForm((current) => ({ ...current, especialidadId: event.target.value }))} required>
              <option value="">Seleccione una opción</option>
              {especialidades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Resultados</span>
            <textarea
              rows="4"
              value={form.resultados}
              onChange={(event) => setForm((current) => ({ ...current, resultados: event.target.value }))}
              placeholder="Ruta del PDF o contenido del resultado"
            />
          </label>

          <div className="form-actions">
            <Button variant="outline" onClick={() => setOpenModal(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving} icon={<FiSave />}>
              Guardar detalle
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}