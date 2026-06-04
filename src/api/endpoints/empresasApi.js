import { api } from '../axiosConfig'

const PATH = '/empresas'

export const getEmpresas = () => api.get(PATH)
export const getEmpresaById = (id) => api.get(`${PATH}/${id}`)
export const getEmpresasActivas = () => api.get(`${PATH}/activos`)
export const createEmpresa = (dto) => api.post(PATH, dto)
export const updateEmpresa = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteEmpresa = (id) => api.delete(`${PATH}/${id}`)