import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createEmpresa as createEmpresaRequest,
  deleteEmpresa as deleteEmpresaRequest,
  getEmpresaById,
  getEmpresas as getEmpresasRequest,
  updateEmpresa as updateEmpresaRequest,
} from '../api/endpoints/empresasApi.js'

const getErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback

export function useEmpresas({ autoFetch = true } = {}) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getEmpresasRequest()
      const data = response?.data ?? []
      setEmpresas(Array.isArray(data) ? data : [])
      return data
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, 'No se pudieron cargar las empresas.')
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmpresaById = useCallback(async (id) => {
    const response = await getEmpresaById(id)
    return response?.data ?? null
  }, [])

  const createEmpresa = useCallback(async (dto) => {
    try {
      const response = await createEmpresaRequest(dto)
      toast.success('Empresa creada correctamente')
      await fetchEmpresas()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear la empresa.')
      toast.error(message)
      throw createError
    }
  }, [fetchEmpresas])

  const updateEmpresa = useCallback(async (id, dto) => {
    try {
      const response = await updateEmpresaRequest(id, dto)
      toast.success('Empresa actualizada correctamente')
      await fetchEmpresas()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar la empresa.')
      toast.error(message)
      throw updateError
    }
  }, [fetchEmpresas])

  const deleteEmpresa = useCallback(async (id) => {
    try {
      const response = await deleteEmpresaRequest(id)
      toast.success('Empresa eliminada correctamente')
      await fetchEmpresas()
      return response?.data ?? null
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'No se pudo eliminar la empresa.')
      toast.error(message)
      throw deleteError
    }
  }, [fetchEmpresas])

  useEffect(() => {
    if (autoFetch) {
      fetchEmpresas()
    }
  }, [autoFetch, fetchEmpresas])

  return useMemo(
    () => ({
      empresas,
      loading,
      error,
      fetchEmpresas,
      fetchEmpresaById,
      createEmpresa,
      updateEmpresa,
      deleteEmpresa,
      setEmpresas,
    }),
    [empresas, loading, error, fetchEmpresas, fetchEmpresaById, createEmpresa, updateEmpresa, deleteEmpresa],
  )
}