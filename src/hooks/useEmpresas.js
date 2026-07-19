import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  createEmpresa as createEmpresaRequest,
  deleteEmpresa as deleteEmpresaRequest,
  getEmpresaById,
  getEmpresas as getEmpresasRequest,
  updateEmpresa as updateEmpresaRequest,
} from '../api/endpoints/empresasApi.js'

import { createUsuario } from '../api/endpoints/usuariosApi.js'
import { getRoles } from '../api/endpoints/rolesApi.js'

const ROLE_NAME = 'CLIENTE'

const getErrorMessage = (error, fallback) =>
    error?.message || error?.response?.data?.message || fallback


const resolveClientRoleId = async (cachedRoleId, setRoleId) => {
  if (cachedRoleId) {
    return cachedRoleId
  }

  const response = await getRoles()
  const roles = response?.data ?? []
  const clientRole = roles.find((role) => role?.nombre?.toUpperCase() === ROLE_NAME)

  if (clientRole?.id) {
    setRoleId(clientRole.id)
  }

  return clientRole?.id ?? null
}

export function useEmpresas({ autoFetch = true } = {}) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(Boolean(autoFetch))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [clientRoleId, setClientRoleId] = useState(null) // 👈 Estado para cachear el ID del rol cliente

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


  const createEmpresa = useCallback(async ({ empresaPayload, responsablePayload }) => {
    setSaving(true)
    try {
      let usuarioCargoId = responsablePayload?.id


      if (responsablePayload && !responsablePayload.yaExistente) {
        const roleId = await resolveClientRoleId(clientRoleId, setClientRoleId)

        if (!roleId) {
          throw new Error('No se encontró el rol CLIENTE en el sistema.')
        }

        const resUsuario = await createUsuario({
          nombres: responsablePayload.nombres,
          apellidoPaterno: responsablePayload.apellidoPaterno,
          apellidoMaterno: responsablePayload.apellidoMaterno,
          correoCoorporativo: responsablePayload.correoCoorporativo,
          contrasena: responsablePayload.contrasena,
          documentoId: Number(responsablePayload.documentoId),
          numeroDocumento: responsablePayload.numeroDocumento,
          telefono: responsablePayload.telefono,
          rolId: roleId // 👈 Asignamos dinámicamente el ID del rol CLIENTE
        })

        usuarioCargoId = resUsuario?.data?.id || resUsuario?.id
      }


      const finalEmpresaDto = {
        ...empresaPayload,
        usuarioCargoId: usuarioCargoId ? Number(usuarioCargoId) : null
      }


      const response = await createEmpresaRequest(finalEmpresaDto)
      toast.success('Empresa y encargado registrados correctamente')
      await fetchEmpresas()
      return response?.data ?? null
    } catch (createError) {
      const message = getErrorMessage(createError, 'No se pudo crear la empresa.')
      toast.error(message)
      throw createError
    } finally {
      setSaving(false)
    }
  }, [fetchEmpresas, clientRoleId])


  const updateEmpresa = useCallback(async (id, { empresaPayload, responsablePayload }) => {
    setSaving(true)
    try {
      let usuarioCargoId = responsablePayload?.id


      if (responsablePayload && !responsablePayload.yaExistente) {
        const roleId = await resolveClientRoleId(clientRoleId, setClientRoleId)

        if (!roleId) {
          throw new Error('No se encontró el rol CLIENTE en el sistema.')
        }

        const resUsuario = await createUsuario({
          nombres: responsablePayload.nombres,
          apellidoPaterno: responsablePayload.apellidoPaterno,
          apellidoMaterno: responsablePayload.apellidoMaterno,
          correoCoorporativo: responsablePayload.correoCoorporativo,
          contrasena: responsablePayload.contrasena,
          documentoId: Number(responsablePayload.documentoId),
          numeroDocumento: responsablePayload.numeroDocumento,
          telefono: responsablePayload.telefono,
          rolId: roleId
        })

        usuarioCargoId = resUsuario?.data?.id || resUsuario?.id
      }

      const finalEmpresaDto = {
        ...empresaPayload,
        usuarioCargoId: usuarioCargoId ? Number(usuarioCargoId) : null
      }

      const response = await updateEmpresaRequest(id, finalEmpresaDto)
      toast.success('Empresa actualizada correctamente')
      await fetchEmpresas()
      return response?.data ?? null
    } catch (updateError) {
      const message = getErrorMessage(updateError, 'No se pudo actualizar la empresa.')
      toast.error(message)
      throw updateError
    } finally {
      setSaving(false)
    }
  }, [fetchEmpresas, clientRoleId])

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
        saving,
        error,
        clientRoleId,
        fetchEmpresas,
        fetchEmpresaById,
        createEmpresa,
        updateEmpresa,
        deleteEmpresa,
        setEmpresas,
      }),
      [
        empresas,
        loading,
        saving,
        error,
        clientRoleId,
        fetchEmpresas,
        fetchEmpresaById,
        createEmpresa,
        updateEmpresa,
        deleteEmpresa,
      ],
  )
}