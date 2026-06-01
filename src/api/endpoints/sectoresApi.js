import { api } from '../axiosConfig'

const PATH = '/sectores'

export const getSectores = () => api.get(PATH)
export const getSectorById = (id) => api.get(`${PATH}/${id}`)
export const getSectoresActivos = () => api.get(`${PATH}/activos`)
export const createSector = (dto) => api.post(PATH, dto)
export const updateSector = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteSector = (id) => api.delete(`${PATH}/${id}`)