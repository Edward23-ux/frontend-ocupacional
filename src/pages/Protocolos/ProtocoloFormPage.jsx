import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { useProtocolos } from '../../hooks/useProtocolos.js'
import { getSectoresActivos } from '../../api/endpoints/sectoresApi.js'
import { getEspecialidadesActivas } from '../../api/endpoints/especialidadesApi.js'
import { ROUTES } from '../../utils/constants.js'

const today = () => new Date().toISOString().slice(0, 10)

export default function ProtocoloFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { fetchProtocoloById, createProtocolo, updateProtocolo, fetchProtocolosEspecialidades, syncEspecialidades } = useProtocolos({ autoFetch: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sectores, setSectores] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [protocoloId, setProtocoloId] = useState(null)
  const [form, setForm] = useState({ nombre: '', sectorId: '', vigente: true, fechaCreacion: today() })
  const [selectedEspecialidades, setSelectedEspecialidades] = useState([])
  const [existingRelations, setExistingRelations] = useState([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [sectoresResponse, especialidadesResponse] = await Promise.all([getSectoresActivos(), getEspecialidadesActivas()])
        if (!active) return
        setSectores(Array.isArray(sectoresResponse?.data) ? sectoresResponse.data : [])
        setEspecialidades(Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [])

        if (isEditMode) {
          const protocolo = await fetchProtocoloById(id)
          const relations = await fetchProtocolosEspecialidades(id)
          if (!active) return
          setProtocoloId(protocolo?.id ?? null)
          setForm({
            nombre: protocolo?.nombre ?? '',
            sectorId: protocolo?.sector?.id ?? '',
            vigente: protocolo?.vigente ?? true,
            fechaCreacion: protocolo?.fechaCreacion ?? today(),
          })
          setExistingRelations(relations)
          setSelectedEspecialidades(relations.map((relation) => relation?.especialidad?.id).filter(Boolean))
        }
      } catch (requestError) {
        setError(requestError?.message || 'No se pudo cargar el formulario.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [fetchProtocoloById, fetchProtocolosEspecialidades, id, isEditMode])

  const selectedSector = useMemo(() => sectores.find((item) => String(item.id) === String(form.sectorId)), [sectores, form.sectorId])
  const selectedSpecialtyObjects = useMemo(() => especialidades.filter((item) => selectedEspecialidades.includes(item.id)), [especialidades, selectedEspecialidades])

  const toggleSpecialty = (specialtyId) => {
    setSelectedEspecialidades((current) => current.includes(specialtyId) ? current.filter((item) => item !== specialtyId) : [...current, specialtyId])
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      let savedProtocol = protocoloId
      const payload = { nombre: form.nombre.trim(), sectorId: Number(form.sectorId), vigente: Boolean(form.vigente), fechaCreacion: form.fechaCreacion }

      if (isEditMode) {
        await updateProtocolo(id, payload)
        savedProtocol = Number(id)
      } else {
        const response = await createProtocolo(payload)
        savedProtocol = response?.id ?? response?.data?.id
      }

      await syncEspecialidades(savedProtocol, selectedEspecialidades, existingRelations)
      toast.success(`Protocolo ${isEditMode ? 'actualizado' : 'creado'} correctamente`)
      navigate(ROUTES.protocolos)
    } catch (requestError) {
      toast.error(requestError?.message || 'No se pudo guardar el protocolo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="section-loader"><Spinner /></div>
  if (error) return <div className="page-shell"><p>{error}</p></div>

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div><span className="page-eyebrow">Protocolos</span><h1 className="page-title">{isEditMode ? 'Editar Protocolo' : 'Nuevo Protocolo'}</h1></div>
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.protocolos)}>Cancelar</Button>
      </header>

      <section className="form-card form-card--wide">
        <form className="stack-form" onSubmit={handleSave}>
          {currentStep === 1 ? (
            <div className="form-section">
              <div className="section-heading"><div><h2>Paso 1. Datos del protocolo</h2><p>Define el nombre, sector y estado.</p></div></div>
              <div className="form-grid form-grid--two">
                <label className="field"><span>Nombre *</span><input value={form.nombre} onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))} /></label>
                <label className="field"><span>Sector *</span><select value={form.sectorId} onChange={(e) => setForm((c) => ({ ...c, sectorId: e.target.value }))}><option value="">Seleccione...</option>{sectores.map((sector) => <option key={sector.id} value={sector.id}>{sector.nombre}</option>)}</select></label>
              </div>
              <label className="toggle-row"><input type="checkbox" checked={form.vigente} onChange={(e) => setForm((c) => ({ ...c, vigente: e.target.checked }))} /> Vigente</label>
              <div className="form-actions"><Button type="button" onClick={() => setCurrentStep(2)}>Siguiente</Button></div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="form-section">
              <div className="section-heading"><div><h2>Paso 2. Especialidades incluidas</h2><p>Selecciona especialidades activas.</p></div><strong>{selectedEspecialidades.length} seleccionadas</strong></div>
              <div className="checkbox-grid">
                {especialidades.map((item) => (
                  <label className="checkbox-card" key={item.id}>
                    <input type="checkbox" checked={selectedEspecialidades.includes(item.id)} onChange={() => toggleSpecialty(item.id)} />
                    <span>{item.nombre}</span>
                  </label>
                ))}
              </div>
              <div className="form-actions"><Button variant="outline" type="button" onClick={() => setCurrentStep(1)}>Atrás</Button><Button type="button" onClick={() => setCurrentStep(3)}>Siguiente</Button></div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="form-section">
              <div className="section-heading"><div><h2>Paso 3. Resumen y confirmación</h2><p>Revisa antes de guardar.</p></div></div>
              <div className="preview-card">
                <h3>{form.nombre || 'Sin nombre'}</h3>
                <p>Sector: {selectedSector?.nombre ?? '-'}</p>
                <p>Vigente: {form.vigente ? 'Sí' : 'No'}</p>
                <div className="preview-card__chips">{selectedSpecialtyObjects.map((item) => <Badge key={item.id} status="teal">{item.nombre}</Badge>)}</div>
              </div>
              <div className="form-actions"><Button variant="outline" type="button" onClick={() => setCurrentStep(2)}>Atrás</Button><Button type="submit" icon={<FiSave />} loading={saving}>Confirmar y guardar</Button></div>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  )
}