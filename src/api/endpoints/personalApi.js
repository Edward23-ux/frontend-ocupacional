import { api } from '../axiosConfig'

const PATH = '/personal'

export const getPersonal = () => api.get(PATH)
export const getPersonalById = (id) => api.get(`${PATH}/${id}`)
export const getPersonalActivos = () => api.get(`${PATH}/activos`)
export const getPersonalByEspecialidad = (especialidadId) =>
  api.get(`${PATH}/especialidad/${especialidadId}`)
export const createPersonal = (dto) => api.post(PATH, dto)
export const updatePersonal = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deletePersonal = (id) => api.delete(`${PATH}/${id}`)