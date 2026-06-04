import { api } from '../axiosConfig'

const PATH = '/turnos'

export const getTurnos = () => api.get(PATH)
export const getTurnoById = (id) => api.get(`${PATH}/${id}`)
export const getTurnosActivos = () => api.get(`${PATH}/activos`)
export const createTurno = (dto) => api.post(PATH, dto)
export const updateTurno = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteTurno = (id) => api.delete(`${PATH}/${id}`)