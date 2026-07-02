import axios from 'axios'
import { AUTH_STORAGE_KEYS } from '../utils/constants'

const BASE_URL = 'http://18.191.216.54:8080/backend-staging/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(AUTH_STORAGE_KEYS.token)
  localStorage.removeItem(AUTH_STORAGE_KEYS.user)
  localStorage.removeItem(AUTH_STORAGE_KEYS.role)
}

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(AUTH_STORAGE_KEYS.token)
}

export const normalizeApiError = (error) => {
  const responseData = error?.response?.data ?? null
  const message =
    responseData?.message ??
    responseData?.error ??
    error?.message ??
    'No se pudo completar la solicitud.'

  return {
    message,
    status: error?.response?.status ?? 0,
    data: responseData,
    originalError: error,
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error)

    if (normalizedError.status === 401) {
      clearAuthSession()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(normalizedError)
  },
)

export default api
