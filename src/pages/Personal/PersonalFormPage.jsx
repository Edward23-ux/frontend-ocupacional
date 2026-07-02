import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiEye, FiEyeOff, FiSave, FiUserPlus } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Badge from '../../components/common/Badge.jsx'
import Alert from '../../components/common/Alert.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { usePersonal } from '../../hooks/usePersonal.js'
import { getRoles } from '../../api/endpoints/rolesApi.js'
import { getUsuariosByRol, createUsuario } from '../../api/endpoints/usuariosApi.js'
import { getEspecialidadesActivas } from '../../api/endpoints/especialidadesApi.js'
import { getContratosActivos } from '../../api/endpoints/contratosApi.js'
import { getDocumentosActivos } from '../../api/endpoints/documentosApi.js'
import { ROUTES } from '../../utils/constants.js'

const emptyNewUser = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  correoCoorporativo: '',
  contrasena: '',
  rolId: '',
  documentoId: '',
  numeroDocumento: '',
  telefono: '',
}

const emptyPersonal = {
  usuarioId: '',
  especialidadId: '',
  numeroColegiatura: '',
  numeroEspecialidad: '',
  firmaDigital: '',
  inicioContrato: new Date().toISOString().slice(0, 10),
  finContrato: new Date().toISOString().slice(0, 10),
  vigente: true,
  contratoId: '',
}

const getFullName = (user) =>
  `${user?.nombres ?? ''} ${user?.apellidoPaterno ?? ''} ${user?.apellidoMaterno ?? ''}`.trim()

export default function PersonalFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { fetchPersonalById, createPersonal, updatePersonal } = usePersonal({ autoFetch: false })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modeUser, setModeUser] = useState('existing')
  const [medicalUsers, setMedicalUsers] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [contratos, setContratos] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [medicalRoleId, setMedicalRoleId] = useState(null)
  const [existingUserSearch, setExistingUserSearch] = useState('')
  const [personalId, setPersonalId] = useState(null)
  const [existingUserId, setExistingUserId] = useState('')
  const [personalForm, setPersonalForm] = useState(emptyPersonal)
  const [newUserForm, setNewUserForm] = useState(emptyNewUser)
  const [showPassword, setShowPassword] = useState(false)

  const loadData = async () => {
    setLoading(true)

    try {
      const [rolesResponse, especialidadesResponse, contratosResponse, documentosResponse] = await Promise.all([
        getRoles(),
        getEspecialidadesActivas(),
        getContratosActivos(),
        getDocumentosActivos(),
      ])

      const roles = rolesResponse?.data ?? []
      const adminRole = roles.find(
        (role) => role?.id === 1 || role?.nombre?.toUpperCase() === 'ADMIN',
      )
      setMedicalRoleId(adminRole?.id ?? null)

      if (adminRole?.id) {
        const usersResponse = await getUsuariosByRol(adminRole.id)
        setMedicalUsers(Array.isArray(usersResponse?.data) ? usersResponse.data : [])
      }

      setEspecialidades(Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [])
      setContratos(Array.isArray(contratosResponse?.data) ? contratosResponse.data : [])
      setDocumentos(Array.isArray(documentosResponse?.data) ? documentosResponse.data : [])

      if (isEditMode) {
        const personalResponse = await fetchPersonalById(id)
        const personalData = personalResponse ?? null

        if (personalData) {
          setPersonalId(personalData.id)
          setModeUser('existing')
          setExistingUserId(personalData?.usuario?.id ?? '')
          setPersonalForm({
            usuarioId: personalData?.usuario?.id ?? '',
            especialidadId: personalData?.especialidad?.id ?? '',
            numeroColegiatura: personalData?.numeroColegiatura ?? '',
            numeroEspecialidad: personalData?.numeroEspecialidad ?? '',
            firmaDigital: personalData?.firmaDigital ?? '',
            inicioContrato: personalData?.inicioContrato ?? new Date().toISOString().slice(0, 10),
            finContrato: personalData?.finContrato ?? new Date().toISOString().slice(0, 10),
            vigente: Boolean(personalData?.vigente),
            contratoId: personalData?.contratoId ?? personalData?.contrato?.id ?? '',
          })
        }
      }
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo cargar el formulario de personal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const filteredMedicalUsers = useMemo(() => {
    const normalizedSearch = existingUserSearch.toLowerCase().trim()
    return medicalUsers.filter((user) => getFullName(user).toLowerCase().includes(normalizedSearch) || (user?.correoCoorporativo ?? '').toLowerCase().includes(normalizedSearch))
  }, [medicalUsers, existingUserSearch])

  const selectedExistingUser = useMemo(
    () => medicalUsers.find((user) => String(user.id) === String(existingUserId)),
    [medicalUsers, existingUserId],
  )

  const selectedSpecialty = useMemo(
    () => especialidades.find((item) => String(item.id) === String(personalForm.especialidadId)),
    [especialidades, personalForm.especialidadId],
  )

  const selectedContract = useMemo(
    () => contratos.find((item) => String(item.id) === String(personalForm.contratoId)),
    [contratos, personalForm.contratoId],
  )

  const selectedDocument = useMemo(
    () => documentos.find((item) => String(item.id) === String(newUserForm.documentoId)),
    [documentos, newUserForm.documentoId],
  )

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      let usuarioId = personalForm.usuarioId

      if (!isEditMode && modeUser === 'new') {
        const userResponse = await createUsuario({
          ...newUserForm,
          rolId: Number(newUserForm.rolId),
          documentoId: Number(newUserForm.documentoId),
        })
        usuarioId = userResponse?.data?.id ?? userResponse?.id
      }

      const payload = {
        usuarioId: Number(usuarioId),
        especialidadId: Number(personalForm.especialidadId),
        numeroColegiatura: personalForm.numeroColegiatura,
        numeroEspecialidad: personalForm.numeroEspecialidad || null,
        firmaDigital: personalForm.firmaDigital,
        inicioContrato: personalForm.inicioContrato,
        finContrato: personalForm.finContrato,
        vigente: Boolean(personalForm.vigente),
        contratoId: Number(personalForm.contratoId),
      }

      if (isEditMode) {
        await updatePersonal(id, payload)
      } else {
        await createPersonal(payload)
      }

      toast.success(`Personal ${isEditMode ? 'actualizado' : 'creado'} correctamente`)
      navigate(ROUTES.personal)
    } catch (requestError) {
      toast.error(requestError?.message || 'No se pudo guardar el personal.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="section-loader"><Spinner /></div>
  }

  if (error) {
    return <div className="page-shell"><Alert type="error" title="Error">{error}</Alert></div>
  }

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <span className="page-eyebrow">Personal médico</span>
          <h1 className="page-title">{isEditMode ? 'Editar Personal' : 'Nuevo Personal'}</h1>
        </div>
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.personal)}>Cancelar</Button>
      </header>

      <section className="form-card form-card--wide">
        <form className="stack-form" onSubmit={handleSave}>
          <div className="form-section">
            <div className="section-heading">
              <div>
                <h2>Datos del usuario vinculado</h2>
              </div>
              <div className="form-switch">
                <Button variant={modeUser === 'existing' ? 'primary' : 'outline'} type="button" onClick={() => setModeUser('existing')}>
                  Usuario existente
                </Button>
                <Button variant={modeUser === 'new' ? 'primary' : 'outline'} type="button" icon={<FiUserPlus />} onClick={() => setModeUser('new')} disabled={isEditMode}>
                  Crear nuevo usuario
                </Button>
              </div>
            </div>

            {modeUser === 'existing' ? (
              <div className="form-grid form-grid--two">
                <label className="field field--full">
                  <span>Usuario existente (buscar por correo)</span>
                  <input
                    type="search"
                    value={existingUserSearch}
                    onChange={(event) => setExistingUserSearch(event.target.value)}
                    placeholder="Buscar por correo o nombre"
                  />
                  <select value={existingUserId} onChange={(event) => { setExistingUserId(event.target.value); setPersonalForm((current) => ({ ...current, usuarioId: event.target.value })) }}>
                    <option value="">Seleccione un usuario</option>
                    {filteredMedicalUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getFullName(user)} - {user?.correoCoorporativo ?? '-'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="form-grid form-grid--two">
                <label className="field"><span>Nombre</span><input value={newUserForm.nombres} onChange={(event) => setNewUserForm((current) => ({ ...current, nombres: event.target.value }))} /></label>
                <label className="field"><span>Apellido paterno</span><input value={newUserForm.apellidoPaterno} onChange={(event) => setNewUserForm((current) => ({ ...current, apellidoPaterno: event.target.value }))} /></label>
                <label className="field"><span>Apellido materno</span><input value={newUserForm.apellidoMaterno} onChange={(event) => setNewUserForm((current) => ({ ...current, apellidoMaterno: event.target.value }))} /></label>
                <label className="field"><span>Correo</span><input type="email" value={newUserForm.correoCoorporativo} onChange={(event) => setNewUserForm((current) => ({ ...current, correoCoorporativo: event.target.value }))} /></label>
                <label className="field">
                  <span>Contraseña</span>
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUserForm.contrasena}
                      onChange={(event) => setNewUserForm((current) => ({ ...current, contrasena: event.target.value }))}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </label>
                <label className="field"><span>Rol</span><select value={newUserForm.rolId} onChange={(event) => setNewUserForm((current) => ({ ...current, rolId: event.target.value }))}><option value="">Seleccione...</option><option value="2">Biólogo</option><option value="3">Enfermera</option><option value="6">Médico</option><option value="7">Recepcionista</option></select></label>
                <label className="field"><span>Tipo documento</span><select value={newUserForm.documentoId} onChange={(event) => setNewUserForm((current) => ({ ...current, documentoId: event.target.value }))}><option value="">Seleccione...</option>{documentos.filter((doc) => doc.nombre === 'DNI' || doc.nombre === 'C. Ext').map((documento) => <option key={documento.id} value={documento.id}>{documento.nombre}</option>)}</select></label>
                <label className="field"><span>N° documento</span><input value={newUserForm.numeroDocumento} onChange={(event) => setNewUserForm((current) => ({ ...current, numeroDocumento: event.target.value }))} /></label>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="section-heading">
              <div>
                <h2>Datos profesionales</h2>
                <p>Especialidad, contrato y credenciales profesionales.</p>
              </div>
            </div>

            <div className="form-grid form-grid--two">
              <label className="field">
                <span>Especialidad</span>
                <select value={personalForm.especialidadId} onChange={(event) => setPersonalForm((current) => ({ ...current, especialidadId: event.target.value }))}>
                  <option value="">Seleccione...</option>
                  {especialidades.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Tipo contrato</span>
                <select value={personalForm.contratoId} onChange={(event) => setPersonalForm((current) => ({ ...current, contratoId: event.target.value }))}>
                  <option value="">Seleccione...</option>
                  {contratos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                </select>
              </label>

              <label className="field"><span>N° Colegiatura</span><input value={personalForm.numeroColegiatura} onChange={(event) => setPersonalForm((current) => ({ ...current, numeroColegiatura: event.target.value }))} /></label>
              <label className="field"><span>N° Especialidad</span><input value={personalForm.numeroEspecialidad} onChange={(event) => setPersonalForm((current) => ({ ...current, numeroEspecialidad: event.target.value }))} /></label>
              <label className="field"><span>Firma digital</span><input value={personalForm.firmaDigital} onChange={(event) => setPersonalForm((current) => ({ ...current, firmaDigital: event.target.value }))} /></label>
              <label className="field"><span>Estado</span><select value={String(personalForm.vigente)} onChange={(event) => setPersonalForm((current) => ({ ...current, vigente: event.target.value === 'true' }))}><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
              <label className="field"><span>Fecha inicio contrato</span><input type="date" value={personalForm.inicioContrato} onChange={(event) => setPersonalForm((current) => ({ ...current, inicioContrato: event.target.value }))} /></label>
              <label className="field"><span>Fecha fin contrato</span><input type="date" value={personalForm.finContrato} onChange={(event) => setPersonalForm((current) => ({ ...current, finContrato: event.target.value }))} /></label>
            </div>
          </div>

          <div className="preview-card">
            <span className="page-eyebrow">Vista previa</span>
            <div className="preview-card__header">
              <Avatar name={isEditMode ? getFullName(selectedExistingUser || {}) : getFullName(newUserForm)} size={56} />
              <div>
                <h3>{isEditMode ? getFullName(selectedExistingUser || {}) : getFullName(newUserForm) || 'Nuevo personal'}</h3>
                <p>{selectedExistingUser?.correoCoorporativo ?? newUserForm.correoCoorporativo ?? '-'}</p>
              </div>
            </div>
            <div className="preview-card__chips">
              <Badge status="teal">{selectedSpecialty?.nombre ?? 'Especialidad pendiente'}</Badge>
              <Badge status="indigo">{selectedContract?.nombre ?? 'Contrato pendiente'}</Badge>
            </div>
            <ul className="preview-list">
              <li>Colegiatura: {personalForm.numeroColegiatura || '-'}</li>
              <li>Inicio: {personalForm.inicioContrato || '-'}</li>
              <li>Fin: {personalForm.finContrato || '-'}</li>
              <li>Firma: {personalForm.firmaDigital || '-'}</li>
            </ul>
          </div>

          <div className="form-actions">
            <Button variant="outline" type="button" onClick={() => navigate(ROUTES.personal)} disabled={saving}>Cancelar</Button>
            <Button type="submit" icon={<FiSave />} loading={saving}>Guardar personal</Button>
          </div>
        </form>
      </section>
    </main>
  )
}