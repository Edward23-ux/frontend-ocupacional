import { api } from '../axiosConfig'

const PATH = '/antecedentes'

export const getAntecedentes = () => api.get(PATH)
export const getAntecedenteById = (id) => api.get(`${PATH}/${id}`)
export const getAntecedentesByPaciente = (pacienteId) => api.get(`${PATH}/paciente/${pacienteId}`)
export const createAntecedente = (dto) => api.post(PATH, dto)
export const updateAntecedente = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteAntecedente = (id) => api.delete(`${PATH}/${id}`)