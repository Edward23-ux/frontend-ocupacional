import { useEffect, useMemo, useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

const emptyForm = {
  nombre: '',
  razonSocial: '',
  documentoId: '',
  numeroDocumento: '',
  sectorId: '',
  usuarioCargoId: '',
  vigente: true,
}

const getDocumentRule = (documentName) => {
  const normalized = (documentName ?? '').toString().toLowerCase()
  if (normalized.includes('ruc')) {
    return { min: 11, max: 11, label: '11 dígitos' }
  }
  return { min: 5, max: 25, label: '5 a 25 caracteres' }
}

export default function EmpresaFormModal({ open, empresa, documentos = [], sectores = [], responsables = [], saving = false, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm({
        nombre: empresa?.nombre ?? '',
        razonSocial: empresa?.razonSocial ?? '',
        documentoId: empresa?.documento?.id ?? '',
        numeroDocumento: empresa?.numeroDocumento ?? '',
        sectorId: empresa?.sector?.id ?? '',
        usuarioCargoId: empresa?.usuarioCargo?.id ?? '',
        vigente: empresa?.vigente ?? true,
      })
      setErrors({})
    }
  }, [open, empresa])

  const selectedDocument = useMemo(
    () => documentos.find((item) => String(item.id) === String(form.documentoId)),
    [documentos, form.documentoId],
  )

  const documentRule = getDocumentRule(selectedDocument?.nombre)

  const validate = () => {
    const nextErrors = {}
    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.'
    if (!form.razonSocial.trim()) nextErrors.razonSocial = 'La razón social es obligatoria.'
    if (!form.documentoId) nextErrors.documentoId = 'El documento es obligatorio.'
    if (!form.numeroDocumento.trim()) nextErrors.numeroDocumento = 'El número de documento es obligatorio.'
    if (!form.sectorId) nextErrors.sectorId = 'El sector es obligatorio.'
    if (!form.usuarioCargoId) nextErrors.usuarioCargoId = 'El responsable es obligatorio.'

    const length = form.numeroDocumento.trim().length
    if (form.numeroDocumento && (length < documentRule.min || length > documentRule.max)) {
      nextErrors.numeroDocumento = `Debe tener ${documentRule.label}.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    await onSubmit({
      nombre: form.nombre.trim(),
      razonSocial: form.razonSocial.trim(),
      documentoId: Number(form.documentoId),
      numeroDocumento: form.numeroDocumento.trim(),
      sectorId: Number(form.sectorId),
      usuarioCargoId: Number(form.usuarioCargoId),
      vigente: Boolean(form.vigente),
    })
  }

  return (
    <Modal open={open} title={empresa ? 'Editar empresa' : 'Nueva empresa'} onClose={saving ? undefined : onClose} footer={null}>
      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two">
          <label className="field"><span>Nombre *</span><input value={form.nombre} onChange={(e) => setForm((c) => ({ ...c, nombre: e.target.value }))} />{errors.nombre ? <span className="field-error">{errors.nombre}</span> : null}</label>
          <label className="field"><span>Razón social *</span><input value={form.razonSocial} onChange={(e) => setForm((c) => ({ ...c, razonSocial: e.target.value }))} />{errors.razonSocial ? <span className="field-error">{errors.razonSocial}</span> : null}</label>
          <label className="field"><span>Tipo documento *</span><select value={form.documentoId} onChange={(e) => setForm((c) => ({ ...c, documentoId: e.target.value }))}><option value="">Seleccione...</option>{documentos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>{errors.documentoId ? <span className="field-error">{errors.documentoId}</span> : null}</label>
          <label className="field"><span>N° documento *</span><input value={form.numeroDocumento} onChange={(e) => setForm((c) => ({ ...c, numeroDocumento: e.target.value }))} /><small className="field-hint">{documentRule.label}</small>{errors.numeroDocumento ? <span className="field-error">{errors.numeroDocumento}</span> : null}</label>
          <label className="field"><span>Sector *</span><select value={form.sectorId} onChange={(e) => setForm((c) => ({ ...c, sectorId: e.target.value }))}><option value="">Seleccione...</option>{sectores.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>{errors.sectorId ? <span className="field-error">{errors.sectorId}</span> : null}</label>
          <label className="field"><span>Responsable *</span><select value={form.usuarioCargoId} onChange={(e) => setForm((c) => ({ ...c, usuarioCargoId: e.target.value }))}><option value="">Seleccione...</option>{responsables.map((item) => <option key={item.id} value={item.id}>{item.nombres} {item.apellidoPaterno} - {item.correoCoorporativo}</option>)}</select>{errors.usuarioCargoId ? <span className="field-error">{errors.usuarioCargoId}</span> : null}</label>
        </div>
        <label className="toggle-row"><input type="checkbox" checked={form.vigente} onChange={(e) => setForm((c) => ({ ...c, vigente: e.target.checked }))} /> Vigente</label>
        <div className="form-actions"><Button variant="outline" type="button" onClick={onClose} disabled={saving}>Cancelar</Button><Button type="submit" loading={saving}>Guardar</Button></div>
      </form>
    </Modal>
  )
}