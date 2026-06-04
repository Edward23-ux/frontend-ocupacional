import { api } from '../axiosConfig'

const PATH = '/horarios'

export const getHorarios = () => api.get(PATH)
export const getHorarioById = (id) => api.get(`${PATH}/${id}`)
export const createHorario = (dto) => api.post(PATH, dto)
export const updateHorario = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteHorario = (id) => api.delete(`${PATH}/${id}`)