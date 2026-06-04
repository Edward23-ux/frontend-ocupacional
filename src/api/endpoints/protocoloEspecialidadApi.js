import { api } from '../axiosConfig'

const PATH = '/protocolo-especialidades'

export const getProtocoloEspecialidades = () => api.get(PATH)
export const getProtocoloEspecialidadById = (id) => api.get(`${PATH}/${id}`)
export const getProtocoloEspecialidadesActivas = () => api.get(`${PATH}/activos`)
export const getProtocoloEspecialidadesByProtocolo = (protocoloId) =>
  api.get(`${PATH}/protocolo/${protocoloId}`)
export const createProtocoloEspecialidad = (dto) => api.post(PATH, dto)
export const updateProtocoloEspecialidad = (id, dto) => api.put(`${PATH}/${id}`, dto)
export const deleteProtocoloEspecialidad = (id) => api.delete(`${PATH}/${id}`)