import { ROLES } from './constants.js'

export const normalizeRole = (role) => (role ?? '').toString().trim().toUpperCase()

export const hasAllowedRole = (role, allowedRoles = []) => {
  if (!allowedRoles.length) {
    return true
  }

  const normalizedRole = normalizeRole(role)

  return allowedRoles.some(
    (allowedRole) => normalizeRole(allowedRole) === normalizedRole,
  )
}

export const canAccessMedicalRoutes = (role) => normalizeRole(role) === ROLES.MEDICO