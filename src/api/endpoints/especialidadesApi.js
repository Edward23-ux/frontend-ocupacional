import { api } from '../axiosConfig'

const PATH = '/especialidades'

export const getEspecialidades = () => api.get(PATH)
export const getEspecialidadById = (id) => api.get(`${PATH}/${id}`)
export const getEspecialidadesActivas = () => api.get(`${PATH}/activos`)
export const createEspecialidad = (dto) => api.post(PATH, dto)
export const updateEspecialidad = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteEspecialidad = (id) => api.delete(`${PATH}/${id}`)