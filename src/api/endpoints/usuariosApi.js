import { api } from '../axiosConfig'

const PATH = '/usuarios'

export const getUsuarios = () => api.get(PATH)
export const getUsuarioById = (id) => api.get(`${PATH}/${id}`)
export const getUsuariosByRol = (rolId) => api.get(`${PATH}/rol/${rolId}`)
export const createUsuario = (dto) => api.post(PATH, dto)
export const updateUsuario = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteUsuario = (id) => api.delete(`${PATH}/${id}`)