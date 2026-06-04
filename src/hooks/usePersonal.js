import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createPersonal as createPersonalRequest,
  deletePersonal as deletePersonalRequest,
  getPersonal as getPersonalRequest,
  getPersonalById,
  updatePersonal as updatePersonalRequest,
} from '../api/endpoints/personalApi.js'

const getErrorMessage = (error, fallback) =>
  error?.message || error?.response?.data?.message || fallback

export function usePersonal({ autoFetch = true } = {}) {
  const [personales, setPersonales] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)

  const fetchPersonal = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPersonalRequest()
      const data = response?.data ?? []
      setPersonales(Array.isArray(data) ? data : [])
      return data
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, 'No se pudo cargar el personal médico.')
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPersonalById = useCallback(async (id) => {
    const response = await getPersonalById(id)
    return response?.data ?? null
  }, [])

  const createPersonal = useCallback(async (dto) => {
    try {
      const response = await createPersonalRequest(dto)
      toast.success('Personal creado correctamente')
      await fetchPersonal()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear el personal.')
      toast.error(message)
      throw createError
    }
  }, [fetchPersonal])

  const updatePersonal = useCallback(async (id, dto) => {
    try {
      const response = await updatePersonalRequest(id, dto)
      toast.success('Personal actualizado correctamente')
      await fetchPersonal()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar el personal.')
      toast.error(message)
      throw updateError
    }
  }, [fetchPersonal])

  const deletePersonal = useCallback(async (id) => {
    try {
      const response = await deletePersonalRequest(id)
      toast.success('Personal eliminado correctamente')
      await fetchPersonal()
      return response?.data ?? null
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'No se pudo eliminar el personal.')
      toast.error(message)
      throw deleteError
    }
  }, [fetchPersonal])

  useEffect(() => {
    if (autoFetch) {
      fetchPersonal()
    }
  }, [autoFetch, fetchPersonal])

  return useMemo(
    () => ({
      personales,
      loading,
      error,
      fetchPersonal,
      fetchPersonalById,
      createPersonal,
      updatePersonal,
      deletePersonal,
      setPersonales,
    }),
    [
      personales,
      loading,
      error,
      fetchPersonal,
      fetchPersonalById,
      createPersonal,
      updatePersonal,
      deletePersonal,
    ],
  )
}