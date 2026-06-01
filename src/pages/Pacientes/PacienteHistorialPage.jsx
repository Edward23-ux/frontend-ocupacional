import { useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiPlus, FiEye } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Badge from '../../components/common/Badge.jsx'
import Modal from '../../components/common/Modal.jsx'
import Alert from '../../components/common/Alert.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Table from '../../components/common/Table.jsx'
import { getUsuarioById } from '../../api/endpoints/usuariosApi.js'
import { getAntecedentesByPaciente, createAntecedente } from '../../api/endpoints/antecedentesApi.js'
import { getConsultasByPaciente } from '../../api/endpoints/consultasApi.js'
import { formatDate } from '../../utils/formatDate.js'
import { ROUTES } from '../../utils/constants.js'

const getFullName = (patient) =>
  `${patient?.nombres ?? ''} ${patient?.apellidoPaterno ?? ''} ${patient?.apellidoMaterno ?? ''}`.trim()

export default function PacienteHistorialPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [paciente, setPaciente] = useState(null)
  const [antecedentes, setAntecedentes] = useState([])
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openAntecedenteModal, setOpenAntecedenteModal] = useState(false)
  const [savingAntecedente, setSavingAntecedente] = useState(false)
  const [antecedenteForm, setAntecedenteForm] = useState({ descripcion: '', fechaRegistro: new Date().toISOString().slice(0, 10) })

  const loadHistory = async () => {
    setLoading(true)

    try {
      const [patientResponse, antecedentesResponse, consultasResponse] = await Promise.all([
        getUsuarioById(id),
        getAntecedentesByPaciente(id),
        getConsultasByPaciente(id),
      ])

      setPaciente(patientResponse?.data ?? null)
      setAntecedentes(Array.isArray(antecedentesResponse?.data) ? antecedentesResponse.data : [])
      setConsultas(Array.isArray(consultasResponse?.data) ? consultasResponse.data : [])
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo cargar el historial clínico.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [id])

  const consultasColumns = useMemo(
    () => [
      { header: 'Fecha', accessor: (row) => formatDate(row?.fechaConsulta) },
      { header: 'Protocolo', accessor: (row) => row?.protocolo?.nombre ?? '-' },
      {
        header: 'Estado',
        accessor: (row) => row?.estado?.nombre ?? '-',
        render: (value) => <Badge status={value}>{value}</Badge>,
      },
      {
        header: 'Acción',
        accessor: 'id',
        render: (_, row) => (
          <button type="button" className="text-link" onClick={() => navigate(ROUTES.consultaDetalle(row.id))}>
            <FiEye /> Ver
          </button>
        ),
      },
    ],
    [navigate],
  )

  const handleAddAntecedente = async (event) => {
    event.preventDefault()
    setSavingAntecedente(true)

    try {
      await createAntecedente({
        pacienteId: Number(id),
        descripcion: antecedenteForm.descripcion,
        fechaRegistro: antecedenteForm.fechaRegistro,
      })
      toast.success('Antecedente agregado correctamente')
      setOpenAntecedenteModal(false)
      setAntecedenteForm({ descripcion: '', fechaRegistro: new Date().toISOString().slice(0, 10) })
      await loadHistory()
    } catch (requestError) {
      toast.error(requestError?.message || 'No se pudo agregar el antecedente.')
    } finally {
      setSavingAntecedente(false)
    }
  }

  if (loading) {
    return (
      <div className="section-loader">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className="page-shell"><Alert type="error" title="Error">{error}</Alert></div>
  }

  return (
    <main className="page-shell">
      <header className="history-header">
        <Button variant="outline" icon={<FiArrowLeft />} onClick={() => navigate(ROUTES.pacientes)}>
          Volver
        </Button>
        <div className="history-header__title">
          <Avatar name={getFullName(paciente)} size={56} />
          <div>
            <span className="page-eyebrow">Historial clínico</span>
            <h1 className="page-title">{getFullName(paciente)}</h1>
          </div>
        </div>
      </header>

      <section className="history-grid">
        <article className="detail-card">
          <div className="section-heading">
            <div>
              <h2>Datos personales</h2>
              <p>Información básica del paciente.</p>
            </div>
          </div>
          <p><strong>DNI:</strong> {paciente?.numeroDocumento ?? '-'}</p>
          <p><strong>Tel:</strong> {paciente?.telefono ?? '-'}</p>
          <p><strong>Correo:</strong> {paciente?.correoCoorporativo ?? '-'}</p>
        </article>

        <article className="detail-card">
          <div className="section-heading">
            <div>
              <h2>Antecedentes</h2>
              <p>Antecedentes clínicos asociados al paciente.</p>
            </div>
            <Button icon={<FiPlus />} onClick={() => setOpenAntecedenteModal(true)}>
              Agregar antecedente
            </Button>
          </div>

          <div className="history-list">
            {antecedentes.length ? antecedentes.map((antecedente) => (
              <div className="history-list__item" key={antecedente.id}>
                <div>
                  <strong>{antecedente.descripcion || 'Sin descripción'}</strong>
                  <span>{formatDate(antecedente.fechaRegistro)}</span>
                </div>
              </div>
            )) : <p>No hay antecedentes registrados.</p>}
          </div>
        </article>
      </section>

      <section className="detail-card detail-card--full">
        <div className="section-heading">
          <div>
            <h2>Consultas anteriores</h2>
            <p>Historial de atenciones registradas para este paciente.</p>
          </div>
        </div>

        <Table
          columns={consultasColumns}
          data={consultas}
          showSearch={false}
          pageSize={10}
          emptyMessage="No hay consultas anteriores."
        />
      </section>

      <Modal
        open={openAntecedenteModal}
        title="Agregar antecedente"
        onClose={() => setOpenAntecedenteModal(false)}
        footer={null}
      >
        <form className="stack-form" onSubmit={handleAddAntecedente}>
          <label className="field">
            <span>Descripción</span>
            <textarea rows="4" value={antecedenteForm.descripcion} onChange={(event) => setAntecedenteForm((current) => ({ ...current, descripcion: event.target.value }))} />
          </label>
          <label className="field">
            <span>Fecha de registro</span>
            <input type="date" value={antecedenteForm.fechaRegistro} onChange={(event) => setAntecedenteForm((current) => ({ ...current, fechaRegistro: event.target.value }))} />
          </label>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setOpenAntecedenteModal(false)} disabled={savingAntecedente}>Cancelar</Button>
            <Button type="submit" loading={savingAntecedente}>Guardar antecedente</Button>
          </div>
        </form>
      </Modal>
    </main>
  )
}