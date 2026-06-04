import { useMemo, useState } from 'react'
import { FiActivity, FiBriefcase, FiClock, FiSearch, FiUserCheck, FiUsers } from 'react-icons/fi'
import Badge from '../../components/common/Badge.jsx'
import Table from '../../components/common/Table.jsx'
import StatCard from '../../components/dashboard/StatCard.jsx'
import { APP_NAME } from '../../utils/constants.js'
import { formatDateTimeShort } from '../../utils/formatDate.js'

const stats = [
  {
    label: 'Consultas hoy',
    value: 5,
    icon: <FiActivity />,
    accent: 'primary',
    helper: 'Atenciones registradas en el día',
  },
  {
    label: 'Pacientes registrados',
    value: 20,
    icon: <FiUsers />,
    accent: 'info',
    helper: 'Base de pacientes activa',
  },
  {
    label: 'Personal activo',
    value: 3,
    icon: <FiUserCheck />,
    accent: 'success',
    helper: 'Profesionales de turno',
  },
  {
    label: 'Empresas activas',
    value: 2,
    icon: <FiBriefcase />,
    accent: 'warning',
    helper: 'Clientes con contratos vigentes',
  },
]

const consultas = [
  { hora: '08:15', paciente: 'Carlos Ortega', medico: 'Dra. Laura Ramos', estado: 'Concluida' },
  { hora: '09:10', paciente: 'María Paredes', medico: 'Dr. Iván Torres', estado: 'En curso' },
  { hora: '10:05', paciente: 'Jorge Silva', medico: 'Dra. Laura Ramos', estado: 'Programada' },
  { hora: '11:20', paciente: 'Ana Medina', medico: 'Dra. Patricia Vega', estado: 'Concluida' },
  { hora: '12:00', paciente: 'Luis Herrera', medico: 'Dr. Iván Torres', estado: 'Pendiente' },
]

const turnoHoy = [
  { nombre: 'Dra. Laura Ramos', especialidad: 'Medicina Ocupacional', turno: 'Mañana', estado: 'ACTIVO' },
  { nombre: 'Dr. Iván Torres', especialidad: 'Evaluación Clínica', turno: 'Tarde', estado: 'ACTIVO' },
  { nombre: 'Lic. Patricia Vega', especialidad: 'Enfermería', turno: 'Mañana', estado: 'ACTIVO' },
]

const consultaColumns = [
  { header: 'Hora', accessor: 'hora' },
  { header: 'Paciente', accessor: 'paciente' },
  { header: 'Médico', accessor: 'medico' },
  {
    header: 'Estado',
    accessor: 'estado',
    render: (value) => <Badge status={value}>{value}</Badge>,
  },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConsultas = useMemo(() => {
    if (!searchTerm.trim()) {
      return consultas
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()

    return consultas.filter((row) =>
      consultaColumns.some((column) => {
        const rawValue = typeof column.accessor === 'function' ? column.accessor(row) : row?.[column.accessor]
        return String(rawValue ?? '').toLowerCase().includes(normalizedSearch)
      }),
    )
  }, [searchTerm])

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
            <h2>Últimas 5 consultas del día</h2>

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
            data={filteredConsultas.map((item, index) => ({ ...item, id: `${item.hora}-${index}` }))}
            showSearch={false}
            pageSize={5}
          />
        </article>

        <article className="dashboard-card">
          <div className="section-heading">
            <div>
              <h2>Personal de turno hoy</h2>
            </div>
          </div>

          <div className="shift-list">
            {turnoHoy.map((persona) => (
              <div className="shift-item" key={persona.nombre}>
                <div>
                  <strong>{persona.nombre}</strong>
                  <span>{persona.especialidad}</span>
                </div>
                <div className="shift-item__meta">
                  <Badge status={persona.estado}>{persona.turno}</Badge>
                  <span className="shift-item__clock">
                    <FiClock />
                    Turno vigente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <p className="dashboard-page__footer">Última actualización: {formatDateTimeShort(new Date())}</p>
    </main>
  )
}