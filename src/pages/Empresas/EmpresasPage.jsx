import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiEdit2, FiPlus } from 'react-icons/fi'
import Button from '../../components/common/Button.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import EmpresaFormModal from '../../components/empresas/EmpresaFormModal.jsx'
import { useEmpresas } from '../../hooks/useEmpresas.js'
import { getDocumentosActivos } from '../../api/endpoints/documentosApi.js'
import { getSectoresActivos } from '../../api/endpoints/sectoresApi.js'
import { getUsuariosByRol } from '../../api/endpoints/usuariosApi.js'
import { getRoles } from '../../api/endpoints/rolesApi.js'
import { ROUTES } from '../../utils/constants.js'
import { useNavigate } from 'react-router-dom'

const getCompanyName = (empresa) => empresa?.nombre ?? '-'

export default function EmpresasPage() {
  const navigate = useNavigate()
  const { empresas, loading, fetchEmpresas, createEmpresa, updateEmpresa } = useEmpresas({ autoFetch: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [sectorFilter, setSectorFilter] = useState('TODOS')
  const [openModal, setOpenModal] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState(null)
  const [saving, setSaving] = useState(false)
  const [documentos, setDocumentos] = useState([])
  const [sectores, setSectores] = useState([])
  const [responsables, setResponsables] = useState([])
  const [protocolosSector, setProtocolosSector] = useState([])

  useEffect(() => {
    fetchEmpresas()
    Promise.all([getDocumentosActivos(), getSectoresActivos(), getRoles()])
      .then(async ([docsRes, sectoresRes, rolesRes]) => {
        setDocumentos(Array.isArray(docsRes?.data) ? docsRes.data : [])
        setSectores(Array.isArray(sectoresRes?.data) ? sectoresRes.data : [])
        const roles = rolesRes?.data ?? []
        const clienteRole = roles.find((role) => role?.nombre?.toUpperCase() === 'CLIENTE')
        if (clienteRole?.id) {
          const usersRes = await getUsuariosByRol(clienteRole.id)
          setResponsables(Array.isArray(usersRes?.data) ? usersRes.data : [])
        }
      })
      .catch(() => {
        setDocumentos([])
        setSectores([])
        setResponsables([])
      })
  }, [fetchEmpresas])

  const filteredEmpresas = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    return empresas.filter((empresa) => {
      const matchesSearch = getCompanyName(empresa).toLowerCase().includes(normalizedSearch) || (empresa?.numeroDocumento ?? '').toLowerCase().includes(normalizedSearch)
      const matchesSector = sectorFilter === 'TODOS' || String(empresa?.sector?.id) === String(sectorFilter)
      return matchesSearch && matchesSector
    })
  }, [empresas, searchTerm, sectorFilter])

  const handleOpenEdit = (empresa) => {
    setEditingEmpresa(empresa)
    setOpenModal(true)
  }

  const handleFilterProtocols = async (sectorId) => {
    setSectorFilter(String(sectorId))
    navigate(`${ROUTES.protocolos}?sector=${sectorId}`)
  }

  const handleSubmit = async (dto) => {
    setSaving(true)
    try {
      if (editingEmpresa?.id) {
        await updateEmpresa(editingEmpresa.id, dto)
      } else {
        await createEmpresa(dto)
      }
      setOpenModal(false)
      setEditingEmpresa(null)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      header: 'Empresa',
      accessor: (row) => getCompanyName(row),
      render: (value, row) => (
        <div className="person-cell">
          <Avatar name={value} />
          <strong>{value}</strong>
        </div>
      ),
    },
    { header: 'Razón Social', accessor: 'razonSocial' },
    { header: 'RUC', accessor: 'numeroDocumento' },
    {
      header: 'Sector',
      accessor: (row) => row?.sector?.nombre ?? '-',
      render: (value) => <Badge status="warning">{value}</Badge>,
    },
    { header: 'Responsable', accessor: (row) => `${row?.usuarioCargo?.nombres ?? ''} ${row?.usuarioCargo?.apellidoPaterno ?? ''}`.trim() || '-' },
    {
      header: 'Estado',
      accessor: (row) => (row?.vigente ? 'Activo' : 'Inactivo'),
      render: (value) => <Badge status={value}>{value}</Badge>,
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (_, row) => (
        <div className="row-actions">
          <button type="button" className="icon-action" onClick={() => handleFilterProtocols(row?.sector?.id)} aria-label="Ver protocolos asociados">
            <FiEye />
          </button>
          <button type="button" className="icon-action" onClick={() => handleOpenEdit(row)} aria-label="Editar"><FiEdit2 /></button>
        </div>
      ),
    },
  ]

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Empresas</h1>
        </div>
        <Button icon={<FiPlus />} onClick={() => { setEditingEmpresa(null); setOpenModal(true); }}>Nueva Empresa</Button>
      </header>

      <section className="filters-bar">
        <label className="field field--inline field--search"><span>Búsqueda</span><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nombre o RUC" /></label>
        <label className="field field--inline field--select"><span>Sector</span><select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}><option value="TODOS">Todos</option>{sectores.map((sector) => <option key={sector.id} value={sector.id}>{sector.nombre}</option>)}</select></label>
      </section>

      <Table columns={columns} data={filteredEmpresas} showSearch={false} pageSize={10} emptyMessage="No hay empresas registradas." />

      {protocolosSector.length ? (
        <section className="detail-card detail-card--full">
          <div className="section-heading"><div><h2>Protocolos asociados al sector</h2><p>Protocolos filtrados desde la empresa seleccionada.</p></div></div>
          <div className="history-list">
            {protocolosSector.map((item) => (
              <div className="history-list__item" key={item.protocolo.id}>
                <div>
                  <strong>{item.protocolo.nombre}</strong>
                  <span>{item.relations.length} especialidades asociadas</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <EmpresaFormModal
        open={openModal}
        empresa={editingEmpresa}
        documentos={documentos}
        sectores={sectores}
        responsables={responsables}
        saving={saving}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
      />
    </main>
  )
}