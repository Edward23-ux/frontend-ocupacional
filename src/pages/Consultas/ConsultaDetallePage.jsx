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
import {
  createDetalleConsulta,
  getDetalleConsultasByConsulta,
} from '../../api/endpoints/detalleConsultasApi.js'
import {
  getProtocoloEspecialidadesByProtocolo,
} from '../../api/endpoints/protocoloEspecialidadApi.js'

const emptyDetailForm = {
  medicoId: '',
  estadoId: '',
  protocoloEspecialidadId: '',
  resultados: '',
}

const getPacienteName = (consulta) =>
  `${consulta?.paciente?.nombres ?? ''} ${consulta?.paciente?.apellidoPaterno ?? ''} ${consulta?.paciente?.apellidoMaterno ?? ''}`.trim() ||
  'Sin paciente'

const getEstadoName = (estado) => estado?.nombre ?? 'Sin estado'

const getNestedLabel = (value, fallback = 'Sin dato') => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value?.nombre ?? value?.especialidad?.nombre ?? value?.protocolo?.nombre ?? fallback
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
  const [protocoloEspecialidades, setProtocoloEspecialidades] = useState([])
  const [form, setForm] = useState(emptyDetailForm)

  const protocoloId = consulta?.protocolo?.id

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
        const [personalResponse, estadosResponse] = await Promise.all([getPersonal(), getEstados()])

        if (active) {
          setPersonal(Array.isArray(personalResponse?.data) ? personalResponse.data : [])
          setEstados(Array.isArray(estadosResponse?.data) ? estadosResponse.data : [])
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

  useEffect(() => {
    let active = true

    const loadProtocolos = async () => {
      if (!protocoloId) {
        setProtocoloEspecialidades([])
        return
      }

      try {
        const response = await getProtocoloEspecialidadesByProtocolo(protocoloId)
        if (active) {
          setProtocoloEspecialidades(Array.isArray(response?.data) ? response.data : [])
        }
      } catch (protocolError) {
        toast.error(protocolError?.message || 'No se pudieron cargar protocolos asociados.')
      }
    }

    loadProtocolos()

    return () => {
      active = false
    }
  }, [protocoloId])

  const detalleColumns = useMemo(
    () => [
      {
        header: 'Médico',
        accessor: (row) => getNestedLabel(row?.medico?.usuario),
      },
      {
        header: 'Especialidad',
        accessor: (row) => getNestedLabel(row?.medico?.especialidad),
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
        medicoId: Number(form.medicoId),
        estadoId: Number(form.estadoId),
        protocoloEspecialidadId: Number(form.protocoloEspecialidadId),
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

      <section className="detail-grid">
        <article className="detail-card">
          <span className="page-eyebrow">Paciente</span>
          <h2>{getPacienteName(consulta)}</h2>
          <p>DNI: {consulta?.paciente?.numeroDocumento ?? '-'}</p>
          <p>Tel: {consulta?.paciente?.telefono ?? '-'}</p>
          <p>Correo: {consulta?.paciente?.correoCoorporativo ?? '-'}</p>
        </article>

        <article className="detail-card">
          <span className="page-eyebrow">Datos de consulta</span>
          <p><strong>Fecha:</strong> {formatDate(consulta?.fechaConsulta)}</p>
          <p><strong>Estado:</strong> <Badge status={getEstadoName(consulta?.estado)}>{getEstadoName(consulta?.estado)}</Badge></p>
          <p><strong>Protocolo:</strong> {consulta?.protocolo?.nombre ?? '-'}</p>
        </article>
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
            <span>Médico</span>
            <select value={form.medicoId} onChange={(event) => setForm((current) => ({ ...current, medicoId: event.target.value }))} required>
              <option value="">Seleccione un médico</option>
              {personal.map((item) => (
                <option key={item.id} value={item.id}>
                  {getNestedLabel(item?.usuario)} - {getNestedLabel(item?.especialidad)}
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
            <span>Protocolo Especialidad</span>
            <select value={form.protocoloEspecialidadId} onChange={(event) => setForm((current) => ({ ...current, protocoloEspecialidadId: event.target.value }))} required>
              <option value="">Seleccione una opción</option>
              {protocoloEspecialidades.map((item) => (
                <option key={item.id} value={item.id}>
                  {getNestedLabel(item?.especialidad)} / {getNestedLabel(item?.protocolo)}
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