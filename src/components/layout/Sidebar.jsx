import { NavLink } from 'react-router-dom'
import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiChevronRight,
  FiClipboard,
  FiFileText,
  FiHome,
  FiSettings,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth.js'
import { APP_NAME, APP_TAGLINE, ROLES, ROUTES } from '../../utils/constants.js'
import { normalizeRole } from '../../utils/roleGuard.js'

const navigationByRole = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: ROUTES.dashboard, icon: <FiHome /> },
    { label: 'Consultas', path: ROUTES.consultas, icon: <FiClipboard /> },
    { label: 'Pacientes', path: ROUTES.pacientes, icon: <FiUsers /> },
    { label: 'Personal', path: ROUTES.personal, icon: <FiUser /> },
    { label: 'Empresas', path: ROUTES.empresas, icon: <FiBriefcase /> },
    // { label: 'Protocolos', path: ROUTES.protocolos, icon: <FiFileText /> },
    { label: 'Configuración', path: ROUTES.configuracion, icon: <FiSettings /> },
  ],
  [ROLES.BIOLOGO]: [
    { label: 'Dashboard', path: ROUTES.dashboard, icon: <FiHome /> },
    { label: 'Consultas', path: ROUTES.consultas, icon: <FiClipboard /> },
    { label: 'Mi perfil', path: ROUTES.miPerfil, icon: <FiUser /> },
  ],
  [ROLES.ENFERMERO]: [
    { label: 'Dashboard', path: ROUTES.dashboard, icon: <FiHome /> },
    { label: 'Consultas', path: ROUTES.consultas, icon: <FiClipboard /> },
    { label: 'Mi perfil', path: ROUTES.miPerfil, icon: <FiUser /> },
  ],
  [ROLES.PACIENTE]: [
    { label: 'Mis consultas', path: ROUTES.misConsultas, icon: <FiClipboard /> },
    { label: 'Mis antecedentes', path: ROUTES.misAntecedentes, icon: <FiBookOpen /> },
    { label: 'Mi perfil', path: ROUTES.miPerfil, icon: <FiUser /> },
  ],
  [ROLES.CLIENTE]: [
    { label: 'Mi empresa', path: ROUTES.empresaPortal, icon: <FiBriefcase /> },
    { label: 'Dashboard', path: ROUTES.dashboard, icon: <FiBarChart2 /> },
    { label: 'Mi perfil', path: ROUTES.miPerfil, icon: <FiUser /> },
  ],
}

const defaultNavigation = navigationByRole[ROLES.ADMIN]

export default function Sidebar({ isOpen, onClose }) {
  const { rol } = useAuth()
  const roleKey = normalizeRole(rol)
  const items = navigationByRole[roleKey] ?? defaultNavigation

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <FiClipboard />
        </div>
        <div>
          <strong>{APP_NAME}</strong>
          <span>{APP_TAGLINE}</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegación principal">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span>{item.label}</span>
            <FiChevronRight className="sidebar__link-chevron" />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}