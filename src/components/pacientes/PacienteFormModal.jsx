import { useEffect, useMemo, useRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

// Filtra solo letras (incluye acentos y ñ) y espacios
const filterLettersAndSpaces = (value) => {
  return value.replace(/[^a-zA-ZáéíóúñÑüÜ\s]/g, '')
}

// Filtra solo dígitos
const filterDigits = (value) => {
  return value.replace(/\D/g, '')
}

// Reglas según tipo de documento (solo Dni y C. Ext)
const getDocumentRule = (documentoNombre) => {
  const normalized = (documentoNombre ?? '').toString().toLowerCase()

  if (normalized === 'dni') {
    return { min: 8, max: 8, label: '8 dígitos' }
  }

  if (normalized === 'c. ext' || normalized.includes('c. ext')) {
    return { min: 1, max: 10, label: 'hasta 10 dígitos' }
  }

  return { min: 1, max: 10, label: 'máximo 10 caracteres' }
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
  empresaId: '', // 👈 NUEVO CAMPO
}

export default function PacienteFormModal({
                                            open,
                                            mode = 'create',
                                            patient,
                                            documentos = [],
                                            empresas = [], // 👈 NUEVA PROPIEDAD RECIBIDA
                                            saving = false,
                                            onClose,
                                            onSubmit,
                                          }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Ref para recordar el último correo autogenerado
  const lastAutoEmailRef = useRef('')

  // Filtrar solo los tipos de documento permitidos: Dni y C. Ext
  const allowedDocumentos = useMemo(() => {
    return documentos.filter(doc => {
      const nombre = doc.nombre?.toLowerCase()
      return nombre === 'dni' || nombre === 'c. ext'
    })
  }, [documentos])

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
        empresaId: patient?.empresa?.id ?? '', // 👈 CARGA LA EMPRESA SI EXISTE AL EDITAR
      })
      setErrors({})
      lastAutoEmailRef.current = ''
    }
  }, [open, patient])

  const selectedDocument = useMemo(
      () => allowedDocumentos.find((documento) => String(documento.id) === String(form.documentoId)),
      [allowedDocumentos, form.documentoId],
  )

  const documentRule = getDocumentRule(selectedDocument?.nombre)

  // Generar correo automático
  const generateAutoEmail = (nombres, apellidoPaterno) => {
    const firstName = nombres.trim().split(/\s+/)[0] || ''
    const firstInitial = apellidoPaterno.trim().charAt(0) || ''
    if (!firstName || !firstInitial) return ''
    const base = (firstName + firstInitial).toLowerCase()
    const cleanBase = base.replace(/[^a-z]/g, '')
    return cleanBase ? `${cleanBase}@tyf.com.pe` : ''
  }

  useEffect(() => {
    if (mode !== 'create') return
    const autoEmail = generateAutoEmail(form.nombres, form.apellidoPaterno)
    if (!autoEmail) return
    const currentEmail = form.correoCoorporativo
    if (currentEmail === '' || currentEmail === lastAutoEmailRef.current) {
      setForm(prev => ({ ...prev, correoCoorporativo: autoEmail }))
      lastAutoEmailRef.current = autoEmail
    }
  }, [form.nombres, form.apellidoPaterno, mode])

  const handleNameChange = (field, value) => {
    const filtered = filterLettersAndSpaces(value)
    setForm(prev => ({ ...prev, [field]: filtered }))
  }

  const handleDocumentNumberChange = (value) => {
    const filtered = filterDigits(value)
    const maxLength = documentRule.max
    const truncated = filtered.slice(0, maxLength)
    setForm(prev => ({ ...prev, numeroDocumento: truncated }))
  }

  const handlePhoneChange = (value) => {
    const filtered = filterDigits(value).slice(0, 9)
    setForm(prev => ({ ...prev, telefono: filtered }))
  }

  const validate = () => {
    const nextErrors = {}
    const nameRegex = /^[a-zA-ZáéíóúñÑüÜ\s]+$/

    if (!form.nombres.trim()) {
      nextErrors.nombres = 'El nombre es obligatorio.'
    } else if (!nameRegex.test(form.nombres)) {
      nextErrors.nombres = 'El nombre solo puede contener letras y espacios.'
    }

    if (!form.apellidoPaterno.trim()) {
      nextErrors.apellidoPaterno = 'El apellido paterno es obligatorio.'
    } else if (!nameRegex.test(form.apellidoPaterno)) {
      nextErrors.apellidoPaterno = 'El apellido paterno solo puede contener letras y espacios.'
    }

    if (form.apellidoMaterno.trim() && !nameRegex.test(form.apellidoMaterno)) {
      nextErrors.apellidoMaterno = 'El apellido materno solo puede contener letras y espacios.'
    }

    if (!form.correoCoorporativo.trim()) {
      nextErrors.correoCoorporativo = 'El correo es obligatorio.'
    } else if (!form.correoCoorporativo.includes('@')) {
      nextErrors.correoCoorporativo = 'Ingrese un correo válido.'
    }

    if (!form.documentoId) {
      nextErrors.documentoId = 'El tipo de documento es obligatorio.'
    }

    if (!form.numeroDocumento.trim()) {
      nextErrors.numeroDocumento = 'El número de documento es obligatorio.'
    } else {
      const docLength = form.numeroDocumento.trim().length
      if (docLength < documentRule.min || docLength > documentRule.max) {
        nextErrors.numeroDocumento = `El documento debe tener ${documentRule.label}.`
      }
    }

    if (!form.telefono.trim()) {
      nextErrors.telefono = 'El teléfono es obligatorio.'
    } else if (form.telefono.length !== 9) {
      nextErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos.'
    }

    if (mode === 'create' && !form.contrasena.trim()) {
      nextErrors.contrasena = 'La contraseña es obligatoria.'
    }

    // 👈 VALIDACIÓN DE LA EMPRESA
    if (!form.empresaId) {
      nextErrors.empresaId = 'La empresa de procedencia es obligatoria.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    await onSubmit({
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      correoCoorporativo: form.correoCoorporativo.trim(),
      contrasena: mode === 'create' ? form.contrasena : undefined,
      documentoId: Number(form.documentoId),
      numeroDocumento: form.numeroDocumento.trim(),
      telefono: form.telefono.trim(),
      empresaId: form.empresaId ? Number(form.empresaId) : null, // 👈 ENVÍA EL ID DE LA EMPRESA AL BACKEND
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
              <input
                  value={form.nombres}
                  onChange={(e) => handleNameChange('nombres', e.target.value)}
              />
              {errors.nombres && <span className="field-error">{errors.nombres}</span>}
            </label>

            <label className="field">
              <span>Apellido paterno *</span>
              <input
                  value={form.apellidoPaterno}
                  onChange={(e) => handleNameChange('apellidoPaterno', e.target.value)}
              />
              {errors.apellidoPaterno && <span className="field-error">{errors.apellidoPaterno}</span>}
            </label>

            <label className="field">
              <span>Apellido materno</span>
              <input
                  value={form.apellidoMaterno}
                  onChange={(e) => handleNameChange('apellidoMaterno', e.target.value)}
              />
              {errors.apellidoMaterno && <span className="field-error">{errors.apellidoMaterno}</span>}
            </label>

            <label className="field">
              <span>Correo corporativo *</span>
              <input
                  type="email"
                  value={form.correoCoorporativo}
                  onChange={(e) => setForm(prev => ({ ...prev, correoCoorporativo: e.target.value }))}
              />
              {errors.correoCoorporativo && <span className="field-error">{errors.correoCoorporativo}</span>}
            </label>

            {mode === 'create' && (
                <label className="field">
                  <span>Contraseña *</span>
                  <div className="password-field">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.contrasena}
                        onChange={(e) => setForm(prev => ({ ...prev, contrasena: e.target.value }))}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.contrasena && <span className="field-error">{errors.contrasena}</span>}
                </label>
            )}

            <label className="field">
              <span>Tipo documento *</span>
              <select
                  value={form.documentoId}
                  onChange={(e) => setForm(prev => ({ ...prev, documentoId: e.target.value, numeroDocumento: '' }))}
              >
                <option value="">Seleccione...</option>
                {allowedDocumentos.map((documento) => (
                    <option key={documento.id} value={documento.id}>
                      {documento.nombre}
                    </option>
                ))}
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
                  style={{ width: '100%' }}
              />
              <small className="field-hint">{documentRule.label}</small>
              {errors.numeroDocumento && <span className="field-error">{errors.numeroDocumento}</span>}
            </label>

            <label className="field">
              <span>Teléfono *</span>
              <input
                  value={form.telefono}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={9}
                  inputMode="numeric"
                  style={{ width: '100%' }}
              />
              <small className="field-hint">9 dígitos</small>
              {errors.telefono && <span className="field-error">{errors.telefono}</span>}
            </label>

            {/* 👇 NUEVO ELEMENTO SELECT DE EMPRESAS */}
            <label className="field" style={{ gridColumn: 'span 2' }}>
              <span>Empresa de Procedencia *</span>
              <select
                  value={form.empresaId}
                  onChange={(e) => setForm(prev => ({ ...prev, empresaId: e.target.value }))}
              >
                <option value="">Seleccione la empresa...</option>
                {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.razonSocial ? `- ${emp.razonSocial}` : ''}
                    </option>
                ))}
              </select>
              {errors.empresaId && <span className="field-error">{errors.empresaId}</span>}
            </label>
          </div>

          <div className="form-actions">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
  )
}