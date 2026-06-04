import { api } from '../axiosConfig'

const PATH = '/documentos'

export const getDocumentos = () => api.get(PATH)
export const getDocumentoById = (id) => api.get(`${PATH}/${id}`)
export const getDocumentosActivos = () => api.get(`${PATH}/activos`)
export const createDocumento = (dto) => api.post(PATH, dto)
export const updateDocumento = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteDocumento = (id) => api.delete(`${PATH}/${id}`)