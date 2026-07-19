import { useEffect, useMemo, useState } from 'react'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import Badge from '../common/Badge.jsx'
import Table from '../common/Table.jsx'
import { createHorarioMes, deleteHorarioMes, getHorarioMesByPersonal } from '../../api/endpoints/horarioMesApi.js'
import { getHorarios } from '../../api/endpoints/horariosApi.js'
import toast from 'react-hot-toast'

const getHorarioLabel = (horario) => {
  const turno = horario?.turno?.nombre ?? 'H'
  const inicio = horario?.horaInicio ?? '--:--'
  const fin = horario?.horarioFin ?? '--:--'
  return `${turno} · ${inicio} - ${fin}`
}

export default function HorarioModal({ open, personal, onClose }) {
  const [horarioMes, setHorarioMes] = useState([])
  const [availableHorarios, setAvailableHorarios] = useState([])
  const [selectedHorarioId, setSelectedHorarioId] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!personal?.id) {
      return
    }

    setLoading(true)

    try {
      const [assignedResponse, horariosResponse] = await Promise.all([
        getHorarioMesByPersonal(personal.id),
        getHorarios(),
      ])

      setHorarioMes(Array.isArray(assignedResponse?.data) ? assignedResponse.data : [])
      setAvailableHorarios(Array.isArray(horariosResponse?.data) ? horariosResponse.data : [])
    } catch (error) {
      toast.error(error?.message || 'No se pudieron cargar los horarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, personal?.id])

  const availableOptions = useMemo(() => {
    const assignedIds = new Set(horarioMes.map((item) => item?.horario?.id))
    return availableHorarios.filter((horario) => !assignedIds.has(horario.id))
  }, [availableHorarios, horarioMes])

  const handleAssign = async () => {
    if (!selectedHorarioId || !personal?.id) {
      return
    }

    try {
      await createHorarioMes({ horarioId: Number(selectedHorarioId), personalId: personal.id })
      toast.success('Horario asignado correctamente')
      setSelectedHorarioId('')
      await loadData()
    } catch (error) {
      toast.error(error?.message || 'No se pudo asignar el horario.')
    }
  }

  const handleRemove = async (id) => {
    try {
      await deleteHorarioMes(id)
      toast.success('Horario removido correctamente')
      await loadData()
    } catch (error) {
      toast.error(error?.message || 'No se pudo eliminar el horario.')
    }
  }

  const columns = [
    { header: 'Horario', accessor: (row) => getHorarioLabel(row?.horario) },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
        <Button variant="outline" onClick={() => handleRemove(row.id)}>
          Quitar
        </Button>
      ),
    },
  ]

  return (
    <Modal open={open} title={`Horarios de ${personal?.usuario?.nombres ?? 'personal'}`} onClose={onClose} footer={null}>
      <div className="stack-form">
        <div className="schedule-assignment">
          <label className="field">
            <span>Asignar horario</span>
            <select value={selectedHorarioId} onChange={(event) => setSelectedHorarioId(event.target.value)}>
              <option value="">Seleccione un horario</option>
              {availableOptions.map((horario) => (
                <option key={horario.id} value={horario.id}>
                  {getHorarioLabel(horario)}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={handleAssign} disabled={!selectedHorarioId}>
            Asignar horario
          </Button>
        </div>

        {loading ? (
          <p>Cargando horarios...</p>
        ) : (
          <Table
            columns={columns}
            data={horarioMes}
            showSearch={false}
            pageSize={5}
            emptyMessage="Este personal aún no tiene horarios asignados."
          />
        )}
      </div>
    </Modal>
  )
}