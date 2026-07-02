export const APP_NAME = 'TyF - Calidad y Salud'

export const APP_TAGLINE = 'Clínica Ocupacional'

export const AUTH_STORAGE_KEYS = Object.freeze({
  token: 'sofsalud360.token',
  user: 'sofsalud360.user',
  role: 'sofsalud360.role',
})

export const ROLES = Object.freeze({
  MEDICO: 'MEDICO',
  BIOLOGO: 'BIOLOGO',
  ENFERMERO: 'ENFERMERO',
  PACIENTE: 'PACIENTE',
  CLIENTE: 'CLIENTE',
  ADMIN: 'ADMIN',
  RECEPCION: 'RECEPCION',
  ASISTENTE: 'ASISTENTE',
})

export const ENTITY_STATUS = Object.freeze({
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  PENDIENTE: 'PENDIENTE',
  CANCELADO: 'CANCELADO',
})

export const ROUTES = Object.freeze({
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  consultas: '/consultas',
  consultaDetalle: (id = ':id') => `/consultas/${id}`,
  consultaNueva: '/consultas/nueva',
  consultaEditar: (id = ':id') => `/consultas/${id}/editar`,
  pacientes: '/pacientes',
  pacienteHistorial: (id = ':id') => `/pacientes/${id}/historial`,
  personal: '/personal',
  personalNuevo: '/personal/nuevo',
  personalEditar: (id = ':id') => `/personal/${id}/editar`,
  empresas: '/empresas',
  misConsultas: '/mis-consultas',
  misAntecedentes: '/mis-antecedentes',
  miPerfil: '/mi-perfil',
  empresaPortal: '/empresa',
  configuracion: '/configuracion',
})

export const STATUS_VARIANTS = Object.freeze({
  ACTIVO: 'success',
  INACTIVO: 'danger',
  PENDIENTE: 'warning',
  CANCELADO: 'danger',
})