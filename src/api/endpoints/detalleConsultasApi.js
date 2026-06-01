import { api } from '../axiosConfig'

const PATH = '/detalle-consultas'

export const getDetalleConsultas = () => api.get(PATH)
export const getDetalleConsultaById = (id) => api.get(`${PATH}/${id}`)
export const getDetalleConsultasByConsulta = (consultaId) =>
  api.get(`${PATH}/consulta/${consultaId}`)
export const createDetalleConsulta = (dto) => api.post(PATH, dto)
export const updateDetalleConsulta = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteDetalleConsulta = (id) => api.delete(`${PATH}/${id}`)