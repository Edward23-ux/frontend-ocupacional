import { useEffect, useMemo, useRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'

const filterLettersAndSpaces = (value) => value.replace(/[^a-zA-ZáéíóúñÑüÜ\s]/g, '')
const filterDigits = (value) => value.replace(/\D/g, '')

const getDocumentRule = (documentoNombre) => {
    const normalized = (documentoNombre ?? '').toString().toLowerCase()
    if (normalized === 'dni') return { min: 8, max: 8, label: '8 caracteres' }
    return { min: 1, max: 15, label: 'solo números' }
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

export default function EncargadoFormModal({ open, encargado, documentos = [], onClose, onAccept }) {
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const lastAutoEmailRef = useRef('')

    useEffect(() => {
        if (open) {
            setForm({
                nombres: encargado?.nombres ?? '',
                apellidoPaterno: encargado?.apellidoPaterno ?? '',
                apellidoMaterno: encargado?.apellidoMaterno ?? '',
                correoCoorporativo: encargado?.correoCoorporativo ?? encargado?.correoCorporativo ?? '',
                contrasena: '',
                documentoId: encargado?.documentoId ?? encargado?.documento?.id ?? '',
                numeroDocumento: encargado?.numeroDocumento ?? '',
                telefono: encargado?.telefono ?? '',
            })
            setErrors({})
        }
    }, [open, encargado])

    const selectedDocument = useMemo(
        () => documentos.find((doc) => String(doc.id) === String(form.documentoId)),
        [documentos, form.documentoId],
    )

    const documentRule = getDocumentRule(selectedDocument?.nombre)

    useEffect(() => {
        if (encargado?.yaExistente) return
        const firstName = form.nombres.trim().split(/\s+/)[0] || ''
        const firstInitial = form.apellidoPaterno.trim().charAt(0) || ''
        if (!firstName || !firstInitial) return

        const autoEmail = `${firstName}${firstInitial}`.toLowerCase().replace(/[^a-z]/g, '') + '@tyf.com.pe'
        if (form.correoCoorporativo === '' || form.correoCoorporativo === lastAutoEmailRef.current) {
            setForm(prev => ({ ...prev, correoCoorporativo: autoEmail }))
            lastAutoEmailRef.current = autoEmail
        }
    }, [form.nombres, form.apellidoPaterno, encargado])

    const handleDocumentNumberChange = (value) => {
        const filtered = filterDigits(value)
        setForm(prev => ({ ...prev, numeroDocumento: filtered.slice(0, documentRule.max) }))
    }

    const validate = () => {
        const nextErrors = {}
        if (!form.nombres.trim()) nextErrors.nombres = 'El nombre es obligatorio.'
        if (!form.apellidoPaterno.trim()) nextErrors.apellidoPaterno = 'El apellido paterno es obligatorio.'
        if (!form.correoCoorporativo.trim()) nextErrors.correoCoorporativo = 'El correo es obligatorio.'
        if (!form.documentoId) nextErrors.documentoId = 'El tipo de documento es obligatorio.'
        if (!form.numeroDocumento.trim()) nextErrors.numeroDocumento = 'El número de documento es obligatorio.'

        if (form.numeroDocumento && form.numeroDocumento.length !== documentRule.max) {
            nextErrors.numeroDocumento = `Debe tener exactamente ${documentRule.label}.`
        }
        if (!form.telefono.trim()) {
            nextErrors.telefono = 'El teléfono es obligatorio.'
        } else if (form.telefono.length !== 9) {
            nextErrors.telefono = 'Debe tener 9 dígitos.'
        }
        if (!encargado?.yaExistente && !form.contrasena.trim()) {
            nextErrors.contrasena = 'La contraseña es obligatoria.'
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const handleProcessAccept = (e) => {
        e.preventDefault()
        if (!validate()) return

        onAccept({
            ...form,
            id_rol: 5,
            rolId: 5, // Forzamos id de rol solicitado
        })
    }

    return (
        <Modal open={open} title="Datos del Encargado / Responsable" onClose={onClose} footer={null}>
            <form className="stack-form" onSubmit={handleProcessAccept}>
                <div className="form-grid form-grid--two">
                    <label className="field">
                        <span>Nombre</span>
                        <input value={form.nombres} onChange={(e) => setForm(p => ({ ...p, nombres: filterLettersAndSpaces(e.target.value) }))} />
                        {errors.nombres && <span className="field-error">{errors.nombres}</span>}
                    </label>

                    <label className="field">
                        <span>Apellido paterno</span>
                        <input value={form.apellidoPaterno} onChange={(e) => setForm(p => ({ ...p, apellidoPaterno: filterLettersAndSpaces(e.target.value) }))} />
                        {errors.apellidoPaterno && <span className="field-error">{errors.apellidoPaterno}</span>}
                    </label>

                    <label className="field">
                        <span>Apellido materno</span>
                        <input value={form.apellidoMaterno} onChange={(e) => setForm(p => ({ ...p, apellidoMaterno: filterLettersAndSpaces(e.target.value) }))} />
                    </label>

                    <label className="field">
                        <span>Correo corporativo</span>
                        <input type="email" value={form.correoCoorporativo} onChange={(e) => setForm(prev => ({ ...prev, correoCoorporativo: e.target.value }))} />
                        {errors.correoCoorporativo && <span className="field-error">{errors.correoCoorporativo}</span>}
                    </label>

                    {!encargado?.yaExistente && (
                        <label className="field">
                            <span>Contraseña</span>
                            <div className="password-field">
                                <input type={showPassword ? 'text' : 'password'} value={form.contrasena} onChange={(e) => setForm(prev => ({ ...prev, contrasena: e.target.value }))} placeholder="••••••••" />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.contrasena && <span className="field-error">{errors.contrasena}</span>}
                        </label>
                    )}

                    <label className="field">
                        <span>Tipo documento</span>
                        <select value={form.documentoId} onChange={(e) => setForm(prev => ({ ...prev, documentoId: e.target.value, numeroDocumento: '' }))}>
                            <option value="">Seleccione...</option>
                            {documentos.map((doc) => <option key={doc.id} value={doc.id}>{doc.nombre}</option>)}
                        </select>
                        {errors.documentoId && <span className="field-error">{errors.documentoId}</span>}
                    </label>

                    <label className="field">
                        <span>N° documento</span>
                        <input value={form.numeroDocumento} onChange={(e) => handleDocumentNumberChange(e.target.value)} maxLength={documentRule.max} inputMode="numeric" />
                        <small className="field-hint">{documentRule.label}</small>
                        {errors.numeroDocumento && <span className="field-error">{errors.numeroDocumento}</span>}
                    </label>

                    <label className="field">
                        <span>Teléfono</span>
                        <input value={form.telefono} onChange={(e) => setForm(p => ({ ...p, telefono: filterDigits(e.target.value).slice(0, 9) }))} maxLength={9} inputMode="numeric" />
                        {errors.telefono && <span className="field-error">{errors.telefono}</span>}
                    </label>
                </div>

                <div className="form-actions">
                    <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Aceptar</Button>
                </div>
            </form>
        </Modal>
    )
}