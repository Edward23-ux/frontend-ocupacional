import { useEffect, useMemo, useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import EncargadoFormModal from './EncargadoFormModal.jsx'


const filterDigits = (value) => value.replace(/\D/g, '')


const getDocumentRule = (documentName) => {
  const normalized = (documentName ?? '').toString().toLowerCase()
  if (normalized === 'dni' || normalized.includes('dni')) {
    return { min: 8, max: 8, label: '8 caracteres' }
  }
  if (normalized.includes('ruc')) {
    return { min: 11, max: 11, label: '11 dígitos' }
  }

  return { min: 5, max: 25, label: '5 a 25 caracteres' }
}

const emptyForm = {
  nombre: '',
  razonSocial: '',
  documentoId: '',
  numeroDocumento: '',
  sectorId: '',
  vigente: true,
}

export default function EmpresaFormModal({ open, empresa, documentos = [], sectores = [], saving = false, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})


  const [openEncargadoModal, setOpenEncargadoModal] = useState(false)
  const [responsableData, setResponsableData] = useState(null)

  useEffect(() => {
    if (open) {
      setForm({
        nombre: empresa?.nombre ?? '',
        razonSocial: empresa?.razonSocial ?? '',
        documentoId: empresa?.documento?.id ?? '',
        numeroDocumento: empresa?.numeroDocumento ?? '',
        sectorId: empresa?.sector?.id ?? '',
        vigente: empresa?.vigente ?? true,
      })

      setResponsableData(empresa?.usuarioCargo ? { ...empresa.usuarioCargo, yaExistente: true } : null)
      setErrors({})
    }
  }, [open, empresa])

  const selectedDocument = useMemo(
      () => documentos.find((item) => String(item.id) === String(form.documentoId)),
      [documentos, form.documentoId],
  )

  const documentRule = getDocumentRule(selectedDocument?.nombre)


  const handleDocumentNumberChange = (value) => {
    const filtered = filterDigits(value)
    setForm((prev) => ({ ...prev, numeroDocumento: filtered.slice(0, documentRule.max) }))
  }

  const handleAcceptResponsable = (data) => {
    setResponsableData(data)
    setOpenEncargadoModal(false)
    if (errors.responsable) {
      setErrors(prev => { const { responsable, ...rest } = prev; return rest; })
    }
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.'
    if (!form.razonSocial.trim()) nextErrors.razonSocial = 'La razón social es obligatoria.'
    if (!form.documentoId) nextErrors.documentoId = 'El documento es obligatorio.'
    if (!form.numeroDocumento.trim()) nextErrors.numeroDocumento = 'El número de documento es obligatorio.'
    if (!form.sectorId) nextErrors.sectorId = 'El sector es obligatorio.'
    if (!responsableData) nextErrors.responsable = 'Debe registrar un encargado para la empresa.'

    const length = form.numeroDocumento.trim().length
    if (form.numeroDocumento && (length < documentRule.min || length > documentRule.max)) {
      nextErrors.numeroDocumento = `Debe tener ${documentRule.label}.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    onSubmit({
      empresaPayload: {
        nombre: form.nombre.trim(),
        razonSocial: form.razonSocial.trim(),
        documentoId: Number(form.documentoId),
        numeroDocumento: form.numeroDocumento.trim(),
        sectorId: Number(form.sectorId),
        vigente: Boolean(form.vigente),
      },
      responsablePayload: responsableData
    })
  }

  return (
      <>
        <Modal open={open} title={empresa ? 'Editar empresa' : 'Nueva empresa'} onClose={saving ? undefined : onClose} footer={null}>
          <form className="stack-form" onSubmit={handleSubmit}>
            <div className="form-grid form-grid--two">
              <label className="field">
                <span>Nombre *</span>
                <input value={form.nombre} onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))} />
                {errors.nombre && <span className="field-error">{errors.nombre}</span>}
              </label>

              <label className="field">
                <span>Razón social *</span>
                <input value={form.razonSocial} onChange={(e) => setForm((c) => ({ ...c, razonSocial: e.target.value }))} />
                {errors.razonSocial && <span className="field-error">{errors.razonSocial}</span>}
              </label>

              <label className="field">
                <span>Tipo documento *</span>
                <select value={form.documentoId} onChange={(e) => setForm((c) => ({ ...c, documentoId: e.target.value, numeroDocumento: '' }))}>
                  <option value="">Seleccione...</option>
                  {documentos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
                {errors.documentoId && <span className="field-error">{errors.documentoId}</span>}
              </label>

              <label className="field">
                <span>N° documento *</span>
                <input
                    value={form.numeroDocumento}
                    onChange={(e) => handleDocumentNumberChange(e.target.value)}
                    maxLength={documentRule.max}
                    inputMode="numeric"
                />
                <small className="field-hint">{documentRule.label}</small>
                {errors.numeroDocumento && <span className="field-error">{errors.numeroDocumento}</span>}
              </label>

              <label className="field">
                <span>Sector *</span>
                <select value={form.sectorId} onChange={(e) => setForm((c) => ({ ...c, sectorId: e.target.value }))}>
                  <option value="">Seleccione...</option>
                  {sectores.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
                {errors.sectorId && <span className="field-error">{errors.sectorId}</span>}
              </label>

              {/* SECCIÓN RESPONSABLE CON BOTÓN PARA ABRIR MODAL HIJO */}
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <span>Encargado de Empresa *</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {responsableData ? (
                      <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', color: '#166534' }}>{responsableData.nombres} {responsableData.apellidoPaterno}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#15803d' }}>{responsableData.correoCoorporativo || responsableData.correoCorporativo}</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setOpenEncargadoModal(true)}>Modificar</Button>
                      </div>
                  ) : (
                      <div>
                        <Button type="button" onClick={() => setOpenEncargadoModal(true)}>+ Agregar Responsable</Button>
                        {errors.responsable && <p className="field-error" style={{ marginTop: '0.25rem' }}>{errors.responsable}</p>}
                      </div>
                  )}
                </div>
              </div>
            </div>

            <label className="toggle-row" style={{ marginTop: '1rem' }}>
              <input type="checkbox" checked={form.vigente} onChange={(e) => setForm((c) => ({ ...c, vigente: e.target.checked }))} /> Vigente
            </label>

            <div className="form-actions">
              <Button variant="outline" type="button" onClick={onClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" loading={saving}>Guardar</Button>
            </div>
          </form>
        </Modal>

        {/* MODAL DEL ENCARGADO */}
        <EncargadoFormModal
            open={openEncargadoModal}
            encargado={responsableData}
            documentos={documentos}
            onClose={() => setOpenEncargadoModal(false)}
            onAccept={handleAcceptResponsable}
        />
      </>
  )
}