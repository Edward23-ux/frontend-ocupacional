import { api } from '../axiosConfig'

const PATH = '/contratos'

export const getContratos = () => api.get(PATH)
export const getContratoById = (id) => api.get(`${PATH}/${id}`)
export const getContratosActivos = () => api.get(`${PATH}/activos`)
export const createContrato = (dto) => api.post(PATH, dto)
export const updateContrato = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteContrato = (id) => api.delete(`${PATH}/${id}`)