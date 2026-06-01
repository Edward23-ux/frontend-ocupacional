import { api } from '../axiosConfig'

const PATH = '/consultas'

export const getConsultas = () => api.get(PATH)
export const getConsultaById = (id) => api.get(`${PATH}/${id}`)
export const getConsultasByPaciente = (id) => api.get(`${PATH}/paciente/${id}`)
export const createConsulta = (dto) => api.post(PATH, dto)
export const updateConsulta = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteConsulta = (id) => api.delete(`${PATH}/${id}`)