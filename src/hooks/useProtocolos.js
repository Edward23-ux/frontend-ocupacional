import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createProtocolo as createProtocoloRequest,
  deleteProtocolo as deleteProtocoloRequest,
  getProtocoloById,
  getProtocolos as getProtocolosRequest,
  updateProtocolo as updateProtocoloRequest,
} from '../api/endpoints/protocolosApi.js'
import {
  createProtocoloEspecialidad,
  deleteProtocoloEspecialidad,
  getProtocoloEspecialidadesByProtocolo,
} from '../api/endpoints/protocoloEspecialidadApi.js'

const getErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback

export function useProtocolos({ autoFetch = true } = {}) {
  const [protocolos, setProtocolos] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [error, setError] = useState(null)

  const fetchProtocolos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getProtocolosRequest()
      const data = response?.data ?? []
      setProtocolos(Array.isArray(data) ? data : [])
      return data
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, 'No se pudieron cargar los protocolos.')
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProtocoloById = useCallback(async (id) => {
    const response = await getProtocoloById(id)
    return response?.data ?? null
  }, [])

  const fetchProtocolosEspecialidades = useCallback(async (protocoloId) => {
    const response = await getProtocoloEspecialidadesByProtocolo(protocoloId)
    return response?.data ?? []
  }, [])

  const createProtocolo = useCallback(async (dto) => {
    try {
      const response = await createProtocoloRequest(dto)
      toast.success('Protocolo creado correctamente')
      await fetchProtocolos()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear el protocolo.')
      toast.error(message)
      throw createError
    }
  }, [fetchProtocolos])

  const updateProtocolo = useCallback(async (id, dto) => {
    try {
      const response = await updateProtocoloRequest(id, dto)
      toast.success('Protocolo actualizado correctamente')
      await fetchProtocolos()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar el protocolo.')
      toast.error(message)
      throw updateError
    }
  }, [fetchProtocolos])

  const deleteProtocolo = useCallback(async (id) => {
    try {
      const response = await deleteProtocoloRequest(id)
      toast.success('Protocolo eliminado correctamente')
      await fetchProtocolos()
      return response?.data ?? null
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'No se pudo eliminar el protocolo.')
      toast.error(message)
      throw deleteError
    }
  }, [fetchProtocolos])

  const syncEspecialidades = useCallback(async (protocoloId, selectedSpecialtyIds = [], existingRelations = []) => {
    const existingBySpecialty = new Map(
      existingRelations.map((relation) => [String(relation?.especialidad?.id ?? relation?.especialidadId), relation]),
    )

    const selectedSet = new Set(selectedSpecialtyIds.map(String))

    const createOperations = selectedSpecialtyIds
      .filter((specialtyId) => !existingBySpecialty.has(String(specialtyId)))
      .map((especialidadId) => createProtocoloEspecialidad({ protocoloId, especialidadId: Number(especialidadId), vigente: true }))

    const deleteOperations = existingRelations
      .filter((relation) => !selectedSet.has(String(relation?.especialidad?.id ?? relation?.especialidadId)))
      .map((relation) => deleteProtocoloEspecialidad(relation.id))

    await Promise.all([...createOperations, ...deleteOperations])
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchProtocolos()
    }
  }, [autoFetch, fetchProtocolos])

  return useMemo(
    () => ({
      protocolos,
      loading,
      error,
      fetchProtocolos,
      fetchProtocoloById,
      fetchProtocolosEspecialidades,
      createProtocolo,
      updateProtocolo,
      deleteProtocolo,
      syncEspecialidades,
      setProtocolos,
    }),
    [
      protocolos,
      loading,
      error,
      fetchProtocolos,
      fetchProtocoloById,
      fetchProtocolosEspecialidades,
      createProtocolo,
      updateProtocolo,
      deleteProtocolo,
      syncEspecialidades,
    ],
  )
}