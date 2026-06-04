import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { ROLES } from '../../utils/constants.js'
import MaestroTab from '../../components/configuracion/MaestroTab.jsx'

const tabs = [
  { key: 'roles', label: 'Roles', endpoint: 'roles', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'sectores', label: 'Sectores', endpoint: 'sectores', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'especialidades', label: 'Especialidades', endpoint: 'especialidades', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'documentos', label: 'Documentos', endpoint: 'documentos', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'contratos', label: 'Contratos', endpoint: 'contratos', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'turnos', label: 'Turnos', endpoint: 'turnos', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'estados', label: 'Estados', endpoint: 'estados', entityType: 'simple', fields: [{ nombre: 'nombre', label: 'Nombre', tipo: 'text', requerido: true }] },
  { key: 'horarios', label: 'Horarios', endpoint: 'horarios', entityType: 'horarios', fields: [] },
]

export default function ConfiguracionPage() {
  const { rol } = useAuth()
  const [activeTab, setActiveTab] = useState('roles')

  const activeTabConfig = useMemo(() => tabs.find((tab) => tab.key === activeTab) ?? tabs[0], [activeTab])

  if ((rol ?? '').toString().toUpperCase() !== ROLES.ADMIN) {
    return (
      <main className="page-shell">
        <section className="page-card">
          <h1 className="page-title">No tienes permisos para acceder a esta sección</h1>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <header className="page-toolbar">
        <div>
          <h1 className="page-title">Tablas maestras</h1>
        </div>
      </header>

      <nav className="tabs-bar" aria-label="Tablas maestras">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab ? 'tab-button tab-button--active' : 'tab-button'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <MaestroTab
        titulo={activeTabConfig.label}
        endpoint={activeTabConfig.endpoint}
        campos={activeTabConfig.fields}
        entityType={activeTabConfig.entityType}
      />
    </main>
  )
}