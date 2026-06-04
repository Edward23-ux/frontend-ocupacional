import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createConsulta as createConsultaRequest,
  deleteConsulta as deleteConsultaRequest,
  getConsultaById,
  getConsultas as getConsultasRequest,
  getConsultasByPaciente,
  updateConsulta as updateConsultaRequest,
} from '../api/endpoints/consultasApi.js'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export function useConsultas({ autoFetch = true } = {}) {
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)

  const fetchConsultas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getConsultasRequest()
      const data = response?.data ?? []
      setConsultas(Array.isArray(data) ? data : [])
      return data
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, 'No se pudieron cargar las consultas.')
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConsultaById = useCallback(async (id) => {
    const response = await getConsultaById(id)
    return response?.data ?? null
  }, [])

  const fetchConsultasByPaciente = useCallback(async (pacienteId) => {
    const response = await getConsultasByPaciente(pacienteId)
    return response?.data ?? []
  }, [])

  const createConsulta = useCallback(async (dto) => {
    try {
      const response = await createConsultaRequest(dto)
      toast.success('Consulta creada correctamente')
      await fetchConsultas()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear la consulta.')
      toast.error(message)
      throw createError
    }
  }, [fetchConsultas])

  const updateConsulta = useCallback(async (id, dto) => {
    try {
      const response = await updateConsultaRequest(id, dto)
      toast.success('Consulta actualizada correctamente')
      await fetchConsultas()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar la consulta.')
      toast.error(message)
      throw updateError
    }
  }, [fetchConsultas])

  const deleteConsulta = useCallback(async (id) => {
    try {
      const response = await deleteConsultaRequest(id)
      toast.success('Consulta eliminada correctamente')
      await fetchConsultas()
      return response?.data ?? null
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'No se pudo eliminar la consulta.')
      toast.error(message)
      throw deleteError
    }
  }, [fetchConsultas])

  useEffect(() => {
    if (autoFetch) {
      fetchConsultas()
    }
  }, [autoFetch, fetchConsultas])

  return useMemo(
    () => ({
      consultas,
      loading,
      error,
      fetchConsultas,
      fetchConsultaById,
      fetchConsultasByPaciente,
      createConsulta,
      updateConsulta,
      deleteConsulta,
      setConsultas,
    }),
    [
      consultas,
      loading,
      error,
      fetchConsultas,
      fetchConsultaById,
      fetchConsultasByPaciente,
      createConsulta,
      updateConsulta,
      deleteConsulta,
    ],
  )
}