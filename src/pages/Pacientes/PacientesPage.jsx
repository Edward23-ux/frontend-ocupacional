import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiPlus, FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import Table from '../../components/common/Table.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Badge from '../../components/common/Badge.jsx'
import PacienteFormModal from '../../components/pacientes/PacienteFormModal.jsx'
import { usePacientes } from '../../hooks/usePacientes.js'
import { getDocumentosActivos } from '../../api/endpoints/documentosApi.js'
import { getRoles } from '../../api/endpoints/rolesApi.js'
import { ROUTES } from '../../utils/constants.js'

// 1. 👇 IMPORTA TU ENDPOINT DE EMPRESAS (Asegúrate de que el nombre del archivo y la función coincidan con tu proyecto)
import { getEmpresasActivas } from '../../api/endpoints/empresasApi.js'

const getPatientFullName = (patient) =>
    `${patient?.nombres ?? ''} ${patient?.apellidoPaterno ?? ''} ${patient?.apellidoMaterno ?? ''}`.trim()

export default function PacientesPage() {
  const navigate = useNavigate()
  const { pacientes, loading, fetchPacientes, createPaciente, updatePaciente } = usePacientes({ autoFetch: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [documentos, setDocumentos] = useState([])

  // 2. 👇 CREAMOS EL ESTADO PARA ALMACENAR LAS EMPRESAS
  const [empresas, setEmpresas] = useState([])

  useEffect(() => {
    fetchPacientes()

    // Carga de documentos
    getDocumentosActivos()
        .then((response) => setDocumentos(Array.isArray(response?.data) ? response.data : []))
        .catch(() => setDocumentos([]))

    // 3. 👇 TRAEMOS LAS EMPRESAS DE LA BASE DE DATOS AL CARGAR LA PÁGINA
    getEmpresasActivas()
        .then((response) => setEmpresas(Array.isArray(response?.data) ? response.data : []))
        .catch(() => setEmpresas([]))

  }, [fetchPacientes])

  const filteredPacientes = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()

    return pacientes.filter((patient) => {
      const fullName = getPatientFullName(patient).toLowerCase()
      const dni = (patient?.numeroDocumento ?? '').toLowerCase()
      return fullName.includes(normalizedSearch) || dni.includes(normalizedSearch)
    })
  }, [pacientes, searchTerm])

  const handleOpenCreate = () => {
    setEditingPatient(null)
    setOpenModal(true)
  }

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient)
    setOpenModal(true)
  }

  const handleSubmit = async (dto) => {
    setSaving(true)

    try {
      if (editingPatient?.id) {
        await updatePaciente(editingPatient.id, dto)
      } else {
        await createPaciente(dto)
      }
      setOpenModal(false)
      setEditingPatient(null)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      header: 'Nombre completo',
      accessor: (row) => getPatientFullName(row),
      render: (value, row) => (
          <div className="person-cell">
            <Avatar name={value} />
            <strong>{value || 'Sin nombre'}</strong>
          </div>
      ),
    },
    {
      header: 'Correo corporativo',
      accessor: 'correoCoorporativo',
      render: (value) => value ?? '-',
    },
    {
      header: 'Documento',
      accessor: (row) => row?.documento?.nombre ?? '-',
      render: (value) => <Badge status="default">{value}</Badge>,
    },
    { header: 'N° Doc', accessor: 'numeroDocumento' },
    { header: 'Teléfono', accessor: 'telefono' },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
          <div className="row-actions">
            <button type="button" className="icon-action" onClick={() => navigate(ROUTES.pacienteHistorial(row.id))} aria-label="Ver historial">
              <FiEye />
            </button>
            <button type="button" className="icon-action" onClick={() => handleOpenEdit(row)} aria-label="Editar">
              <FiEdit2 />
            </button>
          </div>
      ),
    },
  ]

  return (
      <main className="page-shell">
        <header className="page-toolbar">
          <div>
            <h1 className="page-title">Pacientes</h1>
          </div>
          <Button icon={<FiPlus />} onClick={handleOpenCreate}>Nuevo Paciente</Button>
        </header>

        <section className="filters-bar">
          <label className="field field--inline field--search">
            <span>Búsqueda</span>
            <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nombre, apellido o DNI"
            />
          </label>
        </section>

        <Table
            columns={columns}
            data={filteredPacientes}
            showSearch={false}
            pageSize={10}
            emptyMessage="No hay pacientes registrados."
        />

        <PacienteFormModal
            open={openModal}
            mode={editingPatient ? 'edit' : 'create'}
            patient={editingPatient}
            documentos={documentos}
            empresas={empresas} // 4. 👇 AHORA SÍ TIENE LA VARIABLE CORRECTAMENTE DECLARADA
            saving={saving}
            onClose={() => setOpenModal(false)}
            onSubmit={handleSubmit}
        />
      </main>
  )
}