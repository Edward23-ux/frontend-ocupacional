import { api } from '../axiosConfig'

// Mapea correoCorp → correoCoorporativo (doble o, nombre real del backend)
export const login = ({ correoCorp, contrasena }) =>
  api.post('api/auth/login', {
    correoCoorporativo: correoCorp,
    contrasena,
  })

export const logout = () =>
  api.post('api/auth/logout').catch(() => null)
