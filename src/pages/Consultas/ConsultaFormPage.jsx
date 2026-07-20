import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Alert from '../../components/common/Alert.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { useConsultas } from '../../hooks/useConsultas.js'
import { getRoles } from '../../api/endpoints/rolesApi.js'
import { getUsuariosByRol } from '../../api/endpoints/usuariosApi.js'
import { getEspecialidadesActivas } from '../../api/endpoints/especialidadesApi.js'
import { getTurnosActivos } from '../../api/endpoints/turnosApi.js'
import { formatDateForInput } from '../../utils/formatDate.js'
import { ROUTES } from '../../utils/constants.js'

const todayInputValue = () => new Date().toISOString().slice(0, 10)
const maxDateValue = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

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
    especialidadesIds: [],
    fechaConsulta: todayInputValue(),
    turnoId: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [pacientes, setPacientes] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [turnos, setTurnos] = useState([])
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientResults, setShowPatientResults] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [rolesResponse, especialidadesResponse, turnosResponse] = await Promise.all([
          getRoles(),
          getEspecialidadesActivas(),
          getTurnosActivos(),
        ])

        const rolesData = rolesResponse?.data ?? []
        const pacienteRole = rolesData.find((role) => role?.nombre?.toUpperCase() === 'PACIENTE')
        const pacientesResponse = pacienteRole ? await getUsuariosByRol(pacienteRole.id) : { data: [] }

        if (!active) {
          return
        }

        setPacientes(Array.isArray(pacientesResponse?.data) ? pacientesResponse.data : [])
        setEspecialidades(Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [])
        setTurnos(Array.isArray(turnosResponse?.data) ? turnosResponse.data : [])

        if (isEditMode) {
          const consulta = await fetchConsultaById(id)
          if (consulta && active) {
            setConsultasData({
              pacienteId: consulta?.paciente?.id ?? '',
              especialidadesIds: consulta?.detalleConsultas?.map((dc) => dc.especialidad?.id).filter(Boolean) ?? [],
              fechaConsulta: formatDateForInput(consulta?.fechaConsulta) || todayInputValue(),
              turnoId: consulta?.turno?.id ?? '',
            })
            setPatientSearch(mapPacienteLabel(consulta?.paciente))
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
    if (!consultasData.especialidadesIds || consultasData.especialidadesIds.length === 0) {
      nextErrors.especialidadesIds = 'Debe seleccionar al menos una especialidad.'
    }
    if (!consultasData.fechaConsulta) nextErrors.fechaConsulta = 'La fecha es obligatoria.'
    if (!consultasData.turnoId) nextErrors.turnoId = 'El turno es obligatorio.'

    if (consultasData.fechaConsulta && consultasData.fechaConsulta > maxDateValue()) {
      nextErrors.fechaConsulta = 'La fecha no puede ser posterior a 1 semana desde hoy.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (field, value) => {
    setConsultasData((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handlePatientSearchChange = (value) => {
    setPatientSearch(value)
    setConsultasData((current) => ({ ...current, pacienteId: '' }))
    setFieldErrors((current) => ({ ...current, pacienteId: undefined }))
    setShowPatientResults(value.trim().length > 0)
  }

  const handleSelectPatient = (paciente) => {
    setConsultasData((current) => ({ ...current, pacienteId: String(paciente.id) }))
    setFieldErrors((current) => ({ ...current, pacienteId: undefined }))
    setPatientSearch(mapPacienteLabel(paciente))
    setShowPatientResults(false)
  }

  const toggleSpecialty = (espId) => {
    setConsultasData((prev) => {
      const current = prev.especialidadesIds
      const next = current.includes(espId) ? current.filter((id) => id !== espId) : [...current, espId]
      return { ...prev, especialidadesIds: next }
    })
    setFieldErrors((prev) => ({ ...prev, especialidadesIds: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setSaving(true)

    const payload = {
      pacienteId: Number(consultasData.pacienteId),
      especialidadesIds: consultasData.especialidadesIds.map(Number),
      fechaConsulta: consultasData.fechaConsulta,
      turnoId: Number(consultasData.turnoId),
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
          <span className="page-eyebrow">Consultas Principal</span>
          <h1 className="page-title">{isEditMode ? 'Editar Consulta' : 'Nueva Consulta'}</h1>
        </div>
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.consultas)}>
          Cancelar
        </Button>
      </header>

      {error ? <Alert type="error" title="Error">{error}</Alert> : null}

      <section className="form-card form-card--centered" style={{ maxWidth: '680px' }}>
        <form className="stack-form" onSubmit={handleSubmit}>
          {/* Paciente Section */}
          <label className="field">
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Paciente</span>
            <div className="patient-search-field">
              <input
                type="search"
                value={patientSearch}
                onChange={(event) => handlePatientSearchChange(event.target.value)}
                onFocus={() => setShowPatientResults(patientSearch.trim().length > 0)}
                onBlur={() => {
                  window.setTimeout(() => setShowPatientResults(false), 120)
                }}
                placeholder="Buscar paciente por nombre o correo"
                autoComplete="off"
                style={{ padding: '0.75rem', borderRadius: '0.5rem' }}
              />

              {showPatientResults && patientSearch.trim() ? (
                <div className="patient-search-dropdown">
                  {pacientesFiltrados.length ? (
                    pacientesFiltrados.map((paciente) => (
                      <button
                        key={paciente.id}
                        type="button"
                        className="patient-search-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelectPatient(paciente)}
                      >
                        <strong>{mapPacienteLabel(paciente)}</strong>
                        <span>{paciente?.correoCoorporativo ?? 'Sin correo corporativo'}</span>
                      </button>
                    ))
                  ) : (
                    <div className="patient-search-option patient-search-option--empty">
                      No hay pacientes que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            {fieldErrors.pacienteId ? <span className="field-error">{fieldErrors.pacienteId}</span> : null}
          </label>

          {/* Especialidades Section */}
          <div className="field">
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>¿Por qué especialidades va a pasar?</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)', marginBottom: '0.75rem' }}>Selecciona todas las especialidades requeridas para la cita del paciente.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {especialidades.map((esp) => {
                const isSelected = consultasData.especialidadesIds.includes(esp.id)
                return (
                  <div
                    key={esp.id}
                    onClick={() => toggleSpecialty(esp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'between',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.5rem',
                      border: isSelected ? '2px solid var(--primary-color, #3b82f6)' : '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: isSelected ? 'var(--primary-light, #eff6ff)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ flex: 1, fontWeight: isSelected ? '600' : '400', fontSize: '0.875rem' }}>
                      {esp.nombre}
                    </span>
                    {isSelected && <FiCheckCircle style={{ color: 'var(--primary-color, #3b82f6)', fontSize: '1.1rem' }} />}
                  </div>
                )
              })}
            </div>
            {fieldErrors.especialidadesIds ? <span className="field-error">{fieldErrors.especialidadesIds}</span> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Fecha de consulta */}
            <label className="field">
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Fecha de consulta</span>
              <input
                type="date"
                value={consultasData.fechaConsulta}
                onChange={(event) => handleChange('fechaConsulta', event.target.value)}
                min={todayInputValue()}
                max={maxDateValue()}
                style={{ padding: '0.75rem', borderRadius: '0.5rem' }}
              />
              {fieldErrors.fechaConsulta ? <span className="field-error">{fieldErrors.fechaConsulta}</span> : null}
            </label>

            {/* Turno Section */}
            <div className="field">
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Turno de atención</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {turnos.map((t) => {
                  const isSelected = String(consultasData.turnoId) === String(t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleChange('turnoId', String(t.id))}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid var(--primary-color, #3b82f6)' : '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: isSelected ? 'var(--primary-light, #eff6ff)' : 'transparent',
                        color: isSelected ? 'var(--primary-dark, #1e40af)' : 'inherit',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t.nombre}
                    </button>
                  )
                })}
              </div>
              {fieldErrors.turnoId ? <span className="field-error">{fieldErrors.turnoId}</span> : null}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color, #cbd5e1)', paddingTop: '1.25rem' }}>
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