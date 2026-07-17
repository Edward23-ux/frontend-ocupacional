import axios from 'axios'
import { AUTH_STORAGE_KEYS } from '../utils/constants'

// Sanitiza la URL eliminando comillas accidentales, espacios y barras diagonales finales
let rawApiUrl = (import.meta.env.VITE_API_URL || '')
  .replace(/['"]/g, '') // Elimina comillas simples o dobles
  .trim();

if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}

// Remueve barras diagonales al final si existen
if (rawApiUrl) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '');
}

const BASE_URL = rawApiUrl
  ? `${rawApiUrl}/api/`
  : 'http://localhost:8080/api/';

console.log('--- API BASE URL ---', BASE_URL)

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
