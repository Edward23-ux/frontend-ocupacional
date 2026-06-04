import { api } from '../axiosConfig'

const PATH = '/estados'

export const getEstados = () => api.get(PATH)
export const getEstadoById = (id) => api.get(`${PATH}/${id}`)
export const getEstadosActivos = () => api.get(`${PATH}/activos`)
export const createEstado = (dto) => api.post(PATH, dto)
export const updateEstado = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteEstado = (id) => api.delete(`${PATH}/${id}`)