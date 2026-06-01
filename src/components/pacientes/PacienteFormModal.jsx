import { useEffect, useMemo, useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

const getDocumentRule = (documentoNombre) => {
  const normalized = (documentoNombre ?? '').toString().toLowerCase()

  if (normalized.includes('dni')) {
    return { min: 8, max: 8, label: '8 dígitos' }
  }

  if (normalized.includes('carnet') || normalized.includes('ext')) {
    return { min: 9, max: 12, label: '9 a 12 caracteres' }
  }

  if (normalized.includes('pasaporte')) {
    return { min: 6, max: 12, label: '6 a 12 caracteres' }
  }

  return { min: 5, max: 25, label: '5 a 25 caracteres' }
}

const emptyForm = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correoCoorporativo: '',
  contrasena: '',
  documentoId: '',
  numeroDocumento: '',
  telefono: '',
}

export default function PacienteFormModal({
  open,
  mode = 'create',
  patient,
  documentos = [],
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm({
        nombres: patient?.nombres ?? '',
        apellidoPaterno: patient?.apellidoPaterno ?? '',
        apellidoMaterno: patient?.apellidoMaterno ?? '',
        correoCoorporativo: patient?.correoCoorporativo ?? '',
        contrasena: '',
        documentoId: patient?.documento?.id ?? '',
        numeroDocumento: patient?.numeroDocumento ?? '',
        telefono: patient?.telefono ?? '',
      })
      setErrors({})
    }
  }, [open, patient])

  const selectedDocument = useMemo(
    () => documentos.find((documento) => String(documento.id) === String(form.documentoId)),
    [documentos, form.documentoId],
  )

  const documentRule = getDocumentRule(selectedDocument?.nombre)

  const validate = () => {
    const nextErrors = {}

    if (!form.nombres.trim()) nextErrors.nombres = 'El nombre es obligatorio.'
    if (!form.apellidoPaterno.trim()) nextErrors.apellidoPaterno = 'El apellido paterno es obligatorio.'
    if (!form.correoCoorporativo.trim()) nextErrors.correoCoorporativo = 'El correo es obligatorio.'
    if (!form.documentoId) nextErrors.documentoId = 'El tipo de documento es obligatorio.'
    if (!form.numeroDocumento.trim()) nextErrors.numeroDocumento = 'El número de documento es obligatorio.'
    if (!form.telefono.trim()) nextErrors.telefono = 'El teléfono es obligatorio.'
    if (mode === 'create' && !form.contrasena.trim()) nextErrors.contrasena = 'La contraseña es obligatoria.'

    const docLength = form.numeroDocumento.trim().length
    if (form.numeroDocumento && (docLength < documentRule.min || docLength > documentRule.max)) {
      nextErrors.numeroDocumento = `El documento debe tener ${documentRule.label}.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      correoCoorporativo: form.correoCoorporativo.trim(),
      contrasena: mode === 'create' ? form.contrasena : undefined,
      documentoId: Number(form.documentoId),
      numeroDocumento: form.numeroDocumento.trim(),
      telefono: form.telefono.trim(),
    })
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Nuevo paciente' : 'Editar paciente'}
      onClose={saving ? undefined : onClose}
      footer={null}
    >
      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two">
          <label className="field">
            <span>Nombre *</span>
            <input value={form.nombres} onChange={(event) => setForm((current) => ({ ...current, nombres: event.target.value }))} />
            {errors.nombres ? <span className="field-error">{errors.nombres}</span> : null}
          </label>

          <label className="field">
            <span>Apellido paterno *</span>
            <input value={form.apellidoPaterno} onChange={(event) => setForm((current) => ({ ...current, apellidoPaterno: event.target.value }))} />
            {errors.apellidoPaterno ? <span className="field-error">{errors.apellidoPaterno}</span> : null}
          </label>

          <label className="field">
            <span>Apellido materno</span>
            <input value={form.apellidoMaterno} onChange={(event) => setForm((current) => ({ ...current, apellidoMaterno: event.target.value }))} />
          </label>

          <label className="field">
            <span>Correo corporativo *</span>
            <input type="email" value={form.correoCoorporativo} onChange={(event) => setForm((current) => ({ ...current, correoCoorporativo: event.target.value }))} />
            {errors.correoCoorporativo ? <span className="field-error">{errors.correoCoorporativo}</span> : null}
          </label>

          {mode === 'create' ? (
            <label className="field">
              <span>Contraseña *</span>
              <input type="password" value={form.contrasena} onChange={(event) => setForm((current) => ({ ...current, contrasena: event.target.value }))} />
              {errors.contrasena ? <span className="field-error">{errors.contrasena}</span> : null}
            </label>
          ) : null}

          <label className="field">
            <span>Tipo documento *</span>
            <select value={form.documentoId} onChange={(event) => setForm((current) => ({ ...current, documentoId: event.target.value }))}>
              <option value="">Seleccione...</option>
              {documentos.map((documento) => (
                <option key={documento.id} value={documento.id}>
                  {documento.nombre}
                </option>
              ))}
            </select>
            {errors.documentoId ? <span className="field-error">{errors.documentoId}</span> : null}
          </label>

          <label className="field">
            <span>N° documento *</span>
            <input value={form.numeroDocumento} onChange={(event) => setForm((current) => ({ ...current, numeroDocumento: event.target.value }))} />
            <small className="field-hint">{documentRule.label}</small>
            {errors.numeroDocumento ? <span className="field-error">{errors.numeroDocumento}</span> : null}
          </label>

          <label className="field">
            <span>Teléfono *</span>
            <input value={form.telefono} onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))} />
            {errors.telefono ? <span className="field-error">{errors.telefono}</span> : null}
          </label>
        </div>

        <div className="form-actions">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" loading={saving}>Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}