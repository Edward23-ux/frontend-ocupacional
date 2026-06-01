import { api } from '../axiosConfig'

const PATH = '/protocolos'

export const getProtocolos = () => api.get(PATH)
export const getProtocoloById = (id) => api.get(`${PATH}/${id}`)
export const getProtocolosActivos = () => api.get(`${PATH}/activos`)
export const createProtocolo = (dto) => api.post(PATH, dto)
export const updateProtocolo = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteProtocolo = (id) => api.delete(`${PATH}/${id}`)