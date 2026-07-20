import { useMemo, useState } from 'react'
import { FiActivity, FiBriefcase, FiClock, FiSearch, FiUserCheck, FiUsers } from 'react-icons/fi'
import Badge from '../../components/common/Badge.jsx'
import Table from '../../components/common/Table.jsx'
import StatCard from '../../components/dashboard/StatCard.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import { useConsultas } from '../../hooks/useConsultas.js'
import { usePacientes } from '../../hooks/usePacientes.js'
import { usePersonal } from '../../hooks/usePersonal.js'
import { useEmpresas } from '../../hooks/useEmpresas.js'
import { formatDateTimeShort } from '../../utils/formatDate.js'

const getPacienteName = (consulta) =>
  `${consulta?.paciente?.nombres ?? ''} ${consulta?.paciente?.apellidoPaterno ?? ''} ${consulta?.paciente?.apellidoMaterno ?? ''}`.trim() ||
  consulta?.paciente?.correoCoorporativo ||
  'Sin paciente'

const getMedicosNames = (consulta) => {
  const medicos = consulta?.detalleConsultas
    ?.map((dc) => {
      const u = dc?.medico?.usuario
      return `${u?.nombres ?? ''} ${u?.apellidoPaterno ?? ''}`.trim()
    })
    .filter(Boolean)
  return medicos && medicos.length > 0 ? medicos.join(', ') : 'Por asignar'
}

const consultaColumns = [
  {
    header: 'Turno',
    accessor: (row) => row?.turno?.nombre || 'General',
  },
  {
    header: 'Paciente',
    accessor: (row) => getPacienteName(row),
  },
  {
    header: 'Especialista',
    accessor: (row) => getMedicosNames(row),
  },
  {
    header: 'Estado',
    accessor: (row) => row?.estado?.nombre || 'Sin estado',
    render: (value) => <Badge status={(value ?? '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '')}>{value}</Badge>,
  },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { consultas, loading: loadingConsultas } = useConsultas()
  const { pacientes, loading: loadingPacientes } = usePacientes()
  const { personales, loading: loadingPersonal } = usePersonal()
  const { empresas, loading: loadingEmpresas } = useEmpresas()

  const isLoading = loadingConsultas || loadingPacientes || loadingPersonal || loadingEmpresas

  const todayStr = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const consultasHoyCount = useMemo(() => {
    return consultas.filter((c) => c?.fechaConsulta === todayStr).length
  }, [consultas, todayStr])

  const pacientesCount = pacientes.length

  const personalActivoCount = useMemo(() => {
    return personales.filter((p) => p.vigente).length
  }, [personales])

  const empresasActivasCount = useMemo(() => {
    return empresas.filter((e) => e.vigente).length
  }, [empresas])

  const stats = useMemo(() => [
    {
      label: 'Consultas hoy',
      value: consultasHoyCount,
      icon: <FiActivity />,
      accent: 'primary',
      helper: 'Atenciones registradas en el día',
    },
    {
      label: 'Pacientes registrados',
      value: pacientesCount,
      icon: <FiUsers />,
      accent: 'info',
      helper: 'Base de pacientes activa',
    },
    {
      label: 'Personal activo',
      value: personalActivoCount,
      icon: <FiUserCheck />,
      accent: 'success',
      helper: 'Profesionales de turno',
    },
    {
      label: 'Empresas activas',
      value: empresasActivasCount,
      icon: <FiBriefcase />,
      accent: 'warning',
      helper: 'Clientes con contratos vigentes',
    },
  ], [consultasHoyCount, pacientesCount, personalActivoCount, empresasActivasCount])

  const latestConsultas = useMemo(() => {
    const todayConsultas = consultas.filter((c) => c?.fechaConsulta === todayStr)
    if (todayConsultas.length > 0) {
      return todayConsultas.slice(0, 5)
    }
    return [...consultas].sort((a, b) => b.id - a.id).slice(0, 5)
  }, [consultas, todayStr])

  const filteredConsultas = useMemo(() => {
    if (!searchTerm.trim()) {
      return latestConsultas
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()

    return latestConsultas.filter((row) =>
      consultaColumns.some((column) => {
        const rawValue = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.accessor]
        return String(rawValue ?? '').toLowerCase().includes(normalizedSearch)
      }),
    )
  }, [latestConsultas, searchTerm])

  const activePersonal = useMemo(() => {
    return personales.filter((p) => p.vigente).slice(0, 5)
  }, [personales])

  if (isLoading) {
    return (
      <div className="section-loader">
        <Spinner />
      </div>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="page-hero">
        <h1 className="page-title">Dashboard</h1>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--wide">
          <div className="section-heading">
            <h2>Últimas 5 consultas</h2>

            <label className="table-search dashboard-search">
              <FiSearch />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar consulta"
              />
            </label>
          </div>

          <Table
            columns={consultaColumns}
            data={filteredConsultas.map((item, index) => ({ ...item, id: item.id || `${item.fechaConsulta}-${index}` }))}
            showSearch={false}
            pageSize={5}
            emptyMessage="No hay consultas registradas"
          />
        </article>

        <article className="dashboard-card">
          <div className="section-heading">
            <div>
              <h2>Personal de turno activo</h2>
            </div>
          </div>

          <div className="shift-list">
            {activePersonal.length === 0 ? (
              <div className="section-empty" style={{ padding: '2rem', textAlign: 'center' }}>
                No hay personal activo registrado.
              </div>
            ) : (
              activePersonal.map((persona) => {
                const nombre = `${persona?.usuario?.nombres ?? ''} ${persona?.usuario?.apellidoPaterno ?? ''}`.trim()
                const especialidad = persona?.especialidad?.nombre || 'Sin especialidad'
                const shiftNames = persona?.horarioMeses?.map((hm) => hm?.horario?.turno?.nombre).filter(Boolean) || []
                const turno = shiftNames.length > 0 ? [...new Set(shiftNames)].join(', ') : 'General'

                return (
                  <div className="shift-item" key={persona.id}>
                    <div>
                      <strong>{nombre || 'Sin nombre'}</strong>
                      <span>{especialidad}</span>
                    </div>
                    <div className="shift-item__meta">
                      <Badge status="activo">{turno}</Badge>
                      <span className="shift-item__clock">
                        <FiClock />
                        Vigente
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </article>
      </section>

      <p className="dashboard-page__footer">Última actualización: {formatDateTimeShort(new Date())}</p>
    </main>
  )
}