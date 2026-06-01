import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  getUsuariosByRol,
  updateUsuario,
} from '../api/endpoints/usuariosApi.js'
import { getRoles } from '../api/endpoints/rolesApi.js'

const ROLE_NAME = 'PACIENTE'

const getErrorMessage = (error, fallback) =>
  error?.message || error?.response?.data?.message || fallback

const resolvePatientRoleId = async (cachedRoleId, setRoleId) => {
  if (cachedRoleId) {
    return cachedRoleId
  }

  const response = await getRoles()
  const roles = response?.data ?? []
  const patientRole = roles.find((role) => role?.nombre?.toUpperCase() === ROLE_NAME)

  if (patientRole?.id) {
    setRoleId(patientRole.id)
  }

  return patientRole?.id ?? null
}

export function usePacientes({ autoFetch = true } = {}) {
  const [pacientes, setPacientes] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)
  const [patientRoleId, setPatientRoleId] = useState(null)

  const fetchPacientes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const roleId = await resolvePatientRoleId(patientRoleId, setPatientRoleId)

      if (!roleId) {
        throw new Error('No se encontró el rol PACIENTE.')
      }

      const response = await getUsuariosByRol(roleId)
      const data = response?.data ?? []
      setPacientes(Array.isArray(data) ? data : [])
      return data
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, 'No se pudieron cargar los pacientes.')
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [patientRoleId])

  const fetchPacienteById = useCallback(async (id) => {
    const response = await getUsuarioById(id)
    return response?.data ?? null
  }, [])

  const createPaciente = useCallback(async (dto) => {
    try {
      const roleId = await resolvePatientRoleId(patientRoleId, setPatientRoleId)
      const response = await createUsuario({ ...dto, rolId: roleId })
      toast.success('Paciente creado correctamente')
      await fetchPacientes()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear el paciente.')
      toast.error(message)
      throw createError
    }
  }, [fetchPacientes, patientRoleId])

  const updatePaciente = useCallback(async (id, dto) => {
    try {
      const roleId = await resolvePatientRoleId(patientRoleId, setPatientRoleId)
      const response = await updateUsuario(id, { ...dto, rolId: roleId })
      toast.success('Paciente actualizado correctamente')
      await fetchPacientes()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar el paciente.')
      toast.error(message)
      throw updateError
    }
  }, [fetchPacientes, patientRoleId])

  const deletePaciente = useCallback(async (id) => {
    try {
      const response = await deleteUsuario(id)
      toast.success('Paciente eliminado correctamente')
      await fetchPacientes()
      return response?.data ?? null
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'No se pudo eliminar el paciente.')
      toast.error(message)
      throw deleteError
    }
  }, [fetchPacientes])

  useEffect(() => {
    if (autoFetch) {
      fetchPacientes()
    }
  }, [autoFetch, fetchPacientes])

  return useMemo(
    () => ({
      pacientes,
      loading,
      error,
      patientRoleId,
      fetchPacientes,
      fetchPacienteById,
      createPaciente,
      updatePaciente,
      deletePaciente,
      setPacientes,
    }),
    [
      pacientes,
      loading,
      error,
      patientRoleId,
      fetchPacientes,
      fetchPacienteById,
      createPaciente,
      updatePaciente,
      deletePaciente,
    ],
  )
}