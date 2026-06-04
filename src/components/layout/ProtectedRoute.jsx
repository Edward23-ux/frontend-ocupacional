import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../utils/constants.js'
import { hasAllowedRole } from '../../utils/roleGuard.js'

function StatusScreen({ title, description }) {
  return (
    <div className="screen-center">
      <div className="screen-message">
        <div className="screen-spinner" />
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}

function ForbiddenScreen() {
  return (
    <div className="screen-center">
      <div className="screen-message">
        <h1>403</h1>
        <p>No tienes permisos para acceder a este contenido.</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, rol } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <StatusScreen
        title="Cargando sesión"
        description="Estamos restaurando tu acceso seguro."
      />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (!hasAllowedRole(rol, allowedRoles)) {
    return <ForbiddenScreen />
  }

  return children ?? null
}