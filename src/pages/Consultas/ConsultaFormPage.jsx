import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Alert from '../../components/common/Alert.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { useConsultas } from '../../hooks/useConsultas.js'
import { getRoles } from '../../api/endpoints/rolesApi.js'
import { getUsuariosByRol } from '../../api/endpoints/usuariosApi.js'
import { getProtocolos } from '../../api/endpoints/protocolosApi.js'
import { getEstados } from '../../api/endpoints/estadosApi.js'
import { formatDateForInput } from '../../utils/formatDate.js'
import { ROUTES } from '../../utils/constants.js'

const todayInputValue = () => new Date().toISOString().slice(0, 10)

const mapPacienteLabel = (usuario) =>
  `${usuario?.nombres ?? ''} ${usuario?.apellidoPaterno ?? ''} ${usuario?.apellidoMaterno ?? ''}`.trim() ||
  usuario?.correoCoorporativo ||
  `Paciente #${usuario?.id ?? ''}`

export default function ConsultaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { fetchConsultaById, createConsulta, updateConsulta } = useConsultas({ autoFetch: false })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [consultasData, setConsultasData] = useState({
    pacienteId: '',
    protocoloId: '',
    fechaConsulta: todayInputValue(),
    estadoId: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [pacientes, setPacientes] = useState([])
  const [protocolos, setProtocolos] = useState([])
  const [estados, setEstados] = useState([])
  const [patientSearch, setPatientSearch] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [rolesResponse, protocolosResponse, estadosResponse] = await Promise.all([
          getRoles(),
          getProtocolos(),
          getEstados(),
        ])

        const rolesData = rolesResponse?.data ?? []
        const pacienteRole = rolesData.find((role) => role?.nombre?.toUpperCase() === 'PACIENTE')
        const pacientesResponse = pacienteRole ? await getUsuariosByRol(pacienteRole.id) : { data: [] }

        if (!active) {
          return
        }

        setPacientes(Array.isArray(pacientesResponse?.data) ? pacientesResponse.data : [])
        setProtocolos(Array.isArray(protocolosResponse?.data) ? protocolosResponse.data : [])
        setEstados(Array.isArray(estadosResponse?.data) ? estadosResponse.data : [])

        if (isEditMode) {
          const consulta = await fetchConsultaById(id)
          if (consulta && active) {
            setConsultasData({
              pacienteId: consulta?.paciente?.id ?? '',
              protocoloId: consulta?.protocolo?.id ?? '',
              fechaConsulta: formatDateForInput(consulta?.fechaConsulta) || todayInputValue(),
              estadoId: consulta?.estado?.id ?? '',
            })
          }
        }
      } catch (fetchError) {
        const message = fetchError?.message || 'No se pudo cargar el formulario.'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [fetchConsultaById, id, isEditMode])

  const pacientesFiltrados = useMemo(() => {
    const normalizedSearch = patientSearch.toLowerCase().trim()
    return pacientes.filter((paciente) => mapPacienteLabel(paciente).toLowerCase().includes(normalizedSearch))
  }, [pacientes, patientSearch])

  const validate = () => {
    const nextErrors = {}

    if (!consultasData.pacienteId) nextErrors.pacienteId = 'El paciente es obligatorio.'
    if (!consultasData.protocoloId) nextErrors.protocoloId = 'El protocolo es obligatorio.'
    if (!consultasData.fechaConsulta) nextErrors.fechaConsulta = 'La fecha es obligatoria.'
    if (!consultasData.estadoId) nextErrors.estadoId = 'El estado es obligatorio.'

    if (consultasData.fechaConsulta && consultasData.fechaConsulta > todayInputValue()) {
      nextErrors.fechaConsulta = 'La fecha no puede ser futura.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (field, value) => {
    setConsultasData((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)

    const payload = {
      pacienteId: Number(consultasData.pacienteId),
      protocoloId: Number(consultasData.protocoloId),
      fechaConsulta: consultasData.fechaConsulta,
      estadoId: Number(consultasData.estadoId),
    }

    try {
      if (isEditMode) {
        await updateConsulta(id, payload)
      } else {
        await createConsulta(payload)
      }

      toast.success(`Consulta ${isEditMode ? 'actualizada' : 'creada'} correctamente`)
      navigate(ROUTES.consultas)
    } catch {
      // el hook ya notifica con toast
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="section-loader">
        <Spinner />
      </div>
    )
  }

  return (
    <main className="page-shell page-shell--form">
      <header className="page-toolbar">
        <div>
          <span className="page-eyebrow">Consultas</span>
          <h1 className="page-title">{isEditMode ? 'Editar Consulta' : 'Nueva Consulta'}</h1>
        </div>
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.consultas)}>
          Cancelar
        </Button>
      </header>

      {error ? <Alert type="error" title="Error">{error}</Alert> : null}

      <section className="form-card form-card--centered">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Paciente *</span>
            <input
              type="search"
              value={patientSearch}
              onChange={(event) => setPatientSearch(event.target.value)}
              placeholder="Buscar paciente"
            />
            <select
              value={consultasData.pacienteId}
              onChange={(event) => handleChange('pacienteId', event.target.value)}
            >
              <option value="">Seleccione un paciente</option>
              {pacientesFiltrados.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {mapPacienteLabel(paciente)}
                </option>
              ))}
            </select>
            {fieldErrors.pacienteId ? <span className="field-error">{fieldErrors.pacienteId}</span> : null}
          </label>

          <label className="field">
            <span>Protocolo *</span>
            <select
              value={consultasData.protocoloId}
              onChange={(event) => handleChange('protocoloId', event.target.value)}
            >
              <option value="">Seleccione un protocolo</option>
              {protocolos.map((protocolo) => (
                <option key={protocolo.id} value={protocolo.id}>
                  {protocolo.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.protocoloId ? <span className="field-error">{fieldErrors.protocoloId}</span> : null}
          </label>

          <label className="field">
            <span>Fecha de consulta *</span>
            <input
              type="date"
              value={consultasData.fechaConsulta}
              onChange={(event) => handleChange('fechaConsulta', event.target.value)}
              max={todayInputValue()}
            />
            {fieldErrors.fechaConsulta ? <span className="field-error">{fieldErrors.fechaConsulta}</span> : null}
          </label>

          <label className="field">
            <span>Estado *</span>
            <select
              value={consultasData.estadoId}
              onChange={(event) => handleChange('estadoId', event.target.value)}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.estadoId ? <span className="field-error">{fieldErrors.estadoId}</span> : null}
          </label>

          <div className="form-actions">
            <Button variant="outline" onClick={() => navigate(ROUTES.consultas)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" icon={<FiSave />} loading={saving}>
              Guardar consulta
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}