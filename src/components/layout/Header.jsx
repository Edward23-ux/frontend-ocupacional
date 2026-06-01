import { FiMenu, FiLogOut } from 'react-icons/fi'
import Button from '../common/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TY'

export default function Header({ onMenuToggle }) {
  const { usuario, rol, logout } = useAuth()
  const nombre = usuario?.nombreCompleto ?? usuario?.nombre ?? usuario?.correoCorp ?? 'Usuario'

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-button"
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menú"
        >
          <FiMenu />
        </button>
        <div>
          <p className="topbar__eyebrow">Panel clínico</p>
          <h1 className="topbar__title">Bienvenido, {nombre}</h1>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__profile">
          <div className="topbar__avatar">{getInitials(nombre)}</div>
          <div>
            <strong>{nombre}</strong>
            <span>{rol ?? 'Sin rol'}</span>
          </div>
        </div>
        <Button variant="outline" icon={<FiLogOut />} onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}