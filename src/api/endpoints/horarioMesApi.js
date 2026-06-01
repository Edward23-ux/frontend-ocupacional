import { api } from '../axiosConfig'

const PATH = '/horario-mes'

export const getHorarioMes = () => api.get(PATH)
export const getHorarioMesById = (id) => api.get(`${PATH}/${id}`)
export const getHorarioMesByPersonal = (personalId) => api.get(`${PATH}/personal/${personalId}`)
export const createHorarioMes = (dto) => api.post(PATH, dto)
export const updateHorarioMes = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteHorarioMes = (id) => api.delete(`${PATH}/${id}`)