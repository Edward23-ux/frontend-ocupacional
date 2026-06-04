import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../api/endpoints/authApi.js'
import { clearAuthSession } from '../api/axiosConfig.js'
import { AUTH_STORAGE_KEYS, ROLES } from '../utils/constants.js'

const AuthContext = createContext(null)

const readStoredSession = () => {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token)
  if (!token) return null

  const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user)
  const storedRole = localStorage.getItem(AUTH_STORAGE_KEYS.role)

  let usuario = null
  if (storedUser) {
    try {
      usuario = JSON.parse(storedUser)
    } catch {
      usuario = null
    }
  }

  return {
    token,
    usuario,
    rol: storedRole || usuario?.rol || null,
  }
}

const normalizeAuthResponse = (payload, correoCorp) => {
  const token = payload?.token ?? payload?.accessToken ?? payload?.jwt ?? ''

  // El backend retorna correoCoorporativo (doble o)
  const correoNormalizado =
    payload?.correoCoorporativo ??
    payload?.correoCorp ??
    correoCorp

  const rol = (
    payload?.rol ??
    payload?.role ??
    null
  )

  const nombreCompleto =
    payload?.nombreCompleto ??
    payload?.nombre ??
    correoNormalizado

  const usuario = {
    correoCorp: correoNormalizado,
    correoCoorporativo: correoNormalizado,
    nombreCompleto,
    rol,
  }

  return { token, usuario, rol }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const storedSession = readStoredSession()
    if (storedSession) {
      setToken(storedSession.token)
      setUsuario(storedSession.usuario)
      setRol(storedSession.rol)
    }
    setLoading(false)
  }, [])

  const persistSession = ({ nextToken, nextUsuario, nextRol }) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, nextToken)
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(nextUsuario))
    localStorage.setItem(AUTH_STORAGE_KEYS.role, nextRol ?? '')
  }

  const login = useCallback(async (correoCorp, contrasena) => {
    setLoading(true)
    try {
      // authApi.js se encarga de mapear a correoCoorporativo
      const response = await loginRequest({ correoCorp, contrasena })
      const payload = response?.data ?? response

      const normalized = normalizeAuthResponse(payload, correoCorp)

      if (!normalized.token) {
        throw new Error('La respuesta de autenticación no incluyó un token.')
      }

      persistSession({
        nextToken: normalized.token,
        nextUsuario: normalized.usuario,
        nextRol: normalized.rol,
      })

      setToken(normalized.token)
      setUsuario(normalized.usuario)
      setRol(normalized.rol)

      return normalized
    } catch (error) {
      // Propagar el error al LoginPage para mostrar el toast
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setToken(null)
    setUsuario(null)
    setRol(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      usuario,
      token,
      rol,
      isAuthenticated: Boolean(token),
      loading,
      isAdmin: (rol ?? '').toUpperCase() === ROLES.ADMIN,
      isMedico: (rol ?? '').toUpperCase() === ROLES.MEDICO,
      isBiologo: (rol ?? '').toUpperCase() === ROLES.BIOLOGO,
      isEnfermera: (rol ?? '').toUpperCase() === ROLES.ENFERMERA,
      isPaciente: (rol ?? '').toUpperCase() === ROLES.PACIENTE,
      isCliente: (rol ?? '').toUpperCase() === ROLES.CLIENTE,
      login,
      logout,
      setUsuario,
    }),
    [loading, rol, token, usuario, login, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }