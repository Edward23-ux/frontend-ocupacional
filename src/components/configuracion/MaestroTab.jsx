import { useEffect, useState } from 'react'
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Button from '../common/Button.jsx'
import Badge from '../common/Badge.jsx'
import Modal from '../common/Modal.jsx'
import ConfirmModal from '../common/ConfirmModal.jsx'
import Spinner from '../common/Spinner.jsx'
import {
  createRol, deleteRol, getRoles, updateRol,
} from '../../api/endpoints/rolesApi.js'
import {
  createSector, deleteSector, getSectores, updateSector,
} from '../../api/endpoints/sectoresApi.js'
import {
  createEspecialidad, deleteEspecialidad, getEspecialidades, updateEspecialidad,
} from '../../api/endpoints/especialidadesApi.js'
import {
  createDocumento, deleteDocumento, getDocumentos, updateDocumento,
} from '../../api/endpoints/documentosApi.js'
import {
  createContrato, deleteContrato, getContratos, updateContrato,
} from '../../api/endpoints/contratosApi.js'
import {
  createTurno, deleteTurno, getTurnos, updateTurno,
} from '../../api/endpoints/turnosApi.js'
import {
  createEstado, deleteEstado, getEstados, updateEstado,
} from '../../api/endpoints/estadosApi.js'
import {
  createHorario, deleteHorario, getHorarios, updateHorario,
} from '../../api/endpoints/horariosApi.js'
import { getTurnosActivos } from '../../api/endpoints/turnosApi.js'
import { getContratosActivos } from '../../api/endpoints/contratosApi.js'

const API_MAP = {
  roles: { list: getRoles, create: createRol, update: updateRol, remove: deleteRol },
  sectores: { list: getSectores, create: createSector, update: updateSector, remove: deleteSector },
  especialidades: { list: getEspecialidades, create: createEspecialidad, update: updateEspecialidad, remove: deleteEspecialidad },
  documentos: { list: getDocumentos, create: createDocumento, update: updateDocumento, remove: deleteDocumento },
  contratos: { list: getContratos, create: createContrato, update: updateContrato, remove: deleteContrato },
  turnos: { list: getTurnos, create: createTurno, update: updateTurno, remove: deleteTurno },
  estados: { list: getEstados, create: createEstado, update: updateEstado, remove: deleteEstado },
  horarios: { list: getHorarios, create: createHorario, update: updateHorario, remove: deleteHorario },
}

const simpleFields = [
  { nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
  { nombre: 'vigente', label: 'Vigente', tipo: 'switch', requerido: true },
]

const formatTime = (value) => (value ? String(value).slice(0, 5) : '')

const getErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback

export default function MaestroTab({ titulo, endpoint, campos = [] }) {
  const api = API_MAP[endpoint]
  const specialHorario = endpoint === 'horarios'
  const hasVigenteField = campos.some((field) => field.nombre === 'vigente')
  const fieldConfig = specialHorario
    ? campos
    : (campos.length ? (hasVigenteField ? campos : [...campos, simpleFields[1]]) : simpleFields)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createValues, setCreateValues] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editingValues, setEditingValues] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [options, setOptions] = useState({ turnos: [], contratos: [] })

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await api.list()
      setItems(Array.isArray(response?.data) ? response.data : [])
    } catch (error) {
      toast.error(getErrorMessage(error, `No se pudieron cargar ${titulo.toLowerCase()}.`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [endpoint])

  useEffect(() => {
    if (!specialHorario) return

    Promise.all([getTurnosActivos(), getContratosActivos()])
      .then(([turnosRes, contratosRes]) => {
        setOptions({
          turnos: Array.isArray(turnosRes?.data) ? turnosRes.data : [],
          contratos: Array.isArray(contratosRes?.data) ? contratosRes.data : [],
        })
      })
      .catch(() => setOptions({ turnos: [], contratos: [] }))
  }, [specialHorario])

  const buildCreateState = () => {
    if (specialHorario) {
      return { horaInicio: '', horarioFin: '', turnoId: '', contratoId: '' }
    }

    return fieldConfig.reduce((accumulator, field) => {
      accumulator[field.nombre] = field.tipo === 'switch' ? true : ''
      return accumulator
    }, {})
  }

  const beginCreate = () => {
    setCreateValues(buildCreateState())
    setCreateOpen(true)
  }

  const beginEdit = (item) => {
    if (specialHorario) {
      setEditingValues({
        horaInicio: formatTime(item?.horaInicio),
        horarioFin: formatTime(item?.horarioFin),
        turnoId: item?.turno?.id ?? '',
        contratoId: item?.contrato?.id ?? '',
      })
    } else {
      setEditingValues({
        nombre: item?.nombre ?? '',
        vigente: item?.vigente ?? true,
      })
    }

    setEditingId(item.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingValues({})
  }

  const buildPayload = (values) => {
    if (specialHorario) {
      return {
        horaInicio: values.horaInicio,
        horarioFin: values.horarioFin,
        turnoId: values.turnoId ? Number(values.turnoId) : null,
        contratoId: values.contratoId ? Number(values.contratoId) : null,
      }
    }

    return {
      nombre: values.nombre?.trim() ?? '',
      vigente: Boolean(values.vigente),
    }
  }

  const saveRecord = async (id, values, isCreate = false) => {
    setSaving(true)
    try {
      const payload = buildPayload(values)

      if (isCreate) {
        await api.create(payload)
        toast.success(`${titulo} creado correctamente`)
        setCreateOpen(false)
      } else {
        await api.update(id, payload)
        toast.success(`${titulo} actualizado correctamente`)
        cancelEdit()
      }

      await loadItems()
    } catch (error) {
      toast.error(getErrorMessage(error, `No se pudo guardar ${titulo.toLowerCase()}.`))
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async () => {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await api.remove(deleteTarget.id)
      toast.success(`${titulo} eliminado correctamente`)
      setDeleteTarget(null)
      await loadItems()
    } catch (error) {
      toast.error(getErrorMessage(error, `No se pudo eliminar ${titulo.toLowerCase()}.`))
    } finally {
      setSaving(false)
    }
  }

  const fieldInput = (field, value, onChange, inputProps = {}) => {
    if (field.tipo === 'switch') {
      return (
        <label className="toggle-row toggle-row--compact">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} {...inputProps} />
          <span>{value ? 'Activo' : 'Inactivo'}</span>
        </label>
      )
    }

    if (field.tipo === 'select') {
      const optionsList = field.nombre === 'turnoId' ? options.turnos : field.nombre === 'contratoId' ? options.contratos : field.opciones ?? []

      return (
        <select value={value} onChange={(event) => onChange(event.target.value)} {...inputProps}>
          <option value="">Seleccione...</option>
          {optionsList.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre}
            </option>
          ))}
        </select>
      )
    }

    return <input type={field.tipo || 'text'} value={value} onChange={(event) => onChange(event.target.value)} {...inputProps} />
  }

  const renderSimpleRow = (item) => {
    if (editingId === item.id) {
      return (
        <tr key={item.id} className="master-row master-row--editing">
          <td>{item.id}</td>
          <td>{fieldInput({ nombre: 'nombre', tipo: 'text' }, editingValues.nombre, (nextValue) => setEditingValues((current) => ({ ...current, nombre: nextValue })), {
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveRecord(item.id, editingValues)
              }
              if (event.key === 'Escape') {
                cancelEdit()
              }
            },
          })}</td>
          <td>{fieldInput({ nombre: 'vigente', tipo: 'switch' }, editingValues.vigente, (nextValue) => setEditingValues((current) => ({ ...current, vigente: nextValue })))}</td>
          <td>
            <div className="inline-actions">
              <button type="button" className="icon-action icon-action--success" onClick={() => saveRecord(item.id, editingValues)} aria-label="Guardar">
                <FiCheck />
              </button>
              <button type="button" className="icon-action icon-action--danger" onClick={cancelEdit} aria-label="Cancelar">
                <FiX />
              </button>
            </div>
          </td>
        </tr>
      )
    }

    return (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.nombre ?? '-'}</td>
        <td><Badge status={item?.vigente ? 'activo' : 'inactivo'}>{item?.vigente ? 'Activo' : 'Inactivo'}</Badge></td>
        <td>
          <div className="inline-actions">
            <button type="button" className="icon-action" onClick={() => beginEdit(item)} aria-label="Editar"><FiEdit2 /></button>
            <button type="button" className="icon-action icon-action--danger" onClick={() => setDeleteTarget(item)} aria-label="Eliminar"><FiTrash2 /></button>
          </div>
        </td>
      </tr>
    )
  }

  const renderHorarioRow = (item) => {
    if (editingId === item.id) {
      return (
        <tr key={item.id} className="master-row master-row--editing">
          <td>{item.id}</td>
          <td>{fieldInput({ nombre: 'horaInicio', tipo: 'time' }, editingValues.horaInicio, (nextValue) => setEditingValues((current) => ({ ...current, horaInicio: nextValue })), {
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveRecord(item.id, editingValues)
              }
              if (event.key === 'Escape') {
                cancelEdit()
              }
            },
          })}</td>
          <td>{fieldInput({ nombre: 'horarioFin', tipo: 'time' }, editingValues.horarioFin, (nextValue) => setEditingValues((current) => ({ ...current, horarioFin: nextValue })), {
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveRecord(item.id, editingValues)
              }
              if (event.key === 'Escape') {
                cancelEdit()
              }
            },
          })}</td>
          <td>{fieldInput({ nombre: 'turnoId', tipo: 'select' }, editingValues.turnoId, (nextValue) => setEditingValues((current) => ({ ...current, turnoId: nextValue })), {
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                cancelEdit()
              }
            },
          })}</td>
          <td>{fieldInput({ nombre: 'contratoId', tipo: 'select' }, editingValues.contratoId, (nextValue) => setEditingValues((current) => ({ ...current, contratoId: nextValue })), {
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                cancelEdit()
              }
            },
          })}</td>
          <td>
            <div className="inline-actions">
              <button type="button" className="icon-action icon-action--success" onClick={() => saveRecord(item.id, editingValues)} aria-label="Guardar"><FiCheck /></button>
              <button type="button" className="icon-action icon-action--danger" onClick={cancelEdit} aria-label="Cancelar"><FiX /></button>
            </div>
          </td>
        </tr>
      )
    }

    return (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{formatTime(item?.horaInicio)}</td>
        <td>{formatTime(item?.horarioFin)}</td>
        <td>{item?.turno?.nombre ?? '-'}</td>
        <td>{item?.contrato?.nombre ?? '-'}</td>
        <td>
          <div className="inline-actions">
            <button type="button" className="icon-action" onClick={() => beginEdit(item)} aria-label="Editar"><FiEdit2 /></button>
            <button type="button" className="icon-action icon-action--danger" onClick={() => setDeleteTarget(item)} aria-label="Eliminar"><FiTrash2 /></button>
          </div>
        </td>
      </tr>
    )
  }

  const renderCreateFields = () => fieldConfig.map((field) => (
    <label className="field" key={field.nombre}>
      <span>{field.label ?? field.nombre}</span>
      {fieldInput(field, createValues[field.nombre], (nextValue) => setCreateValues((current) => ({ ...current, [field.nombre]: nextValue }))) }
    </label>
  ))

  return (
    <section className="master-tab">
      <div className="section-heading">
        <div>
          <h2>{titulo}</h2>
          <p>Administración de tabla maestra.</p>
        </div>
        <Button icon={<FiPlus />} onClick={beginCreate}>Agregar</Button>
      </div>

      {loading ? <Spinner /> : null}

      <div className="table-shell">
        <div className="table-wrapper">
          <table className="table master-table">
            <thead>
              <tr>
                <th>ID</th>
                {specialHorario ? (
                  <>
                    <th>Hora inicio</th>
                    <th>Hora fin</th>
                    <th>Turno</th>
                    <th>Contrato</th>
                  </>
                ) : (
                  <>
                    <th>Nombre</th>
                    <th>Estado</th>
                  </>
                )}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (specialHorario ? renderHorarioRow(item) : renderSimpleRow(item)))}
              {!items.length ? (
                <tr>
                  <td colSpan={specialHorario ? 6 : 4} className="table__empty">
                    No hay {titulo.toLowerCase()} registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} title={`Agregar ${titulo}`} onClose={() => setCreateOpen(false)} footer={null}>
        <form className="stack-form" onSubmit={(event) => { event.preventDefault(); saveRecord(null, createValues, true) }}>
          {renderCreateFields()}
          <div className="form-actions">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={`Eliminar ${titulo}`}
        message={`¿Deseas eliminar este registro de ${titulo.toLowerCase()}?`}
        confirmLabel="Eliminar"
        loading={saving}
        onConfirm={deleteRecord}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}