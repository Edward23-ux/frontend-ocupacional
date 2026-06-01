import { useState } from 'react'
import { FiEye, FiEyeOff, FiHeart, FiLogIn, FiShield, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { APP_NAME, APP_TAGLINE, ROUTES, ROLES } from '../../utils/constants.js'

const redirectByRole = {
  [ROLES.MEDICO]: ROUTES.dashboard,
  [ROLES.BIOLOGO]: ROUTES.consultas,
  [ROLES.ENFERMERO]: ROUTES.consultas,
  [ROLES.PACIENTE]: ROUTES.misConsultas,
  [ROLES.CLIENTE]: ROUTES.empresaPortal,
}

const resolveRedirectPath = (role) =>
  redirectByRole[(role ?? '').toString().toUpperCase()] ?? ROUTES.dashboard

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [correoCorp, setCorreoCorp] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const session = await login(correoCorp.trim(), contrasena)
      toast.success('Sesión iniciada correctamente')
      navigate(resolveRedirectPath(session?.rol), { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Credenciales incorrectas')
    } finally {
      setSubmitting(false)
    }
  }

  const isBusy = loading || submitting

  return (
    <main className="login-page">
      <section className="login-page__visual">
        <div className="login-page__brand-mark">
          <span className="login-page__brand-icon">
            <FiShield />
          </span>
          <div>
            <p className="login-page__eyebrow">{APP_NAME}</p>
            <h1>{APP_TAGLINE}</h1>
          </div>
        </div>

        <p className="login-page__lead">
          Gestión de consultas, pacientes, empresas y personal de la clínica.
        </p>
      </section>

      <section className="login-page__panel">
        <div className="login-card">
          <div className="login-card__header">
            <span className="login-card__icon">
              <FiShield />
            </span>
            <div>
              <h2>Iniciar sesión</h2>
              <p>Accede con tu correo corporativo.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Correo</span>
              <input
                type="email"
                value={correoCorp}
                onChange={(event) => setCorreoCorp(event.target.value)}
                placeholder="usuario@tyf.com.pe"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Contraseña</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
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

            <Button type="submit" icon={<FiLogIn />} loading={isBusy} fullWidth>
              Iniciar sesión
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}