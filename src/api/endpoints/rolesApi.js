import { api } from '../axiosConfig'

const PATH = '/roles'

export const getRoles = () => api.get(PATH)
export const getRolById = (id) => api.get(`${PATH}/${id}`)
export const getRolesActivos = () => api.get(`${PATH}/activos`)
export const createRol = (dto) => api.post(PATH, dto)
export const updateRol = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteRol = (id) => api.delete(`${PATH}/${id}`)